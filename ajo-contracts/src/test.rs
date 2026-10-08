#![cfg(test)]

use crate::{errors::ContractError, types::CircleStatus, AjoContract, AjoContractClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env,
};

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let client = token::Client::new(env, &sac);
    let admin_client = token::StellarAssetClient::new(env, &sac);
    (sac, client, admin_client)
}

#[test]
fn test_create_circle_and_join() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, _) = create_token_contract(&env, &token_admin);

    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let amount = 100_000_000; // 10 USDC
    let period_secs = 86400; // 1 day
    let max_members = 2;

    let circle_id = client.create_circle(&admin, &token_address, &amount, &period_secs, &max_members);
    assert_eq!(circle_id, 1);

    let circle = client.get_circle(&circle_id);
    assert_eq!(circle.id, circle_id);
    assert_eq!(circle.admin, admin);
    assert_eq!(circle.token, token_address);
    assert_eq!(circle.amount, amount);
    assert_eq!(circle.period_secs, period_secs);
    assert_eq!(circle.max_members, max_members);
    assert_eq!(circle.members.len(), 1);
    assert_eq!(circle.members.get(0), Some(admin.clone()));
    assert_eq!(circle.status, CircleStatus::Created);
    assert_eq!(circle.current_round, 0);
    assert_eq!(circle.round_start_time, 0);
    assert_eq!(circle.payout_order.len(), 0);

    let initial_round = client.get_round(&circle_id, &0);
    assert_eq!(initial_round.circle_id, circle_id);
    assert_eq!(initial_round.round_id, 0);
    assert_eq!(initial_round.total_collected, 0);
    assert_eq!(initial_round.paid_members.len(), 0);
    assert!(!initial_round.is_settled);

    // Member 1 joins
    client.join(&circle_id, &member1);

    let circle_after_join = client.get_circle(&circle_id);
    assert_eq!(circle_after_join.members.len(), 2);
    assert_eq!(circle_after_join.members.get(1), Some(member1));
    assert_eq!(circle_after_join.status, CircleStatus::Created);
}

#[test]
fn test_cannot_join_after_start() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let outsider = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &50_000_000, &86400, &3);
    client.join(&circle_id, &member1);
    client.start(&circle_id);

    // Attempting to join after circle is Active must fail
    let res = client.try_join(&circle_id, &outsider);
    assert_eq!(res, Err(Ok(ContractError::AlreadyStarted)));
}

#[test]
fn test_non_member_cannot_contribute() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let outsider = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, token_admin_client) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &50_000_000, &86400, &2);
    client.start(&circle_id);

    token_admin_client.mint(&outsider, &100_000_000);

    // Non-member contribution must fail
    let res = client.try_contribute(&circle_id, &outsider);
    assert_eq!(res, Err(Ok(ContractError::NotMember)));
}

#[test]
fn test_cannot_double_contribute() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, token_admin_client) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &50_000_000, &86400, &2);
    client.join(&circle_id, &member1);
    client.start(&circle_id);

    token_admin_client.mint(&admin, &100_000_000);

    // First contribution succeeds
    client.contribute(&circle_id, &admin);

    // Second contribution in same round must fail
    let res = client.try_contribute(&circle_id, &admin);
    assert_eq!(res, Err(Ok(ContractError::AlreadyPaid)));
}

#[test]
fn test_invalid_creation_params() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    // Amount <= 0 must fail
    let res1 = client.try_create_circle(&admin, &token_address, &0, &86400, &2);
    assert_eq!(res1, Err(Ok(ContractError::InvalidAmount)));

    // Period must be nonzero
    let res_period = client.try_create_circle(&admin, &token_address, &50_000_000, &0, &2);
    assert_eq!(res_period, Err(Ok(ContractError::InvalidPeriod)));

    // Max members < 2 must fail
    let res2 = client.try_create_circle(&admin, &token_address, &50_000_000, &86400, &1);
    assert_eq!(res2, Err(Ok(ContractError::InvalidMaxMembers)));
}

#[test]
fn test_admin_cannot_move_funds_arbitrarily() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, token_client, token_admin_client) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &50_000_000, &86400, &2);
    client.join(&circle_id, &member1);
    client.start(&circle_id);

    token_admin_client.mint(&admin, &50_000_000);
    client.contribute(&circle_id, &admin);

    // Only 1 of 2 members contributed. Admin calling payout must fail!
    let res = client.try_payout(&circle_id);
    assert_eq!(res, Err(Ok(ContractError::RoundNotComplete)));

    // Admin balance should not have increased
    let admin_bal = token_client.balance(&admin);
    assert_eq!(admin_bal, 0); // 50M minted - 50M contributed = 0
}

#[test]
fn test_full_circle_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, token_client, token_admin_client) = create_token_contract(&env, &token_admin);

    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let amount = 50_000_000; // 5 USDC
    let period_secs = 3600;
    let max_members = 2;

    // Create & Join
    let circle_id = client.create_circle(&admin, &token_address, &amount, &period_secs, &max_members);
    client.join(&circle_id, &member1);

    // Mint tokens to admin and member1
    token_admin_client.mint(&admin, &100_000_000);
    token_admin_client.mint(&member1, &100_000_000);

    // Start circle
    client.start(&circle_id);
    let circle = client.get_circle(&circle_id);
    assert_eq!(circle.status, CircleStatus::Active);

    // Round 0 Contributions: Admin and Member1 contribute
    client.contribute(&circle_id, &admin);
    client.contribute(&circle_id, &member1);

    let round0 = client.get_round(&circle_id, &0);
    assert_eq!(round0.total_collected, 100_000_000); // 5 + 5 = 10 USDC

    // Payout Round 0 -> Recipient is admin (index 0)
    let admin_bal_before = token_client.balance(&admin);
    client.payout(&circle_id);
    let admin_bal_after = token_client.balance(&admin);

    assert_eq!(admin_bal_after - admin_bal_before, 100_000_000);

    // Verify advanced to Round 1
    let circle_round1 = client.get_circle(&circle_id);
    assert_eq!(circle_round1.current_round, 1);
    assert_eq!(circle_round1.status, CircleStatus::Active);

    // Round 1 Contributions
    client.contribute(&circle_id, &admin);
    client.contribute(&circle_id, &member1);

    // Payout Round 1 -> Recipient is member1 (index 1)
    let m1_bal_before = token_client.balance(&member1);
    client.payout(&circle_id);
    let m1_bal_after = token_client.balance(&member1);

    assert_eq!(m1_bal_after - m1_bal_before, 100_000_000);

    // Circle should now be Completed
    let final_circle = client.get_circle(&circle_id);
    assert_eq!(final_circle.status, CircleStatus::Completed);
}

#[test]
fn test_join_rejects_duplicate_member_and_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, _, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &100, &60, &3);
    assert_eq!(
        client.try_join(&circle_id, &admin),
        Err(Ok(ContractError::AlreadyJoined))
    );
    client.join(&circle_id, &member);
    assert_eq!(
        client.try_join(&circle_id, &member),
        Err(Ok(ContractError::AlreadyJoined))
    );

    let circle = client.get_circle(&circle_id);
    assert_eq!(circle.members.len(), 2);
    assert_eq!(circle.members.get(0), Some(admin));
    assert_eq!(circle.members.get(1), Some(member));
}

#[test]
fn test_join_rejects_member_when_circle_is_full() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let extra = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, _, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &100, &60, &2);
    client.join(&circle_id, &member);
    assert_eq!(
        client.try_join(&circle_id, &extra),
        Err(Ok(ContractError::CircleFull))
    );

    let circle = client.get_circle(&circle_id);
    assert_eq!(circle.members.len(), 2);
    assert_eq!(circle.members.get(0), Some(admin));
    assert_eq!(circle.members.get(1), Some(member));
}

#[test]
fn test_start_activates_circle_and_preserves_join_order() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|ledger| ledger.timestamp = 123_456);

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let member2 = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, _, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let circle_id = client.create_circle(&admin, &token_address, &100, &60, &3);
    client.join(&circle_id, &member1);
    client.join(&circle_id, &member2);

    assert_eq!(client.get_circle(&circle_id).status, CircleStatus::Created);
    client.start(&circle_id);

    let circle = client.get_circle(&circle_id);
    assert_eq!(circle.status, CircleStatus::Active);
    assert_eq!(circle.current_round, 0);
    assert_eq!(circle.round_start_time, 123_456);
    assert_eq!(circle.payout_order, circle.members);
    assert_eq!(circle.payout_order.get(0), Some(admin));
    assert_eq!(circle.payout_order.get(1), Some(member1));
    assert_eq!(circle.payout_order.get(2), Some(member2));

    assert_eq!(
        client.try_start(&circle_id),
        Err(Ok(ContractError::AlreadyStarted))
    );
    assert_eq!(client.get_circle(&circle_id), circle);
}

#[test]
fn test_creating_multiple_circles_assigns_distinct_ids() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, _, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let first = client.create_circle(&admin, &token_address, &100, &60, &2);
    let second = client.create_circle(&admin, &token_address, &200, &120, &3);

    assert_eq!(first, 1);
    assert_eq!(second, 2);
    assert_eq!(client.get_circle(&first).amount, 100);
    assert_eq!(client.get_circle(&second).amount, 200);
    assert_eq!(client.get_circle(&first).status, CircleStatus::Created);
    assert_eq!(client.get_circle(&second).status, CircleStatus::Created);
}
/// Only the named member may authorize a contribution, even when they have funds.
#[test]
fn test_contribute_requires_member_authorization() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, token_client, token_admin_client) =
        create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);
    let amount = 50_000_000;

    let circle_id = client.create_circle(&admin, &token_address, &amount, &60, &2);
    client.join(&circle_id, &member);
    client.start(&circle_id);
    token_admin_client.mint(&member, &amount);

    // Disable the authorization mocks used for fixture setup.
    env.set_auths(&[]);
    assert!(client.try_contribute(&circle_id, &member).is_err());
    assert_eq!(token_client.balance(&member), amount);
    assert_eq!(token_client.balance(&contract_id), 0);
    assert_eq!(client.get_round(&circle_id, &0).total_collected, 0);

    // With authorization granted, the same funded member can contribute.
    env.mock_all_auths();
    client.contribute(&circle_id, &member);
    assert!(
        env.auths().iter().any(|(address, _)| address == &member),
        "contribute must invoke member.require_auth()"
    );
    assert_eq!(token_client.balance(&member), 0);
    assert_eq!(token_client.balance(&contract_id), amount);
    assert_eq!(client.get_round(&circle_id, &0).total_collected, amount);
}

#[test]
fn test_contribution_rejects_invalid_configured_amount_and_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, token_client, token_admin_client) =
        create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    // contribute() takes no amount argument; the amount is fixed on create_circle().
    for invalid in [0, -1, -50_000_000] {
        assert_eq!(
            client.try_create_circle(&admin, &token_address, &invalid, &60, &2),
            Err(Ok(ContractError::InvalidAmount))
        );
    }

    let amount = 50_000_000;
    let circle_id = client.create_circle(&admin, &token_address, &amount, &60, &2);
    client.join(&circle_id, &member);
    client.start(&circle_id);

    // A member cannot contribute without enough SAC tokens.
    assert!(client.try_contribute(&circle_id, &member).is_err());
    assert_eq!(token_client.balance(&contract_id), 0);
    let round = client.get_round(&circle_id, &0);
    assert_eq!(round.total_collected, 0);
    assert_eq!(round.paid_members.len(), 0);

    // The failed transfer must not mark them as AlreadyPaid.
    token_admin_client.mint(&member, &amount);
    client.contribute(&circle_id, &member);
    assert_eq!(token_client.balance(&member), 0);
    assert_eq!(token_client.balance(&contract_id), amount);
    let round = client.get_round(&circle_id, &0);
    assert_eq!(round.total_collected, amount);
    assert_eq!(round.paid_members.len(), 1);
    assert_eq!(
        client.try_contribute(&circle_id, &member),
        Err(Ok(ContractError::AlreadyPaid))
    );
    assert_eq!(token_client.balance(&contract_id), amount);
}

#[test]
fn test_nonmember_contribution_does_not_move_tokens_or_change_round() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let outsider = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, token_client, token_admin_client) =
        create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);
    let amount = 75_000_000;

    let circle_id = client.create_circle(&admin, &token_address, &amount, &60, &2);
    client.start(&circle_id);
    token_admin_client.mint(&outsider, &amount);

    assert_eq!(
        client.try_contribute(&circle_id, &outsider),
        Err(Ok(ContractError::NotMember))
    );
    assert_eq!(token_client.balance(&outsider), amount);
    assert_eq!(token_client.balance(&contract_id), 0);
    let round = client.get_round(&circle_id, &0);
    assert_eq!(round.total_collected, 0);
    assert_eq!(round.paid_members.len(), 0);
}

#[test]
fn test_contribute_rejects_completed_circle_without_moving_funds() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, token_client, token_admin_client) =
        create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);
    let amount = 20_000_000;

    let circle_id = client.create_circle(&admin, &token_address, &amount, &60, &2);
    client.join(&circle_id, &member);
    client.start(&circle_id);
    token_admin_client.mint(&admin, &(amount * 2));
    token_admin_client.mint(&member, &(amount * 2));

    for _ in 0..2 {
        client.contribute(&circle_id, &admin);
        client.contribute(&circle_id, &member);
        client.payout(&circle_id);
    }

    assert_eq!(client.get_circle(&circle_id).status, CircleStatus::Completed);
    let previous_balance = token_client.balance(&admin);
    assert_eq!(token_client.balance(&contract_id), 0);

    // Contribute always addresses the current round: once the circle is
    // completed, no additional contribution is possible.
    assert_eq!(
        client.try_contribute(&circle_id, &admin),
        Err(Ok(ContractError::NotStarted))
    );
    assert_eq!(token_client.balance(&admin), previous_balance);
    assert_eq!(token_client.balance(&contract_id), 0);
    assert_eq!(client.get_circle(&circle_id).status, CircleStatus::Completed);
}

#[test]
fn test_payout_requires_full_pot_and_transfers_exact_sac_balances() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, token_client, token_admin_client) =
        create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);

    let amount = 50_000_000;
    let target_pot = amount * 2;
    let circle_id = client.create_circle(&admin, &token_address, &amount, &60, &2);
    client.join(&circle_id, &member);
    client.start(&circle_id);
    token_admin_client.mint(&admin, &(amount * 2));
    token_admin_client.mint(&member, &(amount * 2));

    client.contribute(&circle_id, &admin);
    let admin_before = token_client.balance(&admin);
    let member_before = token_client.balance(&member);
    let contract_before = token_client.balance(&contract_id);
    assert_eq!(contract_before, amount);
    assert_eq!(
        client.try_payout(&circle_id),
        Err(Ok(ContractError::RoundNotComplete))
    );
    assert_eq!(token_client.balance(&admin), admin_before);
    assert_eq!(token_client.balance(&member), member_before);
    assert_eq!(token_client.balance(&contract_id), contract_before);
    assert!(!client.get_round(&circle_id, &0).is_settled);
    assert_eq!(client.get_circle(&circle_id).current_round, 0);

    client.contribute(&circle_id, &member);
    assert_eq!(client.get_round(&circle_id, &0).total_collected, target_pot);
    assert_eq!(token_client.balance(&contract_id), target_pot);
    let recipient_before = token_client.balance(&admin);
    client.payout(&circle_id);
    assert_eq!(token_client.balance(&admin) - recipient_before, target_pot);
    assert_eq!(token_client.balance(&contract_id), 0);
    assert!(client.get_round(&circle_id, &0).is_settled);
    assert_eq!(client.get_circle(&circle_id).current_round, 1);
    assert_eq!(client.get_round(&circle_id, &1).total_collected, 0);

    // In the second round, the designated beneficiary is the joined member.
    client.contribute(&circle_id, &admin);
    client.contribute(&circle_id, &member);
    assert_eq!(token_client.balance(&contract_id), target_pot);
    let member_before_payout = token_client.balance(&member);
    client.payout(&circle_id);
    assert_eq!(
        token_client.balance(&member) - member_before_payout,
        target_pot
    );
    assert_eq!(token_client.balance(&contract_id), 0);
    assert!(client.get_round(&circle_id, &1).is_settled);
    assert_eq!(client.get_circle(&circle_id).status, CircleStatus::Completed);
}

#[test]
fn test_payout_rejects_overcollected_round_instead_of_transferring_partial_pot() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token_address, token_client, _) = create_token_contract(&env, &token_admin);
    let contract_id = env.register_contract(None, AjoContract);
    let client = AjoContractClient::new(&env, &contract_id);
    let amount = 50_000_000;
    let circle_id = client.create_circle(&admin, &token_address, &amount, &60, &2);
    client.join(&circle_id, &member);
    client.start(&circle_id);

    // Overcollection is not possible through the normal contribute API.
    // Inject inconsistent storage directly to verify the exact-equality guard.
    env.as_contract(&contract_id, || {
        let mut round = crate::storage::get_round(&env, circle_id, 0).unwrap();
        round.total_collected = amount * 2 + 1;
        crate::storage::set_round(&env, &round);
    });

    assert_eq!(
        client.try_payout(&circle_id),
        Err(Ok(ContractError::RoundNotComplete))
    );
    assert_eq!(token_client.balance(&admin), 0);
    assert_eq!(token_client.balance(&member), 0);
    assert_eq!(token_client.balance(&contract_id), 0);
    let round = client.get_round(&circle_id, &0);
    assert_eq!(round.total_collected, amount * 2 + 1);
    assert!(!round.is_settled);
    assert_eq!(client.get_circle(&circle_id).current_round, 0);
}
