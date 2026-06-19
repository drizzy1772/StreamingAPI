




import json
import os
from celery import Celery
import redis as redis_lib
from app.database import SessionLocal
from app.models import ActionLog

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.beat_schedule = {
    "flush-redis-logs-every-minute": {
        "task": "app.celery_app.flush_logs_to_db",
        "schedule": 60.0,
    }
}


@celery_app.task
def flush_logs_to_db():
    redis_url = redis_lib.Redis.from_url(REDIS_URL, decode_responses=True)

    all_items = redis_url.lrange("user_actions", 0, -1)
    
    redis_url.delete("user_actions")

    if not all_items:
        return "No logs to process"
    
    parsed_items = [json.loads(item) for item in all_items]


    db = SessionLocal()
    try:
        for item in parsed_items:
            log_entry = ActionLog(
                user_id=item.get('user_id'),
                content_id=item.get('content_id'),
                action_type=item.get('action_type'),
                duration_seconds=item.get('duration_seconds', 0),
            )
            db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
        
    return f"Flushed {len(parsed_items)} logs to Postgres"