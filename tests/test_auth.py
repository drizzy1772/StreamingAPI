










def test_register_user(client):
    
    response = client.post("/register", json={"username": "testuser", "email": "test@test.com", "password": "testpass123"})
    
    assert response.status_code == 201
    
    assert response.json()['message'] == "User registered"
    
def test_register_duplicate_username(client):
    
    client.post("/register", json={"username": "testuser", "email": "test@test.com", "password": "testpass123"})
    
    response = client.post("/register", json={"username": "testuser", "email": "test2@test.com", "password": "testpass123"})
    
    assert response.status_code == 400
    
def test_login_success(client):
    client.post("/register", json={"username": "testuser",  "email": "test@test.com", "password": "testpass123"})
    response = client.post("/login", data={"username": "testuser", "email": "test@test.com", "password": "testpass123"})

    assert response.status_code == 200
    assert "access_token" in response.json()
    
    
def test_login_wrong_password(client):
    
    client.post("/register", json={"username": "testuser", "email": "test@test.com", "password": "testpass123"})
    
    response = client.post('/login', data={
        "username": "testuser",
        "password": "wrong_password"
    })
    
    assert response.status_code == 401

def test_full_content_endpoint(client):
    response = client.post(
    "/register",
        json={"username": "contentuser",
              "email": "content@test.com",
              "password": "testpass123"}
    )
    login = client.post("/login", data={
        "username": "contentuser",
        "password": "testpass123"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/contents", json={
        "title": "test content",
        "tags": ["fastapi", "test"]
    })
    assert response.status_code == 201
    content_id = response.json()["content_id"]
    
    get_one = client.get(f"/api/v1/contents/{content_id}")
    assert get_one.status_code == 200
    assert get_one.json()["title"] == "test content"
    
    update = client.patch(
        f"/api/v1/contents/{content_id}",
        json={"title": "updated title"},
        headers=headers
    )
    assert update.status_code == 200
    assert update.json()["title"] == "updated title"
    
    
    delete = client.delete(
        f"/api/v1/contents/{content_id}",
        headers=headers
    )
    assert delete.status_code == 200
    
    get_after_delete = client.get(f"/api/v1/contents/{content_id}")
    assert get_after_delete.status_code == 404