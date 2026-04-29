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
    is_premium: bool = False
    subscription_plan: str = "free"
    promo_code_used: Optional[str] = None
    signals_received: int = 0
    joined_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Signal:
    pair: str
    direction: str  # CALL | PUT
    expiration: str
    confidence: int
    signal_type: str = "ai"
    tier: str = "otc"  # otc | exchange | elite
    analysis: Optional[str] = None
    result: Optional[str] = None  # win | loss | pending
    created_at: datetime = field(default_factory=datetime.utcnow)
    id: Optional[int] = None


CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by INTEGER REFERENCES users(telegram_id),
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_plan TEXT DEFAULT 'free',
    promo_code_used TEXT,
    signals_received INTEGER DEFAULT 0
);
"""

CREATE_SIGNALS_TABLE = """
CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pair TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('CALL', 'PUT')),
    expiration TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    signal_type TEXT DEFAULT 'ai',
    tier TEXT DEFAULT 'otc' CHECK(tier IN ('otc', 'exchange', 'elite')),
    analysis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result TEXT CHECK(result IN ('win', 'loss', 'pending'))
);
"""

CREATE_PROMO_TABLE = """
CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'trial',
    trial_days INTEGER DEFAULT 7,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""
