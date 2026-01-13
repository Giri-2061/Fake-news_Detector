import { useEffect, useState } from "react";
import { ExternalLink, Newspaper, RefreshCw, AlertCircle, ImageOff, TrendingUp } from "lucide-react";
import { fetchNepalNews, type NewsItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NewsFeed = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loadNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchNepalNews(8);
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
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleImageError = (link: string) => {
    setFailedImages(prev => new Set(prev).add(link));
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Live News</h3>
              <p className="text-xs text-muted-foreground">Nepal Updates</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadNews}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && articles.length === 0 ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">{error}</p>
            <Button variant="link" size="sm" onClick={loadNews} className="mt-1">
              Retry
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article, index) => (
              <a
                key={index}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Image */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                      <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                      {article.source}
                    </span>
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
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Newspaper className="w-3 h-3" />
          <span>Auto-updates every 5 min</span>
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;