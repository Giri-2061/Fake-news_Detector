import { useEffect, useState } from "react";
import { ExternalLink, Newspaper, RefreshCw, AlertCircle, ImageOff } from "lucide-react";
import { fetchNepalNews, type NewsItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const NewsFeed = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchNepalNews(5);
      if (response.success) {
        setArticles(response.articles);
      } else {
        setError("No news available");
      }
    } catch (err) {
      setError("Failed to load news");
      console.error("News feed error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    // Refresh every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleImageError = (link: string) => {
    setFailedImages(prev => new Set(prev).add(link));
  };

  // Source colors for badges
  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      "The Himalayan Times": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "The Kathmandu Post": "bg-red-500/10 text-red-600 border-red-500/20",
      "Online Khabar": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    };
    return colors[source] || "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Nepal News</h3>
            <p className="text-xs text-muted-foreground">Live updates</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadNews}
          disabled={isLoading}
          className="h-8"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && articles.length === 0 ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-20 w-28 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="link" size="sm" onClick={loadNews} className="mt-2">
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border"
            >
              {/* Image */}
              <div className="w-28 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {article.image && !failedImages.has(article.link) ? (
                  <img
                    src={article.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(article.link)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageOff className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h4>
                
                {article.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {article.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 font-medium ${getSourceColor(article.source)}`}
                  >
                    {article.source}
                  </Badge>
                  {article.published && (
                    <span className="text-[10px] text-muted-foreground">
                      {article.published}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Live news from trusted Nepali sources • Auto-updates every 5 min
        </p>
      </div>
    </div>
  );
};

export default NewsFeed;
