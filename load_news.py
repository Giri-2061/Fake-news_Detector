import pandas as pd

# Load the CSV files
true_news = pd.read_csv('True.csv')
fake_news = pd.read_csv('Fake.csv')

# Display basic info about the datasets
print("=" * 50)
print("TRUE NEWS DATASET")
print("=" * 50)
print(f"Shape: {true_news.shape}")
print(f"\nColumns: {list(true_news.columns)}")
print(f"\nFirst 5 rows:")
print(true_news.head())

print("\n" + "=" * 50)
print("FAKE NEWS DATASET")
print("=" * 50)
print(f"Shape: {fake_news.shape}")
print(f"\nColumns: {list(fake_news.columns)}")
print(f"\nFirst 5 rows:")
print(fake_news.head())

# Add labels for classification
true_news['label'] = 1  # 1 for true news
fake_news['label'] = 0  # 0 for fake news

# Combine both datasets
combined_news = pd.concat([true_news, fake_news], ignore_index=True)

print("\n" + "=" * 50)
print("COMBINED DATASET")
print("=" * 50)
print(f"Total samples: {len(combined_news)}")
print(f"True news: {len(true_news)}")
print(f"Fake news: {len(fake_news)}")
