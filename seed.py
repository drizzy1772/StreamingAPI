

from app.database import SessionLocal
from app.models import Content
import random

TAGS = ["python", "javascript", "webdev", "go", "ai", "databases"]

db = SessionLocal()

for i in range(50):
    print(f"Processing loops {i + 1}")

    random_tag = random.choice(TAGS)
    title = f"Article about {random_tag} #{i}"
    result = random.sample(TAGS, random.randint(1, 3))

    print(title)

    new_content = Content(title=title, tags=result)
    db.add(new_content)
    
    
db.commit()
db.close()
print("Created 50 articles")