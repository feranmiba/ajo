use crate::types::{Circle, DataKey, RoundState};
use soroban_sdk::{Address, Env};

pub const INSTANCE_BUMP_AMOUNT: u32 = 500_000;
pub const PERSISTENT_BUMP_AMOUNT: u32 = 500_000;
pub const PERSISTENT_LIFETIME_THRESHOLD: u32 = 100_000;

pub fn get_circle_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::CircleCount)
        .unwrap_or(0)
}

pub fn set_circle_count(env: &Env, count: u64) {
    env.storage().instance().set(&DataKey::CircleCount, &count);
    env.storage()
        .instance()
        .extend_ttl(PERSISTENT_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn get_circle(env: &Env, circle_id: u64) -> Option<Circle> {
    let key = DataKey::Circle(circle_id);
    if let Some(circle) = env.storage().persistent().get::<DataKey, Circle>(&key) {
        env.storage().persistent().extend_ttl(
            &key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );
        Some(circle)
    } else {
        None
    }
}

pub fn set_circle(env: &Env, circle: &Circle) {
    let key = DataKey::Circle(circle.id);
    env.storage().persistent().set(&key, circle);
    env.storage().persistent().extend_ttl(
        &key,
        PERSISTENT_LIFETIME_THRESHOLD,
        PERSISTENT_BUMP_AMOUNT,
    );
}

pub fn get_round(env: &Env, circle_id: u64, round_id: u32) -> Option<RoundState> {
    let key = DataKey::Round(circle_id, round_id);
    if let Some(round) = env.storage().persistent().get::<DataKey, RoundState>(&key) {
        env.storage().persistent().extend_ttl(
            &key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );
        Some(round)
    } else {
        None
    }
}

pub fn set_round(env: &Env, round: &RoundState) {
    let key = DataKey::Round(round.circle_id, round.round_id);
    env.storage().persistent().set(&key, round);
    env.storage().persistent().extend_ttl(
        &key,
        PERSISTENT_LIFETIME_THRESHOLD,
        PERSISTENT_BUMP_AMOUNT,
    );
}

pub fn is_member_paid(env: &Env, circle_id: u64, round_id: u32, member: &Address) -> bool {
    let key = DataKey::MemberPaid(circle_id, round_id, member.clone());
    env.storage()
        .persistent()
        .get::<DataKey, bool>(&key)
        .unwrap_or(false)
}

pub fn set_member_paid(env: &Env, circle_id: u64, round_id: u32, member: &Address) {
    let key = DataKey::MemberPaid(circle_id, round_id, member.clone());
    env.storage().persistent().set(&key, &true);
    env.storage().persistent().extend_ttl(
        &key,
        PERSISTENT_LIFETIME_THRESHOLD,
        PERSISTENT_BUMP_AMOUNT,
    );
}

pub fn is_member_refunded(env: &Env, circle_id: u64, round_id: u32, member: &Address) -> bool {
    let key = DataKey::MemberRefunded(circle_id, round_id, member.clone());
    env.storage()
        .persistent()
        .get::<DataKey, bool>(&key)
        .unwrap_or(false)
}

pub fn set_member_refunded(env: &Env, circle_id: u64, round_id: u32, member: &Address) {
    let key = DataKey::MemberRefunded(circle_id, round_id, member.clone());
    env.storage().persistent().set(&key, &true);
    env.storage().persistent().extend_ttl(
        &key,
        PERSISTENT_LIFETIME_THRESHOLD,
        PERSISTENT_BUMP_AMOUNT,
    );
}
