from pydantic_settings import BaseSettings
from pydantic import Field, model_validator


class Settings(BaseSettings):
    bot_token: str = Field(..., env="BOT_TOKEN")
    channel_id: int = Field(..., env="CHANNEL_ID")

    database_url: str = Field("", env="DATABASE_URL")

    pocket_option_url: str = Field(
        "https://po-ru4.click/register?utm_campaign=825519&utm_source=affiliate&utm_medium=sr&a=Be8CXM52oc4EOp&al=1769855&ac=signal&cid=960046&code=WELCOME50",
        env="POCKET_OPTION_URL",
    )

    # Public URL of the web platform (used in onboarding links etc.).
    site_url: str = Field("https://spacesignal.net", env="SITE_URL")

    # Public URL of the Telegram Mini App (root /tma route on the web platform).
    # Empty disables Mini App buttons in the bot.
    webapp_url: str = Field(
        "",
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
    pocketoption_api_token: str = Field("", env="POCKETOPTION_API_TOKEN")
    pocketoption_partner_id: str = Field("", env="POCKETOPTION_PARTNER_ID")

    # Analysis animation delay (seconds) before showing signal
    analysis_delay_min: int = Field(5, env="ANALYSIS_DELAY_MIN")
    analysis_delay_max: int = Field(20, env="ANALYSIS_DELAY_MAX")

    log_level: str = Field("INFO", env="LOG_LEVEL")

    @model_validator(mode="after")
    def _check_required(self) -> "Settings":
        if not self.bot_token or not isinstance(self.bot_token, str):
            raise ValueError("BOT_TOKEN must be a non-empty string")
        if self.channel_id == 0:
            raise ValueError("CHANNEL_ID must be set to a non-zero value")
        return self

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
