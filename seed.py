import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"

async def test_connection():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["TrainHubDB"]
    print("✅ Connected to MongoDB:", await db.list_collection_names())

if __name__ == "__main__":
    asyncio.run(test_connection())
