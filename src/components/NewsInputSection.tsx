import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Loader2, Link, FileText } from "lucide-react";

type InputMode = "text" | "url";

interface NewsInputSectionProps {
  onAnalyzeText: (text: string) => void;
  onAnalyzeUrl: (url: string) => void;
  isLoading: boolean;
}

const NewsInputSection = ({ onAnalyzeText, onAnalyzeUrl, isLoading }: NewsInputSectionProps) => {
  const [mode, setMode] = useState<InputMode>("text");
  const [newsText, setNewsText] = useState("");
  const [newsUrl, setNewsUrl] = useState("");
  const [error, setError] = useState("");

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAnalyze = () => {
    if (mode === "text") {
      if (!newsText.trim()) {
        setError("Please enter some news text to analyze.");
        return;
      }
      if (newsText.trim().length < 20) {
        setError("Please enter at least 20 characters for accurate analysis.");
        return;
      }
      setError("");
      onAnalyzeText(newsText);
    } else {
      if (!newsUrl.trim()) {
        setError("Please enter a news URL to analyze.");
        return;
      }
      if (!isValidUrl(newsUrl)) {
        setError("Please enter a valid URL (starting with http:// or https://).");
        return;
      }
      setError("");
      onAnalyzeUrl(newsUrl);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewsText(e.target.value);
    if (error) setError("");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsUrl(e.target.value);
    if (error) setError("");
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setError("");
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 card-gradient">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleModeChange("text")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === "text"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              disabled={isLoading}
            >
              <FileText className="w-4 h-4" />
              Paste Text
            </button>
            <button
              onClick={() => handleModeChange("url")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === "url"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              disabled={isLoading}
            >
              <Link className="w-4 h-4" />
              Paste URL
            </button>
          </div>

          {mode === "text" ? (
            <>
              {/* Text Input Label */}
              <label
                htmlFor="news-input"
                className="block text-lg font-semibold text-foreground mb-3"
              >
                Paste News Article Text
              </label>

              {/* Textarea */}
              <textarea
                id="news-input"
                value={newsText}
                onChange={handleTextChange}
                placeholder="Paste the news article text here to verify its authenticity..."
                className="w-full h-48 md:h-56 p-4 rounded-xl border border-input bg-background text-foreground text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground/60"
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
            </>
          ) : (
            <>
              {/* URL Input Label */}
              <label
                htmlFor="url-input"
                className="block text-lg font-semibold text-foreground mb-3"
              >
                Paste News Article URL
              </label>

              {/* URL Input */}
              <input
                id="url-input"
                type="url"
                value={newsUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/news-article"
                className="w-full p-4 rounded-xl border border-input bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground/60"
                disabled={isLoading}
              />

              {/* Helper text */}
              <p className="text-sm text-muted-foreground mt-3">
                We'll extract the article content and analyze it along with the source credibility.
              </p>

              {/* Supported sources hint */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Works best with Nepali news sites like Kathmandu Post, 
                  Online Khabar, Setopati, The Himalayan Times, and international sources.
                </p>
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Analyze button */}
          <Button
            variant="default"
            size="lg"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full mt-6 h-12 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {mode === "url" ? "Fetching & Analyzing..." : "Analyzing..."}
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                {mode === "url" ? "Verify URL" : "Analyze News"}
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsInputSection;
