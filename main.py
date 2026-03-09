from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cart = []

class Product(BaseModel):
    name: str
    price: float
    image: str | None = None


@app.get("/cart")
def get_cart():
    return cart


@app.post("/cart")
def add_to_cart(product: Product):
    cart.append(product.dict())
    return {"message": "Product added", "cart": cart}


@app.delete("/cart/{index}")
def remove_item(index: int):
    cart.pop(index)
    return {"message": "Removed"}