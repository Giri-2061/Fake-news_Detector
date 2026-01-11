import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import NewsInputSection from "@/components/NewsInputSection";
import ResultSection from "@/components/ResultSection";
import Footer from "@/components/Footer";

interface AnalysisResult {
  prediction: "real" | "fake";
  confidence: number;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setResult(null);

    // Simulate API call with mock response
    // In production, replace this with actual API call to your ML backend
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock prediction logic based on text length/patterns for demo
    // Replace with actual API response
    const mockConfidence = Math.floor(Math.random() * 25) + 75; // 75-99%
    const mockPrediction: "real" | "fake" =
      text.length % 2 === 0 ? "real" : "fake";

    setResult({
      prediction: mockPrediction,
      confidence: mockConfidence,
    });

    setIsLoading(false);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        <NewsInputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        <ResultSection result={result} onReset={handleReset} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
