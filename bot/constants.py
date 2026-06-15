"""Shared constants for the SpaceSignal bot."""

# 3-tier model: Free (0), Basic (1), Pro (2).
TIER_NAMES: dict[int, str] = {0: "Free", 1: "Basic", 2: "Pro"}

TIER_DEPOSIT_THRESHOLDS: dict[int, int] = {
    1: 20,
    2: 100,
}

# Daily signal limits per tier. None = unlimited.
TIER_DAILY_LIMITS: dict[int, int | None] = {0: 3, 1: 10, 2: None}

# Signal types available per tier.
TIER_SIGNAL_TYPES: dict[int, list[str]] = {
    0: ["otc"],
    1: ["otc", "exchange"],
    2: ["otc", "exchange", "elite"],
}
