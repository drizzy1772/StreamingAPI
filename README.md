
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

## Image Introduction
<img width="699" height="489" alt="Untitled Diagram drawio(15)" src="https://github.com/user-attachments/assets/680cf04e-3d04-4c84-83c6-c44d7074dbce" />



## Features

* JWT authentication with access & refresh tokens

* User registration, login, and profile

* Content CRUD with tag support

* Personalized feed based on user history & preferred tags

* Trending content (last 24h)

* Tag-based search

* Per-content analytics (views, likes, avg duration)

* User action history

* Async action logging with rate limiting (Redis → Celery → Postgres, flushed every 60s)

* Health check endpoint

* JSON structured logging

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
## API Scheme
<img width="1031" height="668" alt="Untitled(3)" src="https://github.com/user-attachments/assets/f134d819-dea2-47ea-9e80-689d926be6f4" />


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

## API Docs
Swagger UI available at: http://localhost:8080/docs

<img width="1352" height="911" alt="Screenshot 2026-06-25 at 22-27-53 Social media analytics - Swagger UI" src="https://github.com/user-attachments/assets/1246b277-f250-4de7-9941-7b80718e5d31" />


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


## Author

This project is developed by Drizzy1772.

## License

This project is licensed under MIT License.
