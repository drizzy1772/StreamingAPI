
[README.md](https://github.com/user-attachments/files/29341786/README.md)
# Content Analytics API

A full-stack content analytics platform built with FastAPI, PostgreSQL, Redis, Celery, Apache Kafka, and a Vanilla JavaScript frontend.

The project provides user authentication, personalized content feeds, article search and saving, content analytics, asynchronous event processing, and a responsive web interface.


## Front-End Technologies

* **HTML5**
* **CSS3**
* **Vanilla JavaScript (ES6+)**
* **Tailwind CSS**
* **Fetch API**
* **Async/Await**
* **LocalStorage**
* **Browser File API**
* **DEV.to API**
* **Google Fonts (Geist)**

## Front-End Features

* **User registration and login**
* **JWT-based authentication flow**
* **Personalized interests selection**
* **Personalized article feed**
* **Search articles by tags**
* **Search history**
* **Save and remove articles**
* **Saved articles page**
* **User profile page**
* **Avatar preview/upload**
* **Responsive UI**
* **API communication with Fetch API**
* **Persistent client-side data with LocalStorage**
* **Production API integration with Render**

## Front-End Images
<img width="1366" height="643" alt="StreamingAPI" src="https://github.com/user-attachments/assets/32b44c70-5053-4987-949f-fa081c221239" />

## Welcome Feed
<img width="1362" height="642" alt="secondpageStreamingAPI" src="https://github.com/user-attachments/assets/b16d73b6-c3d5-4723-839c-4c97df144499" />

## Stats
<img width="1366" height="645" alt="statsStreamingAPI" src="https://github.com/user-attachments/assets/1735d53c-143a-46be-8cd0-1902da838aa0" />

## Profile
<img width="1365" height="639" alt="profilepageStreamingAPI" src="https://github.com/user-attachments/assets/e2af983d-d187-4999-831a-1757c261cf32" />


## Tech Stack

- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Redis**
- **Celery**
- **Apache Kafka (aiokafka)**
- **JWT**
- **Alembic**
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

* Async event streaming and logging with rate limiting (FastAPI → Kafka / Redis → Celery → Postgres)

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
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
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


## Link on API:
## Backend: https://streamingapi-et0c.onrender.com;
## API: https://streamingapi-et0c.onrender.com/docs;
## Front-end: https://streamingapi-1-jiqr.onrender.com;
## Swagger UI: https://streamingapi-et0c.onrender.com/docs;

> **Note:** The live deployment is hosted on Render's free tier. For this demo environment, the Kafka message broker connection is gracefully bypassed. To experience the full event-streaming capabilities via Kafka, please run the project locally using Docker Compose.

## Author

This project is developed by Drizzy1772.

## License

This project is licensed under MIT License.
