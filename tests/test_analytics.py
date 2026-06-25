






from unittest.mock import patch

def mock_push(key, value):
    print(f"Record was noted in Redis! Key: {key}, Values: {value}")
    return 1
    
def test_track_action_(client):
    with patch("redis.Redis.from_url") as mock_redis_factory:
        
        mock_client = mock_redis_factory.return_value
        
        mock_client.lpush.side_effect = mock_push
        mock_client.rpush.side_effect = mock_push
        
        
    response = client.post("/api/v1/analytics/track", json={
        "user_id": 1,
        "content_id": 1,
        "action_type": "like",
        "duration_seconds": 30
    })
    assert response.status_code == 202, f"mistake server {response.text}"
    assert response.json()["status"] == "queued"

def test_get_user_profile(client):
    client.post("/register", json={
        "username": "profileuser",
        "email": "profile@test.com",
        "password": "testpass123"
    })
    
    login = client.post("/login", data={
        "username": "profileuser",
        "password": "testpass123"
    })
    
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert "username" in response.json()

def test_get_user_profile_unauthorized(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    
def test_trending(client):
    client.post("/register", json={
        "username": "trendiuser",
        "email": "trend@mail.com",
        "password": "testpass123"
    })
    
    login = client.post("/login", data={
        "username": "trendiuser",
        "password": "testpass123"
    })
    
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/trending", headers=headers)
    assert response.status_code == 200
    assert "trending" in response.json()