import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import NewsInputSection from "@/components/NewsInputSection";
import AIResultSection from "@/components/AIResultSection";
import NewsFeed from "@/components/NewsFeed";
import Footer from "@/components/Footer";
import { analyzeNews, type AIAnalysisResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResponse | null>(null);
  const { toast } = useToast();

  const handleAnalyzeImage = async (file: File) => {
    setIsLoading(true);
    setResult(null);

    try {
      // For image analysis, we'll need to extract text first
      // For now, show a message that image analysis uses the legacy system
      toast({
        title: "Image Analysis",
        description: "Image OCR analysis is being processed. For best results, use URL analysis.",
      });
      
      // TODO: Implement image-to-text extraction and then AI analysis
      // For now, we'll show a placeholder result
      setResult({
        ai_prediction: "UNCERTAIN",
        ai_confidence: 50,
        ai_reasoning: "Image analysis requires text extraction. Please use URL analysis for more accurate results.",
        ai_indicators: {
          sensationalism_score: 50,
          source_attribution: 50,
          logical_consistency: 50,
          emotional_manipulation: 50,
          factual_claims_verifiable: 50,
        },
        ai_red_flags: [],
        ai_positive_signals: [],
        source_domain: null,
        source_name: "Image Upload",
        source_score: 50,
        source_type: "unknown",
        source_known: false,
        source_reliable: false,
        hybrid_score: 50,
        ai_weight: 0.7,
        source_weight: 0.3,
        final_verdict: "UNCERTAIN",
        final_confidence: 50,
        is_uncertain: true,
        recommendation: "For accurate analysis, please provide the news article URL instead of an image.",
      });
    } catch (error) {
      console.error("Image analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze the image.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = async (url: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      // First, we need to fetch the article content from the URL
      // For now, we'll pass the URL to the AI and let it analyze based on source credibility
      // In a production app, you'd want to scrape the article content first
      
      const response = await analyzeNews(
        `Please analyze this news article from: ${url}. The URL is from a news source that should be evaluated for credibility.`,
        url
      );
      setResult(response);
    } catch (error) {
      console.error("URL analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze the URL. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        
        {/* Main content area with sidebar layout */}
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main analysis section - centered, takes remaining space */}
            <div className="flex-1 lg:max-w-2xl lg:mx-auto space-y-6 order-1">
              <NewsInputSection 
                onAnalyzeImage={handleAnalyzeImage} 
                onAnalyzeUrl={handleAnalyzeUrl}
                isLoading={isLoading} 
              />
              <AIResultSection result={result} onReset={handleReset} />
            </div>
            
            {/* News feed on the right - fixed width, 1/4 of container */}
            <div className="lg:w-80 xl:w-96 order-2 lg:order-2 flex-shrink-0">
              <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)]">
                <NewsFeed />
              </div>
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
