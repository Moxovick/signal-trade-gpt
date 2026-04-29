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

    log_level: str = Field("INFO", env="LOG_LEVEL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
