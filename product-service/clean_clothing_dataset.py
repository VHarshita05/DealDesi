import pandas as pd

# Load dataset
df = pd.read_csv("products.csv")

print("Original dataset size:", len(df))

# Remove duplicate rows
df = df.drop_duplicates()

# Remove duplicates by product name
df = df.drop_duplicates(subset=["name"])

# Clean product names
df["name"] = df["name"].str.strip()

# Function to categorize clothing items
def categorize_product(name):
    name = str(name).lower()

    if "dress" in name:
        return "Dresses"
    elif "tshirt" in name or "t-shirt" in name or "tee" in name:
        return "T-Shirts"
    elif "top" in name or "blouse" in name:
        return "Tops"
    elif "jeans" in name or "pant" in name or "trouser" in name:
        return "Bottoms"
    elif "shorts" in name:
        return "Shorts"
    elif "skirt" in name:
        return "Skirts"
    elif "jacket" in name or "coat" in name:
        return "Jackets"
    elif "hoodie" in name or "sweatshirt" in name:
        return "Winter Wear"
    elif "kurti" in name or "ethnic" in name or "saree" in name:
        return "Ethnic Wear"
    elif "sports" in name or "athleisure" in name:
        return "Athleisure"
    else:
        return "Other"

# Apply category function
df["category"] = df["name"].apply(categorize_product)

# Reset index
df = df.reset_index(drop=True)

print("Clean dataset size:", len(df))

# Save cleaned dataset
df.to_csv("clean_products.csv", index=False)

print("Clean dataset saved as clean_products.csv")