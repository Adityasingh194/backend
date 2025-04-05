# analyzer.py
import time
import json
import os
from pymongo import MongoClient
import pandas as pd
from transformers import pipeline
from collections import Counter
import re

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["eventReviews"]
collection = db["reviews"]

classifier = pipeline("sentiment-analysis", model="michellejieli/emotion_text_classifier")

def preprocessing_data(text):
    text = text.lower()
    text = re.sub(r'(?:#\w+\s*)+$', '', text)
    text = re.sub(r'#(\w+)', r'\1', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'http\S+|www.\S+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def analyze_data():
    reviews = list(collection.find())
    if not reviews:
        return

    df = pd.DataFrame(reviews)
    if 'Content' not in df.columns:
        return

    df['cleaned'] = df['Content'].apply(preprocessing_data)
    df['sentiment'] = df['cleaned'].apply(lambda x: classifier(x)[0]['label'])

    # Count sentiments
    sentiment_counts = df['sentiment'].value_counts().to_dict()

    # Extract top 5 keywords
    all_words = ' '.join(df['cleaned']).split()
    top_keywords = [word for word, count in Counter(all_words).most_common(5)]

    output_data = {
        'sentiments': sentiment_counts,
        'keywords': top_keywords,
        'timestamp': pd.Timestamp.now().isoformat()
    }

    os.makedirs("public/data", exist_ok=True)
    with open("public/data/sentiment.json", "w") as f:
        json.dump(output_data, f, indent=4)

if __name__ == "__main__":
    while True:
        analyze_data()
        print("Sentiment data updated.")
        time.sleep(60)
