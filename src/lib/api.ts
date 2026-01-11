/**
 * API Service for Fake News Detection
 * Handles communication with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface PredictionResponse {
  prediction: "REAL" | "FAKE";
  confidence: number;
  fake_probability: number;
  real_probability: number;
  text_length: number;
}

export interface HybridPredictionResponse {
  // Final combined prediction
  prediction: "REAL" | "FAKE";
  confidence: number;
  fake_probability: number;
  real_probability: number;
  
  // Text-based prediction details
  text_prediction: "REAL" | "FAKE";
  text_confidence: number;
  text_fake_probability: number;
  text_real_probability: number;
  
  // Source information
  source_name: string;
  source_score: number;
  source_known: boolean;
  source_type: string;
  
  // Weights used
  text_weight: number;
  source_weight: number;
  
  // Additional info
  text_length: number;
  adjustment_applied: string;
}

export interface SourceCredibility {
  domain: string;
  name: string;
  known: boolean;
  score: number;
  type: string;
  is_reliable: boolean;
}

export interface ContentAnalysis {
  clickbait_phrases: string[];
  flags: string[];
  credibility_penalty: number;
}

export interface ComprehensiveResponse {
  url: string;
  title: string | null;
  author: string | null;
  date: string | null;
  text_preview: string;
  ml_prediction: "REAL" | "FAKE";
  ml_confidence: number;
  source: SourceCredibility;
  content_analysis: ContentAnalysis;
  overall_credibility: number;
  verdict: string;
  recommendation: string;
  trusted_sources: string[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  vectorizer_loaded: boolean;
  ocr_available: boolean;
}

export interface ApiError {
  detail: string;
}

/**
 * Check if the API is healthy and model is loaded
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  
  return response.json();
}

/**
 * Predict if news text is real or fake (text-only, no source adjustment)
 */
export async function predictText(text: string): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Prediction failed");
  }

  return response.json();
}

/**
 * Predict if news text is real or fake with source credibility adjustment
 * 
 * @param text - News article text
 * @param source - Source name or domain (optional)
 * @param textWeight - Weight for text-based prediction (0-1), default 0.7
 */
export async function predictWithSource(
  text: string, 
  source?: string,
  textWeight: number = 0.7
): Promise<HybridPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-with-source`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      text, 
      source: source || null,
      text_weight: textWeight 
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Prediction failed");
  }

  return response.json();
}

/**
 * Analyze a news URL for authenticity
 */
export async function predictUrl(url: string): Promise<ComprehensiveResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "URL analysis failed");
  }

  return response.json();
}

/**
 * Check source credibility by domain
 */
export async function checkSource(domain: string): Promise<SourceCredibility & { recommendation: string }> {
  const response = await fetch(`${API_BASE_URL}/check-source/${encodeURIComponent(domain)}`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Source check failed");
  }

  return response.json();
}

/**
 * Predict if news in image is real or fake (using OCR)
 */
export async function predictImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict-image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Image prediction failed");
  }

  return response.json();
}
