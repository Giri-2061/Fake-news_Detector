"""
Fake News Detection Model Training Pipeline
============================================
This script trains a Logistic Regression model to classify news as Real or Fake
using TF-IDF vectorization on an English news dataset.
"""

import pandas as pd
import numpy as np
import re
import string
import pickle
import joblib
from pathlib import Path

# Sklearn imports
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    confusion_matrix, 
    classification_report
)

# NLTK for stopwords
import nltk
nltk.download('stopwords', quiet=True)
from nltk.corpus import stopwords

# Configuration
CONFIG = {
    'true_csv': 'True.csv',
    'fake_csv': 'Fake.csv',
    'max_features': 5000,
    'test_size': 0.2,
    'random_state': 42,
    'model_path': 'models/fake_news_classifier.pkl',
    'vectorizer_path': 'models/tfidf_vectorizer.pkl',
}


def load_dataset(true_path: str, fake_path: str) -> pd.DataFrame:
    """
    Load and combine True and Fake news datasets.
    
    Args:
        true_path: Path to True.csv
        fake_path: Path to Fake.csv
    
    Returns:
        Combined DataFrame with labels (1=Real, 0=Fake)
    """
    print("📂 Loading datasets...")
    
    # Load CSVs
    true_df = pd.read_csv(true_path)
    fake_df = pd.read_csv(fake_path)
    
    # Add labels
    true_df['label'] = 1  # Real news
    fake_df['label'] = 0  # Fake news
    
    # Combine datasets
    df = pd.concat([true_df, fake_df], ignore_index=True)
    
    print(f"   ✅ Loaded {len(true_df):,} real news articles")
    print(f"   ✅ Loaded {len(fake_df):,} fake news articles")
    print(f"   ✅ Total: {len(df):,} articles")
    
    return df


def clean_text(text: str, stop_words: set) -> str:
    """
    Clean and preprocess a single text string.
    
    Args:
        text: Raw text string
        stop_words: Set of stopwords to remove
    
    Returns:
        Cleaned text string
    """
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove numbers
    text = re.sub(r'\d+', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove stopwords
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    
    return ' '.join(tokens)


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and preprocess the entire dataset.
    
    Args:
        df: Raw DataFrame with 'text' and 'label' columns
    
    Returns:
        Preprocessed DataFrame
    """
    print("\n🧹 Preprocessing data...")
    
    # Select relevant columns
    df = df[['text', 'label']].copy()
    
    # Remove missing values
    initial_len = len(df)
    df = df.dropna()
    removed = initial_len - len(df)
    if removed > 0:
        print(f"   ⚠️  Removed {removed} rows with missing values")
    
    # Shuffle the dataset
    df = df.sample(frac=1, random_state=CONFIG['random_state']).reset_index(drop=True)
    print("   ✅ Dataset shuffled")
    
    # Get English stopwords
    stop_words = set(stopwords.words('english'))
    
    # Clean text
    print("   ⏳ Cleaning text (this may take a moment)...")
    df['text_clean'] = df['text'].apply(lambda x: clean_text(x, stop_words))
    
    # Remove empty texts after cleaning
    df = df[df['text_clean'].str.len() > 0]
    
    print(f"   ✅ Preprocessing complete! Final dataset size: {len(df):,}")
    
    return df


def split_data(df: pd.DataFrame, test_size: float = 0.2):
    """
    Split data into training and testing sets.
    
    Args:
        df: Preprocessed DataFrame
        test_size: Fraction of data for testing
    
    Returns:
        X_train, X_test, y_train, y_test
    """
    print(f"\n📊 Splitting data ({int((1-test_size)*100)}% train, {int(test_size*100)}% test)...")
    
    X = df['text_clean']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=test_size, 
        random_state=CONFIG['random_state'],
        stratify=y  # Maintain class balance
    )
    
    print(f"   ✅ Training set: {len(X_train):,} samples")
    print(f"   ✅ Testing set: {len(X_test):,} samples")
    
    return X_train, X_test, y_train, y_test


def vectorize_text(X_train, X_test, max_features: int = 5000):
    """
    Convert text to TF-IDF vectors.
    
    Args:
        X_train: Training text data
        X_test: Testing text data
        max_features: Maximum number of features
    
    Returns:
        X_train_tfidf, X_test_tfidf, vectorizer
    """
    print(f"\n🔢 Vectorizing text (max {max_features:,} features)...")
    
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        ngram_range=(1, 2),  # Use unigrams and bigrams for better context
        min_df=2,  # Ignore terms that appear in less than 2 documents
        max_df=0.95,  # Ignore terms that appear in more than 95% of documents
    )
    
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    print(f"   ✅ Vocabulary size: {len(vectorizer.vocabulary_):,}")
    print(f"   ✅ Train matrix shape: {X_train_tfidf.shape}")
    print(f"   ✅ Test matrix shape: {X_test_tfidf.shape}")
    
    return X_train_tfidf, X_test_tfidf, vectorizer


def train_model(X_train_tfidf, y_train):
    """
    Train a Logistic Regression classifier.
    
    Args:
        X_train_tfidf: TF-IDF vectors for training
        y_train: Training labels
    
    Returns:
        Trained classifier
    """
    print("\n🤖 Training Logistic Regression model...")
    
    classifier = LogisticRegression(
        max_iter=1000,
        C=1.0,
        solver='lbfgs',
        n_jobs=-1,  # Use all CPU cores
        random_state=CONFIG['random_state']
    )
    
    classifier.fit(X_train_tfidf, y_train)
    print("   ✅ Model trained successfully!")
    
    return classifier


def evaluate_model(classifier, X_test_tfidf, y_test):
    """
    Evaluate the model and print metrics.
    
    Args:
        classifier: Trained classifier
        X_test_tfidf: TF-IDF vectors for testing
        y_test: True labels
    
    Returns:
        Dictionary of metrics
    """
    print("\n📈 Evaluating model...")
    
    # Predictions
    y_pred = classifier.predict(X_test_tfidf)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 MODEL EVALUATION RESULTS")
    print("=" * 50)
    print(f"\n   Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"   Precision: {precision:.4f}")
    print(f"   Recall:    {recall:.4f}")
    print(f"   F1-Score:  {f1:.4f}")
    
    print("\n📋 Confusion Matrix:")
    print(f"                 Predicted")
    print(f"                 Fake    Real")
    print(f"   Actual Fake   {conf_matrix[0][0]:5d}   {conf_matrix[0][1]:5d}")
    print(f"   Actual Real   {conf_matrix[1][0]:5d}   {conf_matrix[1][1]:5d}")
    
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Fake', 'Real']))
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'confusion_matrix': conf_matrix
    }


def save_model(classifier, vectorizer, model_path: str, vectorizer_path: str):
    """
    Save the trained model and vectorizer to disk.
    
    Args:
        classifier: Trained classifier
        vectorizer: Fitted TF-IDF vectorizer
        model_path: Path to save the model
        vectorizer_path: Path to save the vectorizer
    """
    print("\n💾 Saving model and vectorizer...")
    
    # Create models directory if it doesn't exist
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    
    # Save using joblib (more efficient for sklearn models)
    joblib.dump(classifier, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    
    print(f"   ✅ Model saved to: {model_path}")
    print(f"   ✅ Vectorizer saved to: {vectorizer_path}")


def load_model(model_path: str, vectorizer_path: str):
    """
    Load the trained model and vectorizer from disk.
    
    Args:
        model_path: Path to the saved model
        vectorizer_path: Path to the saved vectorizer
    
    Returns:
        classifier, vectorizer
    """
    classifier = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    return classifier, vectorizer


def predict_news(text: str, classifier, vectorizer, stop_words: set = None) -> dict:
    """
    Predict whether a news article is Real or Fake.
    
    Args:
        text: News article text
        classifier: Trained classifier
        vectorizer: Fitted TF-IDF vectorizer
        stop_words: Set of stopwords (optional)
    
    Returns:
        Dictionary with prediction and confidence
    """
    if stop_words is None:
        stop_words = set(stopwords.words('english'))
    
    # Clean the input text
    cleaned_text = clean_text(text, stop_words)
    
    # Vectorize
    text_tfidf = vectorizer.transform([cleaned_text])
    
    # Predict
    prediction = classifier.predict(text_tfidf)[0]
    probability = classifier.predict_proba(text_tfidf)[0]
    
    label = "REAL" if prediction == 1 else "FAKE"
    confidence = probability[prediction]
    
    return {
        'prediction': label,
        'confidence': confidence,
        'fake_probability': probability[0],
        'real_probability': probability[1]
    }


def run_training_pipeline():
    """
    Execute the complete training pipeline.
    """
    print("\n" + "=" * 60)
    print("🚀 FAKE NEWS DETECTION MODEL TRAINING PIPELINE")
    print("=" * 60)
    
    # Step 1: Load data
    df = load_dataset(CONFIG['true_csv'], CONFIG['fake_csv'])
    
    # Step 2: Preprocess
    df = preprocess_data(df)
    
    # Step 3: Split data
    X_train, X_test, y_train, y_test = split_data(df, CONFIG['test_size'])
    
    # Step 4: Vectorize
    X_train_tfidf, X_test_tfidf, vectorizer = vectorize_text(
        X_train, X_test, CONFIG['max_features']
    )
    
    # Step 5: Train
    classifier = train_model(X_train_tfidf, y_train)
    
    # Step 6: Evaluate
    metrics = evaluate_model(classifier, X_test_tfidf, y_test)
    
    # Step 7: Save model
    save_model(
        classifier, vectorizer,
        CONFIG['model_path'], CONFIG['vectorizer_path']
    )
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    
    return classifier, vectorizer, metrics


def demo_prediction(classifier, vectorizer):
    """
    Demonstrate prediction on sample texts.
    """
    print("\n" + "=" * 60)
    print("🔮 DEMO PREDICTIONS")
    print("=" * 60)
    
    sample_texts = [
        "The president announced a new policy today during a press conference at the White House.",
        "SHOCKING: Scientists discover that drinking water makes you immortal! Government hiding the truth!",
        "Stock markets closed higher today as investors reacted positively to the quarterly earnings reports.",
    ]
    
    stop_words = set(stopwords.words('english'))
    
    for i, text in enumerate(sample_texts, 1):
        result = predict_news(text, classifier, vectorizer, stop_words)
        print(f"\n📰 Sample {i}:")
        print(f"   Text: {text[:80]}...")
        print(f"   Prediction: {result['prediction']}")
        print(f"   Confidence: {result['confidence']:.2%}")


if __name__ == "__main__":
    # Run the training pipeline
    classifier, vectorizer, metrics = run_training_pipeline()
    
    # Run demo predictions
    demo_prediction(classifier, vectorizer)
