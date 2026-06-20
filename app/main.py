








from app.auth import get_current_user
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import Depends
from app.models import Content, ActionLog
from app.database import get_db
import json
from fastapi import FastAPI, status, HTTPException
from pydantic import BaseModel, Field
import os
import redis
from app.auth import hash_password, verify_password, create_access_token, decode_token, create_refresh_token
from app.models import User
from fastapi.security import  OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.database import engine
from app.models import Base


app = FastAPI(title="Social media analytics")


REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

class UserActionSchema(BaseModel):
    user_id: int = Field(..., example=12)
    content_id: int = Field(..., example=34)
    action_type: str = Field(..., example="like")
    duration_seconds: int = Field(0, example=20)

@app.get("/")
def read_root():
    return {"status": "perfect", "message": "Server was successfully turned on"}
    

@app.get("/analytics/{content_id}")
def get_analytics(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
    ):
    total_views = db.query(ActionLog.id).filter(ActionLog.content_id == content_id).count()

    avg_duration = db.query(
        func.avg(ActionLog.duration_seconds)
    ).filter(ActionLog.content_id == content_id).scalar()

    total_likes = db.query(ActionLog).filter(
        ActionLog.content_id == content_id,
        ActionLog.action_type == "like"
    ).count()

    return {
        "message": "successful",
        "content_id": content_id,
        "total_views": total_views,
        "avg_duration_seconds": round(avg_duration or 0, 2),
        "total_likes": total_likes
    }

class RegisterSchema(BaseModel):
    username: str = Field(..., example="bohdan")
    email: str = Field(..., example="test@gmail.com")
    password: str = Field(..., example='strongpass098')
    

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    username = db.query(User).filter(User.username == data.username).first()
    if username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    hashed_password = hash_password(data.password)
    

    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered",
            "user_id": new_user.id}


class LoginSchema(BaseModel):
    username: str = Field(..., example="bohdan")
    password: str = Field(..., example="strongpass098")
    
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User was not found"
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="password was not verified"
        )
        
        
    access_token = create_access_token(
        {"sub": user.username},
    )
    
    refresh_token = create_refresh_token(
        {"sub": user.username},
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

class RefreshSchema(BaseModel):
    refresh_token: str

@app.post("/refresh")
def refresh_access_token(data: RefreshSchema):
    decoded_token = decode_token(data.refresh_token, expected_type="refresh")
    if decoded_token == None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    access_token = create_access_token({"sub": decoded_token})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


class ContentSchema(BaseModel):
    title: str = Field(..., example="My simple code")
    tags: list[str] = Field(..., example=["python", "fastapi"])

@app.post("/contents", status_code=status.HTTP_201_CREATED)
def create_content(data: ContentSchema, db: Session = Depends(get_db)):
    new_content = Content(title=data.title, tags=data.tags)
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    
    return {"message": "Content created", "content_id": new_content.id}

@app.get("/feed/{user_id}")
def get_feed(
    user_id: int,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):

    history = db.query(ActionLog.content_id).filter(ActionLog.user_id == user_id).all()
    seen_ids = [row.content_id for row in history]
    offset = (page - 1) * limit
    
    action_logs = db.query(Content.tags).join(
        ActionLog, ActionLog.content_id == Content.id
    ).filter(
        ActionLog.user_id == user_id,
        ActionLog.action_type.in_(["like", "read_fully"])
    ).all()
    
    fav_tags = [tag for row in action_logs for tag in row.tags]
    fav_set = set(fav_tags)
    
    feed_content = db.query(Content).filter(
        Content.id.notin_(seen_ids)
    ).all()
    
    sorted_articles = sorted(
        feed_content,
        key=lambda article: len(fav_set.intersection(article.tags)),
        reverse=True
    )
    
    offset = (page - 1) * limit
    sorted_feed = sorted_articles
    paginated = sorted_feed[offset:offset+limit]
    
    return {
        "message": "successful",
        "user_id": user_id,
        "page": page,
        "limit": limit,
        "feed": paginated
    }

@app.get("/trending")
def get_trending(db: Session = Depends(get_db),
                 current_user: str = Depends(get_current_user)):
    since = datetime.utcnow() - timedelta(hours=24)
    
    results = db.query(
        ActionLog.content_id,
        func.count(ActionLog.id).label("total_actions")
        ).filter(
            ActionLog.created_at >= since
        ).group_by(
            ActionLog.content_id
        ).order_by(
            func.count(ActionLog.id).desc()
        ).limit(10).all()

    return {
        "message": "successfull",
        "trending": [
            {"content_id": row.content_id, "total_actions": row.total_actions }
            for row in results
        ]
    }    


@app.post("/analytics/track", status_code=status.HTTP_202_ACCEPTED)
async def track_action(data: UserActionSchema):
    try:
        redis_key = f"rate_limit:{data.user_id}:profile"
        count = redis_client.get(redis_key)
        
        if count and int(count)>= 100:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Try again in a minute")
        
        redis_client.incr(redis_key)
        if not count:
            redis_client.expire(redis_key, 60)

        json_string = data.model_dump_json()
        redis_client.lpush("user_actions", json_string)
        
        return {
            "status": "queued",
            "message": "Event successfully buffered"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to buffer event: {str(e)}"
        )



@app.get("/users/me")
def get_me(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="username was not found"
        )
    
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "joined": user.created_at
    }
    

@app.delete("/contents/{content_id}")
def delete_content(
    content_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    db.delete(content)
    db.commit()
    
    return {"message": "Content deleted", "content_id": content_id}

@app.get("/search")
def search_for_content(tag: str, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.tags.any(tag)).all()
    return {
        "message": "successful",
        "tag": tag,
        "results": content
    }