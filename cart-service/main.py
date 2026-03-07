from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# temporary cart storage
cart_items = []

class CartItem(BaseModel):
    product_id: int
    quantity: int

@app.post("/cart/add")
def add_to_cart(item: CartItem):
    cart_items.append(item)
    return {"message": "Item added to cart", "cart": cart_items}

@app.get("/cart")
def get_cart():
    return {"cart": cart_items}