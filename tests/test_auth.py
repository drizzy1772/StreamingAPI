










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
    response = client.post("/login", data={"username": "testuser", "password": "testpass123"})

    assert response.status_code == 200
    assert "access_token" in response.json()
    
    
def test_login_wrong_password(client):
    
    client.post("/register", json={"username": "testuser", "email": "test@test.com", "password": "testpass123"})
    
    response = client.post('/login', data={
        "username": "testuser",
        "password": "wrong_password"
    })
    
    assert response.status_code == 401