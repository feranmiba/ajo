use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    CircleNotFound = 2,
    CircleFull = 3,
    AlreadyJoined = 4,
    NotStarted = 5,
    AlreadyStarted = 6,
    NotMember = 7,
    AlreadyPaid = 8,
    RoundNotComplete = 9,
    RoundAlreadySettled = 10,
    DeadlineNotPassed = 11,
    UnauthorizedAdmin = 12,
    InvalidAmount = 13,
    InvalidMaxMembers = 14,
    InvalidPeriod = 15,
    CircleCompleted = 16,
    CircleCancelled = 17,
    AlreadyRefunded = 18,
}
