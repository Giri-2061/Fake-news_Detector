import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Loader2 } from "lucide-react";

interface NewsInputSectionProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const NewsInputSection = ({ onAnalyze, isLoading }: NewsInputSectionProps) => {
  const [newsText, setNewsText] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    if (!newsText.trim()) {
      setError("Please enter some news text to analyze.");
      return;
    }
    if (newsText.trim().length < 20) {
      setError("Please enter at least 20 characters for accurate analysis.");
      return;
    }
    setError("");
    onAnalyze(newsText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewsText(e.target.value);
    if (error) setError("");
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 card-gradient">
          {/* Label */}
          <label
            htmlFor="news-input"
            className="block text-lg font-semibold text-foreground mb-3"
          >
            Paste Nepali News Text Here
          </label>

          {/* Textarea */}
          <textarea
            id="news-input"
            value={newsText}
            onChange={handleTextChange}
            placeholder="यहाँ नेपाली समाचारको टेक्स्ट पेस्ट गर्नुहोस्..."
            className="w-full h-48 md:h-56 p-4 rounded-xl border border-input bg-background text-foreground font-nepali text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />

          {/* Character count */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">
              {newsText.length} characters
            </span>
            {newsText.length > 0 && newsText.length < 20 && (
              <span className="text-sm text-muted-foreground">
                Minimum 20 characters required
              </span>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-result-fake-bg border border-result-fake/20">
              <AlertCircle className="w-5 h-5 text-result-fake flex-shrink-0" />
              <span className="text-sm text-result-fake">{error}</span>
            </div>
          )}

          {/* Analyze button */}
          <Button
            variant="analyze"
            size="xl"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze News
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsInputSection;
