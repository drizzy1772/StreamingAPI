





import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from unittest.mock import patch, MagicMock

from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/test_db"
    )

engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(engine)
    
    mock_redis = MagicMock()
    mock_redis.get.return_value = None
    mock_redis.incr.return_value = 1
    mock_redis.expire.return_value = True
    mock_redis.lpush.return_value = 1
    mock_redis.lrange.return_value = []
    mock_redis.delete.return_value = 1
    mock_redis.ping.return_value = True
    
    with patch('app.main.redis_client', mock_redis):
        with TestClient(app) as test_client:
            yield test_client
    
Base.metadata.drop_all(bind=engine)
