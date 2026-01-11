import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import NewsInputSection from "@/components/NewsInputSection";
import ResultSection from "@/components/ResultSection";
import UrlResultSection from "@/components/UrlResultSection";
import Footer from "@/components/Footer";
import { predictText, predictUrl, type ComprehensiveResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TextAnalysisResult {
  prediction: "real" | "fake";
  confidence: number;
}

type ResultType = "text" | "url" | null;

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [textResult, setTextResult] = useState<TextAnalysisResult | null>(null);
  const [urlResult, setUrlResult] = useState<ComprehensiveResponse | null>(null);
  const { toast } = useToast();

  const handleAnalyzeText = async (text: string) => {
    setIsLoading(true);
    setTextResult(null);
    setUrlResult(null);
    setResultType(null);

    try {
      const response = await predictText(text);
      
      setTextResult({
        prediction: response.prediction.toLowerCase() as "real" | "fake",
        confidence: Math.round(response.confidence * 100),
      });
      setResultType("text");
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not connect to the analysis server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async (url: string) => {
    setIsLoading(true);
    setTextResult(null);
    setUrlResult(null);
    setResultType(null);

    try {
      const response = await predictUrl(url);
      setUrlResult(response);
      setResultType("url");
    } catch (error) {
      console.error("URL analysis error:", error);
      toast({
        variant: "destructive",
        title: "URL Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze the URL. Please check if it's a valid news article.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTextResult(null);
    setUrlResult(null);
    setResultType(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        <NewsInputSection 
          onAnalyzeText={handleAnalyzeText} 
          onAnalyzeUrl={handleAnalyzeUrl}
          isLoading={isLoading} 
        />
        {resultType === "text" && (
          <ResultSection result={textResult} onReset={handleReset} />
        )}
        {resultType === "url" && (
          <UrlResultSection result={urlResult} onReset={handleReset} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
