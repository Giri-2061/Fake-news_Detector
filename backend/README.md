# Fake News Detection Backend

## Setup

1. Make sure you have trained the model first:
   ```bash
   python train_model.py
   ```

2. Install dependencies (if not already installed):
   ```bash
   pip install fastapi uvicorn python-multipart
   ```

3. (Optional) For image OCR support, install Tesseract:
   - **Windows**: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - **macOS**: `brew install tesseract`
   - **Linux**: `sudo apt install tesseract-ocr`

## Running the Server

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Or run directly:
```bash
python app.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Predict Text
```
POST /predict-text
Content-Type: application/json

{
    "text": "Your news article text here..."
}
```

### Predict Image (OCR)
```
POST /predict-image
Content-Type: multipart/form-data

file: <image_file>
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Example Usage (Python)

```python
import requests

# Text prediction
response = requests.post(
    "http://localhost:8000/predict-text",
    json={"text": "The president announced new policies today..."}
)
print(response.json())

# Image prediction
with open("news_screenshot.png", "rb") as f:
    response = requests.post(
        "http://localhost:8000/predict-image",
        files={"file": f}
    )
print(response.json())
```

## Example Usage (JavaScript/Fetch)

```javascript
// Text prediction
const response = await fetch("http://localhost:8000/predict-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Your news article..." })
});
const result = await response.json();
console.log(result);
```
