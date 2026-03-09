from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

cart = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/cart")
def get_cart():
    return cart


@app.post("/cart")
def add_to_cart(product: dict):
    cart.append(product)
    return {"message": "Product added to cart", "cart": cart}


@app.delete("/cart/{index}")
def remove_from_cart(index: int):
    cart.pop(index)
    return {"message": "Item removed"}