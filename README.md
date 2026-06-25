
Content Analytics API
A REST API for content tracking, user management, and analytics built with FastAPI, Redis, and Celery.
Tech Stack

FastAPI
SQLAlchemy
PostgreSQL
Redis
Celery
JWT
pytest

Prerequisites

Python 3.11+
Docker & Docker Compose

Installation

Clone the repository

bashgit clone https://github.com/your-username/content-analytics-api.git
cd content-analytics-api

Setup environment variables

bashcp .env.example .env
Edit .env:
envSECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:postgres@db:5432/analytics_db
REDIS_URL=redis://redis:6379/0

Start the stack

bashdocker compose up --build

Swagger UI: http://localhost:8080/docs

Authentication
Register
bashPOST /register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
Login
bashPOST /login
{
  "username": "john_doe",
  "password": "secure_password"
}
Use the token in subsequent requests:
bashAuthorization: Bearer <your_token>
API Endpoints
Auth
MethodEndpointAuthPOST/registerNoPOST/loginNo
Users
MethodEndpointAuthGET/api/v1/users/me🔒
Content
MethodEndpointAuthPOST/api/v1/contents🔒GET/api/v1/contents/{id}NoPATCH/api/v1/contents/{id}🔒DELETE/api/v1/contents/{id}🔒
Analytics & Feed
MethodEndpointAuthPOST/api/v1/analytics/trackNoGET/api/v1/feed/{user_id}🔒GET/api/v1/trending🔒GET/api/v1/search?tag=NoGET/healthNo
Testing
bashdocker compose exec web pytest
Project Structure
content-analytics-api/
├── app/
│   ├── main.py          # Routes & app entry point
│   ├── models.py        # User, Content, ActionLog
│   ├── database.py      # DB connection & session
│   ├── auth.py          # JWT & bcrypt
│   ├── celery_app.py    # Background flush task
│   └── logger.py        # JSON structured logger
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_analytics.py
│   └── test_feed.py
├── alembic/
│   ├── versions/
│   └── env.py
├── .env
├── .gitignore
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── seed.py
└── tests.db
Sonnet 4.6 LowClaude is AI and can make mistakes. Please double-check responses.
