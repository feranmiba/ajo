#![no_std]

pub mod errors;
pub mod events;
pub mod storage;
pub mod types;

#[cfg(test)]
mod test;

use errors::ContractError;
use soroban_sdk::{contract, contractimpl, token, Address, Env, Vec};
use storage::*;
use types::*;

#[contract]
pub struct AjoContract;

#[contractimpl]
impl AjoContract {
    /// Creates a new savings circle and returns its assigned circle_id
    pub fn create_circle(
        env: Env,
        admin: Address,
        token: Address,
        amount: i128,
        period_secs: u64,
        max_members: u32,
    ) -> Result<u64, ContractError> {
        admin.require_auth();

        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        if max_members < 2 {
            return Err(ContractError::InvalidMaxMembers);
        }
        if period_secs == 0 {
            return Err(ContractError::InvalidPeriod);
        }

        let circle_id = get_circle_count(&env) + 1;
        set_circle_count(&env, circle_id);

        let mut members = Vec::new(&env);
        members.push_back(admin.clone());

        let circle = Circle {
            id: circle_id,
            admin: admin.clone(),
            token: token.clone(),
            amount,
            period_secs,
            max_members,
            status: CircleStatus::Created,
            current_round: 0,
            round_start_time: 0,
            members,
            payout_order: Vec::new(&env),
        };

        set_circle(&env, &circle);

        // Initialize Round 0 state
        let round_state = RoundState {
            circle_id,
            round_id: 0,
            total_collected: 0,
            paid_members: Vec::new(&env),
            is_settled: false,
        };
        set_round(&env, &round_state);

        events::emit_circle_created(&env, circle_id, &admin, &token, amount, max_members);

        Ok(circle_id)
    }

    /// Allows a member to join an initialized circle
    pub fn join(env: Env, circle_id: u64, member: Address) -> Result<(), ContractError> {
        member.require_auth();

        let mut circle = get_circle(&env, circle_id).ok_or(ContractError::CircleNotFound)?;

        if circle.status != CircleStatus::Created {
            return Err(ContractError::AlreadyStarted);
        }

        if circle.members.len() >= circle.max_members {
            return Err(ContractError::CircleFull);
        }

        for m in circle.members.iter() {
            if m == member {
                return Err(ContractError::AlreadyJoined);
            }
        }

        circle.members.push_back(member.clone());
        let count = circle.members.len();
        set_circle(&env, &circle);

        events::emit_member_joined(&env, circle_id, &member, count);

        Ok(())
    }

    /// Starts the circle, locking membership and setting payout order
    pub fn start(env: Env, circle_id: u64) -> Result<(), ContractError> {
        let mut circle = get_circle(&env, circle_id).ok_or(ContractError::CircleNotFound)?;

        circle.admin.require_auth();

        if circle.status != CircleStatus::Created {
            return Err(ContractError::AlreadyStarted);
        }

        // Payout order defaults to join order
        circle.payout_order = circle.members.clone();
        circle.status = CircleStatus::Active;
        circle.current_round = 0;
        circle.round_start_time = env.ledger().timestamp();

        set_circle(&env, &circle);

        events::emit_circle_started(&env, circle_id, circle.round_start_time);

        Ok(())
    }

    /// Member contributes their periodic amount for the current round
    pub fn contribute(env: Env, circle_id: u64, member: Address) -> Result<(), ContractError> {
        member.require_auth();

        let circle = get_circle(&env, circle_id).ok_or(ContractError::CircleNotFound)?;

        if circle.status != CircleStatus::Active {
            return Err(ContractError::NotStarted);
        }

        // Verify member belongs to circle
        let mut is_member = false;
        for m in circle.members.iter() {
            if m == member {
                is_member = true;
                break;
            }
        }
        if !is_member {
            return Err(ContractError::NotMember);
        }

        let round_id = circle.current_round;
        if is_member_paid(&env, circle_id, round_id, &member) {
            return Err(ContractError::AlreadyPaid);
        }

        // Transfer token (USDC / Stellar Asset Contract) from member to contract
        let token_client = token::Client::new(&env, &circle.token);
        token_client.transfer(&member, &env.current_contract_address(), &circle.amount);

        // Update RoundState
        let mut round = get_round(&env, circle_id, round_id).unwrap_or(RoundState {
            circle_id,
            round_id,
            total_collected: 0,
            paid_members: Vec::new(&env),
            is_settled: false,
        });

        round.total_collected += circle.amount;
        round.paid_members.push_back(member.clone());
        set_round(&env, &round);

        set_member_paid(&env, circle_id, round_id, &member);

        events::emit_contribution(&env, circle_id, round_id, &member, circle.amount);

        Ok(())
    }

    /// Pays out the round pot to the current recipient once all members have contributed
    pub fn payout(env: Env, circle_id: u64) -> Result<(), ContractError> {
        let mut circle = get_circle(&env, circle_id).ok_or(ContractError::CircleNotFound)?;

        if circle.status != CircleStatus::Active {
            return Err(ContractError::NotStarted);
        }

        let round_id = circle.current_round;
        let mut round = get_round(&env, circle_id, round_id).ok_or(ContractError::CircleNotFound)?;

        if round.is_settled {
            return Err(ContractError::RoundAlreadySettled);
        }

        let expected_pot = circle.amount * (circle.members.len() as i128);
        // A payout is permitted only for a fully and exactly funded round.
        if round.total_collected != expected_pot {
            return Err(ContractError::RoundNotComplete);
        }

        let recipient = circle.payout_order.get(round_id).ok_or(ContractError::CircleNotFound)?;

        // Transfer pot to current recipient
        let token_client = token::Client::new(&env, &circle.token);
        token_client.transfer(&env.current_contract_address(), &recipient, &expected_pot);

        round.is_settled = true;
        set_round(&env, &round);

        events::emit_payout(&env, circle_id, round_id, &recipient, expected_pot);

        // Advance to next round or complete circle
        if round_id + 1 < circle.members.len() {
            circle.current_round += 1;
            circle.round_start_time = env.ledger().timestamp();
            set_circle(&env, &circle);

            // Initialize state for next round
            let next_round = RoundState {
                circle_id,
                round_id: circle.current_round,
                total_collected: 0,
                paid_members: Vec::new(&env),
                is_settled: false,
            };
            set_round(&env, &next_round);
        } else {
            circle.status = CircleStatus::Completed;
            set_circle(&env, &circle);
        }

        Ok(())
    }

    /// Refund contributors if deadline passes and not all members contributed
    pub fn refund_missed_round(env: Env, circle_id: u64, member: Address) -> Result<(), ContractError> {
        member.require_auth();

        let mut circle = get_circle(&env, circle_id).ok_or(ContractError::CircleNotFound)?;

        if circle.status != CircleStatus::Active {
            return Err(ContractError::NotStarted);
        }

        let current_time = env.ledger().timestamp();
        let deadline = circle.round_start_time + circle.period_secs;
        if current_time <= deadline {
            return Err(ContractError::DeadlineNotPassed);
        }

        let round_id = circle.current_round;
        let round = get_round(&env, circle_id, round_id).ok_or(ContractError::CircleNotFound)?;

        if round.is_settled {
            return Err(ContractError::RoundAlreadySettled);
        }

        // Verify member has paid in this round
        if !is_member_paid(&env, circle_id, round_id, &member) {
            return Err(ContractError::NotMember);
        }

        // Transfer refund to member
        let token_client = token::Client::new(&env, &circle.token);
        token_client.transfer(&env.current_contract_address(), &member, &circle.amount);

        // Mark circle as cancelled due to default
        circle.status = CircleStatus::Cancelled;
        set_circle(&env, &circle);

        events::emit_refund(&env, circle_id, round_id, &member, circle.amount);

        Ok(())
    }

    /// Getter for Circle details
    pub fn get_circle(env: Env, circle_id: u64) -> Result<Circle, ContractError> {
        get_circle(&env, circle_id).ok_or(ContractError::CircleNotFound)
    }

    /// Getter for Round state
    pub fn get_round(env: Env, circle_id: u64, round_id: u32) -> Result<RoundState, ContractError> {
        get_round(&env, circle_id, round_id).ok_or(ContractError::CircleNotFound)
    }
}
