
[README.md](https://github.com/user-attachments/files/29341786/README.md)
# Content Analytics API

A REST API for content tracking, user management, and analytics built with FastAPI, Redis, and Celery.

## Tech Stack

- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Redis**
- **Celery**
- **JWT**
- **pytest**

## Prerequisites

- Python 3.11+
- Docker & Docker Compose

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/content-analytics-api.git
cd content-analytics-api
```

2. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:postgres@db:5432/analytics_db
REDIS_URL=redis://redis:6379/0
```

3. **Start the stack**
```bash
docker compose up --build
```

- **Swagger UI**: http://localhost:8080/docs

## Authentication

### Register
```bash
POST /register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Login
```bash
POST /login
{
  "username": "john_doe",
  "password": "secure_password"
}
```

Use the token in subsequent requests:
```bash
Authorization: Bearer <your_token>
```

## API Endpoints

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/register` | No |
| POST | `/login` | No |

### Users
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/users/me` | 🔒 |

### Content
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/v1/contents` | 🔒 |
| GET | `/api/v1/contents/{id}` | No |
| PATCH | `/api/v1/contents/{id}` | 🔒 |
| DELETE | `/api/v1/contents/{id}` | 🔒 |

### Analytics & Feed
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/v1/analytics/track` | No |
| GET | `/api/v1/feed/{user_id}` | 🔒 |
| GET | `/api/v1/trending` | 🔒 |
| GET | `/api/v1/search?tag=` | No |
| GET | `/health` | No |

## Testing

```bash
docker compose exec web pytest
```

## Project Structure

```
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
└── tests.db
```
