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
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime

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



model = None
vectorizer = None
stop_words = None


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


class TextWithSourceInput(BaseModel):
    """Request model for text prediction with source information."""
    text: str = Field(..., min_length=10, description="News article text to analyze")
    source: Optional[str] = Field(None, description="Source name or domain (e.g., 'The Kathmandu Post' or 'kathmandupost.com')")
    text_weight: Optional[float] = Field(0.7, ge=0.0, le=1.0, description="Weight for text-based prediction (0-1)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "The president announced a new policy today during a press conference.",
                "source": "The Kathmandu Post",
                "text_weight": 0.7
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


class HybridPredictionResponse(BaseModel):
    """Response model for hybrid prediction with source credibility."""
    # Final combined prediction
    prediction: str = Field(..., description="REAL or FAKE")
    confidence: float = Field(..., description="Final adjusted confidence (0-1)")
    fake_probability: float = Field(..., description="Final adjusted fake probability")
    real_probability: float = Field(..., description="Final adjusted real probability")
    
    # Text-based prediction details
    text_prediction: str = Field(..., description="Text-only prediction")
    text_confidence: float = Field(..., description="Text-only confidence")
    text_fake_probability: float = Field(..., description="Text-based fake probability")
    text_real_probability: float = Field(..., description="Text-based real probability")
    
    # Source information
    source_name: str = Field(..., description="Identified source name")
    source_score: float = Field(..., description="Source credibility score (0-1)")
    source_known: bool = Field(..., description="Whether source is in our database")
    source_type: str = Field(..., description="Type of source")
    
    # Weights used
    text_weight: float = Field(..., description="Weight given to text prediction")
    source_weight: float = Field(..., description="Weight given to source credibility")
    
    # Additional info
    text_length: int = Field(..., description="Length of processed text")
    adjustment_applied: str = Field(..., description="Description of how source affected prediction")


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
    Predict whether news is real or fake (text-only).
    
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


def predict_news_with_source(
    text: str, 
    source: Optional[str] = None,
    text_weight: float = 0.7
) -> dict:
    """
    Predict whether news is real or fake, incorporating source credibility.
    
    The final probability is calculated as:
    - final_real_prob = (text_weight * text_real_prob) + (source_weight * source_score)
    - final_fake_prob = 1 - final_real_prob
    
    Args:
        text: News article text
        source: Source name or domain (optional)
        text_weight: Weight for text-based prediction (0-1), source_weight = 1 - text_weight
    
    Returns:
        Dictionary with combined prediction results
    """
    # Get text-based prediction
    text_result = predict_news(text)
    
    # Get source credibility
    source_weight = 1.0 - text_weight
    
    if source:
        # Try to find source in database by name or domain
        source_info = get_source_info(source.lower().replace("www.", ""))
        
        # If not found by domain, try to match by name
        if not source_info["known"]:
            # Search by name in ALL_SOURCES
            for domain, info in ALL_SOURCES.items():
                if source.lower() in info.get("name", "").lower() or info.get("name", "").lower() in source.lower():
                    source_info = {"known": True, **info}
                    break
    else:
        # Unknown source defaults to neutral
        source_info = {
            "known": False,
            "score": 0.5,
            "name": "Unknown Source",
            "type": "unknown"
        }
    
    source_score = source_info["score"]
    source_name = source_info.get("name", source or "Unknown Source")
    source_known = source_info["known"]
    source_type = source_info.get("type", "unknown")
    
    # Text-based probabilities
    text_fake_prob = text_result["fake_probability"]
    text_real_prob = text_result["real_probability"]
    
    # Calculate adjusted probabilities
    # Higher source_score means more credible, so it increases real probability
    # Formula: 
    # - For a credible source (score=0.85), we want to boost real probability
    # - For an unreliable source (score=0.1), we want to boost fake probability
    
    # Convert source_score to source_real_prob (credible source = high real prob)
    source_real_prob = source_score
    source_fake_prob = 1.0 - source_score
    
    # Weighted combination
    final_real_prob = (text_weight * text_real_prob) + (source_weight * source_real_prob)
    final_fake_prob = (text_weight * text_fake_prob) + (source_weight * source_fake_prob)
    
    # Normalize to ensure they sum to 1
    total = final_real_prob + final_fake_prob
    final_real_prob = final_real_prob / total
    final_fake_prob = final_fake_prob / total
    
    # Determine final prediction
    if final_real_prob >= final_fake_prob:
        final_prediction = "REAL"
        final_confidence = final_real_prob
    else:
        final_prediction = "FAKE"
        final_confidence = final_fake_prob
    
    # Generate adjustment description
    if source_known:
        if source_score >= 0.8:
            if text_result["prediction"] == "FAKE" and final_prediction == "REAL":
                adjustment = f"Source credibility ({source_score:.0%}) overrode text prediction, changing FAKE to REAL"
            elif text_result["prediction"] == "FAKE":
                adjustment = f"Source credibility ({source_score:.0%}) reduced fake confidence"
            else:
                adjustment = f"Credible source ({source_score:.0%}) reinforced real prediction"
        elif source_score <= 0.3:
            if text_result["prediction"] == "REAL" and final_prediction == "FAKE":
                adjustment = f"Low source credibility ({source_score:.0%}) overrode text prediction, changing REAL to FAKE"
            elif text_result["prediction"] == "REAL":
                adjustment = f"Low source credibility ({source_score:.0%}) reduced real confidence"
            else:
                adjustment = f"Unreliable source ({source_score:.0%}) reinforced fake prediction"
        else:
            adjustment = f"Moderate source credibility ({source_score:.0%}) applied"
    else:
        adjustment = "Unknown source - neutral credibility (0.5) applied"
    
    return {
        # Final combined prediction
        "prediction": final_prediction,
        "confidence": round(final_confidence, 4),
        "fake_probability": round(final_fake_prob, 4),
        "real_probability": round(final_real_prob, 4),
        
        # Text-based prediction details
        "text_prediction": text_result["prediction"],
        "text_confidence": round(text_result["confidence"], 4),
        "text_fake_probability": round(text_fake_prob, 4),
        "text_real_probability": round(text_real_prob, 4),
        
        # Source information
        "source_name": source_name,
        "source_score": source_score,
        "source_known": source_known,
        "source_type": source_type,
        
        # Weights used
        "text_weight": text_weight,
        "source_weight": source_weight,
        
        # Additional info
        "text_length": text_result["text_length"],
        "adjustment_applied": adjustment
    }


# ============== API Endpoints ==============

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Fake News Detection API",
        "version": "2.1.0",
        "docs": "/docs",
        "endpoints": {
            "predict_text": "/predict-text",
            "predict_with_source": "/predict-with-source",
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
    Predict whether a news article is real or fake (text-only, no source adjustment).
    
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


@app.post("/predict-with-source", response_model=HybridPredictionResponse, tags=["Prediction"])
async def predict_with_source_endpoint(input_data: TextWithSourceInput):
    """
    Predict whether a news article is real or fake, incorporating source credibility.
    
    This endpoint combines:
    1. **Text-based ML prediction** (using the trained model)
    2. **Source credibility score** (from our database of known sources)
    
    The final probability is calculated as a weighted combination:
    - `final_real_prob = (text_weight × text_real_prob) + (source_weight × source_score)`
    
    **Parameters:**
    - **text**: The news article text to analyze (minimum 10 characters)
    - **source**: Source name or domain (e.g., "The Kathmandu Post", "kathmandupost.com")
    - **text_weight**: Weight for text-based prediction (0-1), default 0.7 (70% text, 30% source)
    
    **Example:**
    - Text predicts 66% fake probability
    - Source is "The Kathmandu Post" (credibility score: 0.85)
    - With default weights (70/30):
      - Final fake prob = 0.7 × 0.66 + 0.3 × 0.15 = 0.507
      - Final real prob = 0.7 × 0.34 + 0.3 × 0.85 = 0.493
    - The credible source reduces the fake probability!
    
    Returns detailed prediction with both text-based and source-adjusted scores.
    """
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        result = predict_news_with_source(
            text=input_data.text,
            source=input_data.source,
            text_weight=input_data.text_weight
        )
        return HybridPredictionResponse(**result)
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
        
        # 4. Hybrid prediction (text + source)
        # Use 70% text, 30% source weight for URL analysis
        hybrid_result = predict_news_with_source(
            text=article["text"],
            source=domain,
            text_weight=0.7
        )
        
        # 5. Calculate overall credibility score
        # Now uses the hybrid prediction which already incorporates source
        source_score = source_info["score"]
        ml_score = hybrid_result["real_probability"]  # Use adjusted probability
        content_penalty = content_analysis["credibility_penalty"]
        
        # Weighted combination for overall credibility
        # Since hybrid already incorporates source, adjust weights
        overall_credibility = (
            ml_score * 0.7 +      # 70% hybrid ML+source prediction
            (1 - content_penalty) * 0.3  # 30% content quality
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
            ml_prediction=hybrid_result["prediction"],  # Use hybrid prediction
            ml_confidence=round(hybrid_result["confidence"], 3),
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


# ============== Nepal News Feed ==============

class NewsItem(BaseModel):
    title: str
    link: str
    published: Optional[str] = None
    source: str
    image: Optional[str] = None
    description: Optional[str] = None

class NewsFeedResponse(BaseModel):
    success: bool
    articles: List[NewsItem]
    source_count: int

# Nepal news RSS feeds
NEPAL_RSS_FEEDS = [
    {"url": "https://thehimalayantimes.com/feed/", "name": "The Himalayan Times"},
    {"url": "https://kathmandupost.com/rss/latest", "name": "The Kathmandu Post"},
    {"url": "https://www.onlinekhabar.com/feed", "name": "Online Khabar"},
]

async def fetch_rss_feed(url: str, source_name: str, limit: int = 5) -> List[NewsItem]:
    """Fetch and parse RSS feed from a news source."""
    articles = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, follow_redirects=True)
            if response.status_code != 200:
                return articles
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            # Find all items (RSS 2.0 format)
            items = root.findall('.//item')[:limit]
            
            # Define namespace for media elements
            namespaces = {
                'media': 'http://search.yahoo.com/mrss/',
                'content': 'http://purl.org/rss/1.0/modules/content/'
            }
            
            for item in items:
                title_elem = item.find('title')
                link_elem = item.find('link')
                pub_date_elem = item.find('pubDate')
                desc_elem = item.find('description')
                
                if title_elem is not None and link_elem is not None:
                    # Parse and format the date
                    pub_date = None
                    if pub_date_elem is not None and pub_date_elem.text:
                        try:
                            # Try parsing common RSS date formats
                            date_str = pub_date_elem.text
                            for fmt in ["%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"]:
                                try:
                                    dt = datetime.strptime(date_str.strip(), fmt)
                                    pub_date = dt.strftime("%b %d, %Y")
                                    break
                                except ValueError:
                                    continue
                            if not pub_date:
                                pub_date = date_str[:16]  # Fallback: first 16 chars
                        except:
                            pass
                    
                    # Try to find image URL from various RSS formats
                    image_url = None
                    
                    # Try direct image element (OnlineKhabar uses this)
                    image_elem = item.find('image')
                    if image_elem is not None and image_elem.text:
                        image_url = image_elem.text.strip()
                    
                    # Try media:content
                    if not image_url:
                        media_content = item.find('media:content', namespaces)
                        if media_content is not None:
                            image_url = media_content.get('url')
                    
                    # Try media:thumbnail
                    if not image_url:
                        media_thumb = item.find('media:thumbnail', namespaces)
                        if media_thumb is not None:
                            image_url = media_thumb.get('url')
                    
                    # Try enclosure
                    if not image_url:
                        enclosure = item.find('enclosure')
                        if enclosure is not None and enclosure.get('type', '').startswith('image'):
                            image_url = enclosure.get('url')
                    
                    # Try to extract from description HTML
                    if not image_url and desc_elem is not None and desc_elem.text:
                        img_match = re.search(r'<img[^>]+src=["\']([^"\'>]+)["\']', desc_elem.text)
                        if img_match:
                            image_url = img_match.group(1)
                    
                    # Get description text (strip HTML)
                    description = None
                    if desc_elem is not None and desc_elem.text:
                        # Remove HTML tags
                        desc_text = re.sub(r'<[^>]+>', '', desc_elem.text)
                        description = desc_text.strip()[:150] + '...' if len(desc_text.strip()) > 150 else desc_text.strip()
                    
                    articles.append(NewsItem(
                        title=title_elem.text.strip() if title_elem.text else "No title",
                        link=link_elem.text.strip() if link_elem.text else "",
                        published=pub_date,
                        source=source_name,
                        image=image_url,
                        description=description
                    ))
    except Exception as e:
        print(f"Error fetching {source_name}: {e}")
    
    return articles

@app.get("/news-feed", response_model=NewsFeedResponse)
async def get_nepal_news(limit: int = 5):
    """
    Fetch latest news from trusted Nepali news sources.
    Returns a combined feed from multiple sources.
    """
    all_articles = []
    successful_sources = 0
    
    for feed in NEPAL_RSS_FEEDS:
        articles = await fetch_rss_feed(feed["url"], feed["name"], limit=limit)
        if articles:
            all_articles.extend(articles)
            successful_sources += 1
    
    # Sort by source to mix them up, or you could sort by date if available
    return NewsFeedResponse(
        success=len(all_articles) > 0,
        articles=all_articles[:limit * 3],  # Return up to 15 articles total
        source_count=successful_sources
    )


# ============== Run Server ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
