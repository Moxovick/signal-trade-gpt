"""Shared constants for the Signal Trade GPT bot."""

# 2-tier модель v2.2: T0 (Обычный, безлим OTC) и T1+ (Про, безлим всё).
# Ключи T2-T4 сохранены для бэк-компата (см. web-platform/src/lib/tier.ts).
TIER_NAMES: dict[int, str] = {0: "Обычный", 1: "Про", 2: "Про", 3: "Про", 4: "Про"}

_UNREACHABLE_THRESHOLD: int = 9_007_199_254_740_991
TIER_DEPOSIT_THRESHOLDS: dict[int, int] = {
    1: 20,
    2: _UNREACHABLE_THRESHOLD,
    3: _UNREACHABLE_THRESHOLD,
    4: _UNREACHABLE_THRESHOLD,
}
