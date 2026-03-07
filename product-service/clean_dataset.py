import pandas as pd

# Load dataset
df = pd.read_csv("products.csv")

# Remove duplicate products (based on name)
df = df.drop_duplicates(subset=["name"])

# Standardize categories
def categorize(product):
    name = str(product).lower()

    if "dress" in name:
        return "Dresses"
    elif "t-shirt" in name or "tshirt" in name:
        return "T-Shirts"
    elif "top" in name:
        return "Tops"
    elif "pant" in name or "jean" in name:
        return "Bottoms"
    elif "athleisure" in name:
        return "Athleisure"
    else:
        return "Other"

# Create category column
df["category"] = df["name"].apply(categorize)

# Save cleaned dataset
df.to_csv("clean_products.csv", index=False)

print("Dataset cleaned successfully!")