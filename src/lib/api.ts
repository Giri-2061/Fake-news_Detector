/**
 * API Service for Fake News Detection
 * Uses AI-powered analysis via Lovable Cloud
 */

import { supabase } from "@/integrations/supabase/client";

// Legacy API for backwards compatibility (Python backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

// ============== AI Analysis Types ==============

export interface AIIndicators {
  sensationalism_score: number;
  source_attribution: number;
  logical_consistency: number;
  emotional_manipulation: number;
  factual_claims_verifiable: number;
}

export interface AIAnalysisResponse {
  // AI Analysis
  ai_prediction: "REAL" | "FAKE" | "UNCERTAIN";
  ai_confidence: number;
  ai_reasoning: string;
  ai_indicators: AIIndicators;
  ai_red_flags: string[];
  ai_positive_signals: string[];
  
  // Source Information
  source_domain: string | null;
  source_name: string;
  source_score: number;
  source_type: string;
  source_known: boolean;
  source_reliable: boolean;
  
  // Hybrid Calculation
  hybrid_score: number;
  ai_weight: number;
  source_weight: number;
  
  // Final Result
  final_verdict: "REAL" | "FAKE" | "LIKELY_REAL" | "LIKELY_FAKE" | "UNCERTAIN";
  final_confidence: number;
  is_uncertain: boolean;
  recommendation: string;
}

// ============== Legacy Types (for backwards compatibility) ==============

export interface PredictionResponse {
  prediction: "REAL" | "FAKE";
  confidence: number;
  fake_probability: number;
  real_probability: number;
  text_length: number;
}

export interface HybridPredictionResponse {
  prediction: "REAL" | "FAKE";
  confidence: number;
  fake_probability: number;
  real_probability: number;
  text_prediction: "REAL" | "FAKE";
  text_confidence: number;
  text_fake_probability: number;
  text_real_probability: number;
  source_name: string;
  source_score: number;
  source_known: boolean;
  source_type: string;
  text_weight: number;
  source_weight: number;
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

// ============== AI-Powered Analysis (Primary) ==============

/**
 * Analyze news content using AI (Lovable AI Gateway)
 * This is the primary analysis method
 */
export async function analyzeNews(
  content: string, 
  url?: string
): Promise<AIAnalysisResponse> {
  const { data, error } = await supabase.functions.invoke("analyze-news", {
    body: { text: content, url: url || null },
  });

  if (error) {
    console.error("AI analysis error:", error);
    throw new Error(error.message || "AI analysis failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AIAnalysisResponse;
}

/**
 * Analyze news by URL using AI
 */
export async function analyzeNewsUrl(url: string): Promise<AIAnalysisResponse> {
  // For URL analysis, we'll fetch the content first (could be done in edge function too)
  // For now, pass the URL and let the edge function handle source credibility
  const { data, error } = await supabase.functions.invoke("analyze-news", {
    body: { text: "", url, source: url },
  });

  if (error) {
    console.error("AI URL analysis error:", error);
    throw new Error(error.message || "AI analysis failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AIAnalysisResponse;
}

// ============== Legacy API Functions (Python Backend) ==============

/**
 * Check if the legacy API is healthy
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  
  return response.json();
}

/**
 * Predict using legacy ML model (text-only)
 */
export async function predictText(text: string): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Prediction failed");
  }

  return response.json();
}

/**
 * Predict with source using legacy ML model
 */
export async function predictWithSource(
  text: string, 
  source?: string,
  textWeight: number = 0.7
): Promise<HybridPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-with-source`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
 * Analyze URL using legacy ML model
 */
export async function predictUrl(url: string): Promise<ComprehensiveResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "URL analysis failed");
  }

  return response.json();
}

/**
 * Check source credibility
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
 * Predict from image using legacy ML model (OCR)
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

// ============== News Feed ==============

export interface NewsItem {
  title: string;
  link: string;
  published: string | null;
  source: string;
  image: string | null;
  description: string | null;
}

export interface NewsFeedResponse {
  success: boolean;
  articles: NewsItem[];
  source_count: number;
}

/**
 * Fetch latest news from trusted Nepali news sources
 */
export async function fetchNepalNews(limit: number = 5): Promise<NewsFeedResponse> {
  const response = await fetch(`${API_BASE_URL}/news-feed?limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch news feed");
  }

  return response.json();
}
