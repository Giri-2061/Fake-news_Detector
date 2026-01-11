"""
Fake News Detection API
========================
FastAPI backend for predicting fake/real news from text, URLs, or images.
Includes source credibility checking and comprehensive analysis.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from contextlib import asynccontextmanager
import joblib
import re
import string
from pathlib import Path
from typing import Optional, List
import io

# NLTK for stopwords
import nltk
nltk.download('stopwords', quiet=True)
from nltk.corpus import stopwords

# Local imports
from source_credibility import get_source_info, analyze_content_credibility, ALL_SOURCES
from url_extractor import extract_article_from_url, extract_domain, is_valid_news_url

# Optional: OCR support
try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠️ pytesseract/Pillow not available. Image prediction disabled.")


# Global variables for model and vectorizer
model = None
vectorizer = None
stop_words = None

# Paths to model artifacts
MODEL_PATH = Path(__file__).parent.parent / "models" / "fake_news_classifier.pkl"
VECTORIZER_PATH = Path(__file__).parent.parent / "models" / "tfidf_vectorizer.pkl"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and vectorizer on startup."""
    global model, vectorizer, stop_words
    
    print("🚀 Starting Fake News Detection API...")
    
    # Load model
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found at {MODEL_PATH}. Run train_model.py first!")
    
    if not VECTORIZER_PATH.exists():
        raise RuntimeError(f"Vectorizer not found at {VECTORIZER_PATH}. Run train_model.py first!")
    
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    stop_words = set(stopwords.words('english'))
    
    print("✅ Model and vectorizer loaded successfully!")
    print(f"   Model: {MODEL_PATH}")
    print(f"   Vectorizer: {VECTORIZER_PATH}")
    
    yield
    
    # Cleanup on shutdown
    print("👋 Shutting down API...")


# Initialize FastAPI app
app = FastAPI(
    title="Fake News Detection API",
    description="API for detecting fake news using machine learning",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Pydantic Models ==============

class TextInput(BaseModel):
    """Request model for text prediction."""
    text: str = Field(..., min_length=10, description="News article text to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "The president announced a new policy today during a press conference."
            }
        }


class PredictionResponse(BaseModel):
    """Response model for predictions."""
    prediction: str = Field(..., description="REAL or FAKE")
    confidence: float = Field(..., description="Confidence score (0-1)")
    fake_probability: float = Field(..., description="Probability of being fake")
    real_probability: float = Field(..., description="Probability of being real")
    text_length: int = Field(..., description="Length of processed text")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prediction": "REAL",
                "confidence": 0.95,
                "fake_probability": 0.05,
                "real_probability": 0.95,
                "text_length": 150
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    model_loaded: bool
    vectorizer_loaded: bool
    ocr_available: bool


class UrlInput(BaseModel):
    """Request model for URL verification."""
    url: str = Field(..., description="News article URL to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://kathmandupost.com/national/2024/01/15/some-news-article"
            }
        }


class SourceCredibility(BaseModel):
    """Source credibility information."""
    domain: str
    name: str
    known: bool
    score: float
    type: str
    is_reliable: bool


class ContentAnalysis(BaseModel):
    """Content analysis results."""
    clickbait_phrases: List[str]
    flags: List[str]
    credibility_penalty: float


class ComprehensiveResponse(BaseModel):
    """Response model for comprehensive URL analysis."""
    # Article info
    url: str
    title: Optional[str]
    author: Optional[str]
    date: Optional[str]
    text_preview: str
    
    # ML Prediction
    ml_prediction: str
    ml_confidence: float
    
    # Source credibility
    source: SourceCredibility
    
    # Content analysis
    content_analysis: ContentAnalysis
    
    # Overall assessment
    overall_credibility: float
    verdict: str
    recommendation: str
    trusted_sources: List[str]


# ============== Text Preprocessing ==============

def clean_text(text: str) -> str:
    """
    Clean and preprocess text exactly like during training.
    
    Args:
        text: Raw text string
    
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


def predict_news(text: str) -> dict:
    """
    Predict whether news is real or fake.
    
    Args:
        text: News article text
    
    Returns:
        Dictionary with prediction results
    """
    # Clean text
    cleaned_text = clean_text(text)
    
    if len(cleaned_text) < 5:
        raise ValueError("Text too short after preprocessing. Please provide more content.")
    
    # Vectorize
    text_tfidf = vectorizer.transform([cleaned_text])
    
    # Predict
    prediction = model.predict(text_tfidf)[0]
    probability = model.predict_proba(text_tfidf)[0]
    
    label = "REAL" if prediction == 1 else "FAKE"
    confidence = float(probability[prediction])
    
    return {
        "prediction": label,
        "confidence": confidence,
        "fake_probability": float(probability[0]),
        "real_probability": float(probability[1]),
        "text_length": len(cleaned_text)
    }


# ============== API Endpoints ==============

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Fake News Detection API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "predict_text": "/predict-text",
            "predict_url": "/predict-url",
            "predict_image": "/predict-image",
            "check_source": "/check-source",
            "health": "/health"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health and model status."""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        vectorizer_loaded=vectorizer is not None,
        ocr_available=OCR_AVAILABLE
    )


@app.post("/predict-text", response_model=PredictionResponse, tags=["Prediction"])
async def predict_text_endpoint(input_data: TextInput):
    """
    Predict whether a news article is real or fake.
    
    - **text**: The news article text to analyze (minimum 10 characters)
    
    Returns prediction (REAL/FAKE) with confidence scores.
    """
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        result = predict_news(input_data.text)
        return PredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict-url", response_model=ComprehensiveResponse, tags=["Prediction"])
async def predict_url(input_data: UrlInput):
    """
    Analyze a news article URL for authenticity.
    
    This endpoint:
    1. Extracts article content from the URL
    2. Checks source credibility
    3. Analyzes content for fake news indicators
    4. Runs ML prediction on the text
    5. Provides comprehensive assessment
    
    - **url**: The news article URL to analyze
    
    Returns comprehensive analysis with source credibility and ML prediction.
    """
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    url = input_data.url.strip()
    
    # Validate URL format
    if not is_valid_news_url(url):
        raise HTTPException(
            status_code=400, 
            detail="Invalid URL. Please provide a valid news article URL (not homepage or media files)."
        )
    
    try:
        # 1. Extract article content
        article = await extract_article_from_url(url)
        
        # 2. Get source credibility
        domain = article["domain"]
        source_info = get_source_info(domain)
        
        # 3. Analyze content for fake news indicators
        content_analysis = analyze_content_credibility(article["text"])
        
        # 4. ML prediction
        ml_result = predict_news(article["text"])
        
        # 5. Calculate overall credibility score
        source_score = source_info["score"]
        ml_score = ml_result["real_probability"]
        content_penalty = content_analysis["credibility_penalty"]
        
        # Weighted combination
        overall_credibility = (
            source_score * 0.3 +  # 30% source reputation
            ml_score * 0.5 +      # 50% ML prediction
            (1 - content_penalty) * 0.2  # 20% content quality
        )
        overall_credibility = round(overall_credibility, 3)
        
        # Determine verdict
        if overall_credibility >= 0.7:
            verdict = "LIKELY CREDIBLE"
        elif overall_credibility >= 0.5:
            verdict = "UNCERTAIN - VERIFY"
        else:
            verdict = "LIKELY NOT CREDIBLE"
        
        # Generate recommendation
        if source_info["known"] and source_info["score"] >= 0.8:
            recommendation = f"This article is from {source_info['name']}, a generally reliable source. Content analysis supports this assessment."
        elif source_info["known"] and source_info["score"] < 0.3:
            recommendation = f"Warning: {source_info['name']} is known for unreliable content. Verify this information with trusted sources."
        elif content_analysis["flags"]:
            recommendation = f"The article contains some concerning patterns: {', '.join(content_analysis['flags'][:2])}. Cross-verify with trusted sources."
        else:
            recommendation = "Consider verifying this information with established news outlets before sharing."
        
        # Trusted sources for Nepal news
        trusted_sources = [
            "https://kathmandupost.com",
            "https://www.nepalitimes.com",
            "https://thehimalayantimes.com",
            "https://www.bbc.com/nepali",
            "https://southasiacheck.org"
        ]
        
        return ComprehensiveResponse(
            url=url,
            title=article.get("title"),
            author=article.get("author"),
            date=article.get("date"),
            text_preview=article["text"][:500] + "..." if len(article["text"]) > 500 else article["text"],
            ml_prediction=ml_result["prediction"],
            ml_confidence=round(ml_result["confidence"], 3),
            source=SourceCredibility(
                domain=domain,
                name=source_info.get("name", domain),
                known=source_info["known"],
                score=source_info["score"],
                type=source_info.get("type", "unknown"),
                is_reliable=source_info["score"] >= 0.6
            ),
            content_analysis=ContentAnalysis(
                clickbait_phrases=content_analysis["clickbait_phrases"][:5],
                flags=content_analysis["flags"],
                credibility_penalty=content_analysis["credibility_penalty"]
            ),
            overall_credibility=overall_credibility,
            verdict=verdict,
            recommendation=recommendation,
            trusted_sources=trusted_sources
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/check-source/{domain}", tags=["Source Credibility"])
async def check_source(domain: str):
    """
    Check the credibility of a news source by domain.
    
    - **domain**: The domain name (e.g., 'kathmandupost.com')
    
    Returns credibility information for the source.
    """
    source_info = get_source_info(domain)
    
    return {
        "domain": domain,
        **source_info,
        "is_reliable": source_info["score"] >= 0.6,
        "recommendation": (
            "This is a known reliable source." if source_info["score"] >= 0.8
            else "This source has mixed reliability." if source_info["score"] >= 0.5
            else "Exercise caution with this source." if source_info["score"] >= 0.3
            else "This source is known for unreliable content."
        )
    }


@app.get("/sources", tags=["Source Credibility"])
async def list_sources():
    """
    List all known news sources with their credibility scores.
    
    Returns categorized list of sources.
    """
    reliable = []
    mixed = []
    unreliable = []
    
    for domain, info in ALL_SOURCES.items():
        source_data = {"domain": domain, **info}
        if info["score"] >= 0.7:
            reliable.append(source_data)
        elif info["score"] >= 0.4:
            mixed.append(source_data)
        else:
            unreliable.append(source_data)
    
    return {
        "reliable_sources": sorted(reliable, key=lambda x: x["score"], reverse=True),
        "mixed_reliability": sorted(mixed, key=lambda x: x["score"], reverse=True),
        "unreliable_sources": sorted(unreliable, key=lambda x: x["score"], reverse=True),
        "total_sources": len(ALL_SOURCES)
    }


@app.post("/predict-image", response_model=PredictionResponse, tags=["Prediction"])
async def predict_image(file: UploadFile = File(...)):
    """
    Extract text from an image using OCR and predict if it's fake news.
    
    - **file**: Image file (PNG, JPG, JPEG) containing news text
    
    Returns prediction (REAL/FAKE) with confidence scores.
    
    Note: Requires Tesseract OCR to be installed on the system.
    """
    if not OCR_AVAILABLE:
        raise HTTPException(
            status_code=501, 
            detail="OCR not available. Install pytesseract and Tesseract OCR."
        )
    
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {allowed_types}"
        )
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Extract text using OCR
        extracted_text = pytesseract.image_to_string(image)
        
        if len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract sufficient text from image"
            )
        
        # Predict
        result = predict_news(extracted_text)
        return PredictionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR/Prediction error: {str(e)}")


# ============== Run Server ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
