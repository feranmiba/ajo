use soroban_sdk::{contracttype, Address, Vec};

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum CircleStatus {
    Created = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Circle {
    pub id: u64,
    pub admin: Address,
    pub token: Address,
    pub amount: i128,
    pub period_secs: u64,
    pub max_members: u32,
    pub status: CircleStatus,
    pub current_round: u32,
    pub round_start_time: u64,
    pub members: Vec<Address>,
    pub payout_order: Vec<Address>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RoundState {
    pub circle_id: u64,
    pub round_id: u32,
    pub total_collected: i128,
    pub paid_members: Vec<Address>,
    pub is_settled: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    CircleCount,
    Circle(u64),
    Round(u64, u32),
    MemberPaid(u64, u32, Address),
    MemberRefunded(u64, u32, Address),
}
