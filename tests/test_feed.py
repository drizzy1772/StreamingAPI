










def test_feed_returns_unseen_content(client):
    login = client.post("/register", json={
        "username": "feeduser",
        "email": "feed@test.com",
        "password": "testpass123"
    })
    
    login = client.post("/login", data={
        "username": "feeduser",
        "password": "testpass123"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    client.post("/api/v1/contents", json={
        "title": "Python Guide",
        "tags": ["python", "fastapi"]
    })
    
    client.post("/api/v1/contents", json={
        "title": "Redis Guide",
        "tags": ["redis", "database"]
    })
    
    response = client.get("/api/v1/feed/1", headers=headers)
    assert response.status_code == 200
    assert "feed" in response.json()
    assert "page" in response.json()
    assert "limit" in response.json()
    
    
def test_search_by_tag(client):
    
    response = client.get("/api/v1/search?tag=python")
    assert response.status_code == 200
    assert "results" in response.json()

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "redis" in response.json()
    assert "database" in response.json()