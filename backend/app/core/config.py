from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResQSphere AI"
    API_V1_STR: str = "/api/v1"
    
    # Database (Provide a fallback default just in case .env is missed)
    DATABASE_URL: str = "postgresql+psycopg2://resqsphere_admin:supersecretpassword@localhost:5432/resqsphere"
    
    # Security
    SECRET_KEY: str = "demo_secret_key_sih_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # External APIs
    NASA_POWER_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    
    # Pydantic V2 config syntax
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()