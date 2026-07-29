





import asyncio
import json
from aiokafka import AIOKafkaConsumer
import redis
import os


KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

async def consume():
    consumer = AIOKafkaConsumer(
        "content_events",
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id="consumer_group",
        auto_offset_reset="earliest"
    )
    
    await consumer.start()
    try:
        async for msg in consumer:
            data = json.loads(msg.value.decode("utf-8"))
            redis_client.zincrby("trending_realtime", 1, data["content_id"])
    finally:
        await consumer.stop()

if __name__ == "__main__":
    asyncio.run(consume())