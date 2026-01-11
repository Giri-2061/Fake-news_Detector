# 🛡️ FNDS - Fake News Detection System

<div align="center">



**Detect misinformation in Nepali news using AI & NLP technology**

[![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## 📖 Overview

FNDS (Fake News Detection System) is an AI-powered web application that helps users verify the authenticity of news articles. It uses machine learning (Logistic Regression with TF-IDF) trained on 44,000+ news articles to classify content as REAL or FAKE with **99.11% accuracy**.

### ✨ Key Features

- 🔗 **URL Analysis** - Paste any news article URL for comprehensive analysis
- 📷 **Image OCR** - Upload screenshots of news for text extraction and verification
- 📰 **Live Nepal News** - Real-time feed from trusted Nepali news sources
- 🏢 **Source Credibility** - Database of 47+ news sources with credibility scores
- 🎯 **Hybrid Prediction** - Combines ML text analysis with source reputation
- 🌐 **Nepal Focused** - Optimized for Nepali news sources

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Lucide React** - Icon library

### Backend
- **FastAPI** - High-performance Python API
- **scikit-learn** - Machine learning (Logistic Regression, TF-IDF)
- **NLTK** - Natural language processing
- **Tesseract OCR** - Optical character recognition
- **trafilatura** - Web article extraction

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- Python 3.10+
- Tesseract OCR (for image analysis)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nepali-news-verifier.git
cd nepali-news-verifier

# Install frontend dependencies
npm install

# Create Python virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install Python dependencies
pip install fastapi uvicorn scikit-learn nltk joblib trafilatura httpx pytesseract pillow

# Train the ML model (first time only)
python train_model.py
```

### Running the Application

```bash
# Terminal 1: Start the backend API
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8001

# Terminal 2: Start the frontend
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📊 ML Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | 99.11% |
| Training Data | 44,898 articles |
| Features | TF-IDF (5000 features, 1-2 ngrams) |
| Algorithm | Logistic Regression |

---

## 🗂️ Project Structure

```
nepali-news-verifier/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   ├── lib/                # API utilities
│   └── hooks/              # Custom hooks
├── backend/                # FastAPI backend
│   ├── app.py              # Main API
│   ├── source_credibility.py  # Source database
│   └── url_extractor.py    # URL processing
├── models/                 # Trained ML models
│   ├── fake_news_classifier.pkl
│   └── tfidf_vectorizer.pkl
├── True.csv                # Training data (real news)
├── Fake.csv                # Training data (fake news)
└── train_model.py          # Model training script
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict-text` | POST | Analyze text for fake news |
| `/predict-url` | POST | Analyze news article URL |
| `/predict-image` | POST | OCR + analyze image |
| `/predict-with-source` | POST | Hybrid prediction with source |
| `/check-source/{domain}` | GET | Check source credibility |
| `/news-feed` | GET | Fetch live Nepal news |
| `/sources` | GET | List all known sources |

---

## 📰 Supported News Sources

**Nepal Sources:**
- The Kathmandu Post, Himalayan Times, Nepali Times
- Republica, Online Khabar, Setopati
- Ratopati, eKantipur, Nagarik News
- And 30+ more...

**International Sources:**
- Reuters, AP News, BBC, CNN
- The Guardian, New York Times
- Al Jazeera, and more...

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Training data from [Kaggle Fake News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

<div align="center">

**Made with ❤️ for fighting misinformation in Nepal**

</div>
