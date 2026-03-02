from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import datetime
import os

# === MongoDB Connection ===
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["TrainHubDB"]
bookings_collection = db["bookings"]

# === FastAPI App ===
app = FastAPI(title="TrainHub Booking API", version="1.0")

# Allow all frontend origins (you can restrict this later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Models ===
class Passenger(BaseModel):
    name: str
    age: int
    phone: str
    gender: str

class Booking(BaseModel):
    from_station: str = Field(..., alias="from")
    to_station: str = Field(..., alias="to")
    date: str
    train_name: str
    train_number: str
    departure_time: str
    price: int
    total: int
    passengers: List[Passenger]

# === Helpers ===
def booking_helper(booking) -> dict:
    return {
        "id": str(booking["_id"]),
        "from": booking["from_station"],
        "to": booking["to_station"],
        "date": booking["date"],
        "train_name": booking["train_name"],
        "train_number": booking["train_number"],
        "departure_time": booking["departure_time"],
        "price": booking["price"],
        "total": booking["total"],
        "passengers": booking["passengers"],
        "created_at": booking["created_at"],
    }

# === Routes ===
@app.get("/")
async def home():
    return {"message": "🚆 TrainHub API is running!"}

@app.post("/book")
async def create_booking(booking: Booking):
    booking_dict = booking.dict(by_alias=True)
    booking_dict["created_at"] = datetime.datetime.now()

    result = await bookings_collection.insert_one(booking_dict)
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Booking could not be saved")

    saved_booking = await bookings_collection.find_one({"_id": result.inserted_id})
    return {"message": "Booking saved successfully", "data": booking_helper(saved_booking)}

@app.get("/bookings")
async def list_bookings():
    bookings = []
    async for b in bookings_collection.find():
        bookings.append(booking_helper(b))
    return {"total": len(bookings), "bookings": bookings}

@app.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str):
    result = await bookings_collection.delete_one({"_id": ObjectId(booking_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}

# === Run Server ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
