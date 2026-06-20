from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class User:
    telegram_id: int
    username: Optional[str]
    first_name: str
    referral_code: str
    referred_by: Optional[int] = None
    # v2: tier 0..4 driven by PocketOption deposits.  `is_premium` and
    # `subscription_plan` retained for legacy users only.
    tier: int = 0
    po_trader_id: Optional[str] = None
    click_id: Optional[str] = None  # PocketOption click_id for postback attribution
    deposit_total: float = 0.0  # mirrored from web platform via tier-sync
    notifications_enabled: bool = True
    is_premium: bool = False
    subscription_plan: str = "free"
    promo_code_used: Optional[str] = None
    signals_received: int = 0
    wins: int = 0
    losses: int = 0
    joined_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Signal:
    pair: str
    direction: str  # CALL | PUT
    expiration: str
    confidence: int
    signal_type: str = "ai"
    tier: str = "otc"  # otc | exchange | elite | demo
    analysis: Optional[str] = None
    result: Optional[str] = None  # win | loss | pending
    entry_time: Optional[str] = None  # HH:MM — recommended entry time
    created_at: datetime = field(default_factory=datetime.utcnow)
    id: Optional[int] = None


# Table DDL removed — schema is managed by Prisma (web-platform/).
# Keep dataclass definitions above for the bot's internal models.
