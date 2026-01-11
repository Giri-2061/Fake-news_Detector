import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import NewsInputSection from "@/components/NewsInputSection";
import ResultSection from "@/components/ResultSection";
import UrlResultSection from "@/components/UrlResultSection";
import NewsFeed from "@/components/NewsFeed";
import Footer from "@/components/Footer";
import { predictImage, predictUrl, type ComprehensiveResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ImageAnalysisResult {
  prediction: "real" | "fake";
  confidence: number;
}

type ResultType = "image" | "url" | null;

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(null);
  const [urlResult, setUrlResult] = useState<ComprehensiveResponse | null>(null);
  const { toast } = useToast();

  const handleAnalyzeImage = async (file: File) => {
    setIsLoading(true);
    setImageResult(null);
    setUrlResult(null);
    setResultType(null);

    try {
      const response = await predictImage(file);
      
      setImageResult({
        prediction: response.prediction.toLowerCase() as "real" | "fake",
        confidence: Math.round(response.confidence * 100),
      });
      setResultType("image");
    } catch (error) {
      console.error("Image analysis error:", error);
      toast({
        variant: "destructive",
        title: "Image Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze the image. Please ensure OCR is available.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async (url: string) => {
    setIsLoading(true);
    setImageResult(null);
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
    setImageResult(null);
    setUrlResult(null);
    setResultType(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        
        {/* Main content area with sidebar */}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* News feed on the left - bigger */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="sticky top-4">
                <NewsFeed />
              </div>
            </div>
            
            {/* Main analysis section */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
              <NewsInputSection 
                onAnalyzeImage={handleAnalyzeImage} 
                onAnalyzeUrl={handleAnalyzeUrl}
                isLoading={isLoading} 
              />
              {resultType === "image" && (
                <ResultSection result={imageResult} onReset={handleReset} />
              )}
              {resultType === "url" && (
                <UrlResultSection result={urlResult} onReset={handleReset} />
              )}
            </div>
          </div>
        </div>
        
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
