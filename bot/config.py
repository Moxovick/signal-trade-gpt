from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    bot_token: str = Field(..., env="BOT_TOKEN")
    channel_id: int = Field(..., env="CHANNEL_ID")

    signal_interval_min: int = Field(5, env="SIGNAL_INTERVAL_MIN")
    signal_interval_max: int = Field(15, env="SIGNAL_INTERVAL_MAX")
    working_hours_start: int = Field(8, env="WORKING_HOURS_START")
    working_hours_end: int = Field(22, env="WORKING_HOURS_END")

    database_url: str = Field("sqlite+aiosqlite:///data/bot.db", env="DATABASE_URL")

    pocket_option_url: str = Field("https://pocketoption.com", env="POCKET_OPTION_URL")

    # Public URL of the Telegram Mini App (root /tma route on the web platform).
    # Empty disables Mini App buttons in the bot.
    webapp_url: str = Field(
        "https://signal-trade-gpt.vercel.app/tma",
        env="WEBAPP_URL",
    )

    # Phase J — sync with the web platform's PocketOption account state.
    # Both must be set or the tier-sync loop is disabled.
    platform_api_url: str = Field("", env="PLATFORM_API_URL")
    bot_sync_secret: str = Field("", env="BOT_SYNC_SECRET")

    # Phase L — admin commands inside the bot. Comma-separated telegram_ids.
    admin_ids: str = Field("", env="ADMIN_IDS")

    # Phase Q — PocketOption Affiliate API direct-query credentials.
    # Both must be set to enable live trader-info lookup.
    pocket_option_api_token: str = Field("", env="POCKETOPTION_API_TOKEN")
    pocket_option_partner_id: str = Field("", env="POCKETOPTION_PARTNER_ID")

    log_level: str = Field("INFO", env="LOG_LEVEL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
