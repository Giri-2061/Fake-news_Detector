import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Loader2, Link, Image, Upload, X, ArrowRight } from "lucide-react";

type InputMode = "image" | "url";

interface NewsInputSectionProps {
  onAnalyzeImage: (file: File) => void;
  onAnalyzeUrl: (url: string) => void;
  isLoading: boolean;
}

const NewsInputSection = ({ onAnalyzeImage, onAnalyzeUrl, isLoading }: NewsInputSectionProps) => {
  const [mode, setMode] = useState<InputMode>("url");
  const [newsUrl, setNewsUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAnalyze = () => {
    if (mode === "image") {
      if (!selectedImage) {
        setError("Please upload a news screenshot or image.");
        return;
      }
      setError("");
      onAnalyzeImage(selectedImage);
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsUrl(e.target.value);
    if (error) setError("");
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setError("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPG, JPEG).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB.");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB.");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    } else {
      setError("Please drop an image file (PNG, JPG, JPEG).");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-muted/30">
        <h2 className="text-xl font-semibold text-foreground">Verify News</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a URL or upload a screenshot to check authenticity
        </p>
      </div>

      <div className="p-6">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => handleModeChange("url")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === "url"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            disabled={isLoading}
          >
            <Link className="w-4 h-4" />
            Paste URL
          </button>
          <button
            onClick={() => handleModeChange("image")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === "image"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            disabled={isLoading}
          >
            <Image className="w-4 h-4" />
            Upload Image
          </button>
        </div>

        {mode === "url" ? (
          <>
            {/* URL Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Link className="w-5 h-5" />
              </div>
              <input
                id="url-input"
                type="url"
                value={newsUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/news-article"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-input bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                disabled={isLoading}
              />
            </div>

            {/* Supported sources */}
            <div className="mt-4 flex flex-wrap gap-2">
              {["Kathmandu Post", "Online Khabar", "Setopati", "Himalayan Times"].map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                >
                  {source}
                </span>
              ))}
              <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
                + more
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                selectedImage
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
            >
              {selectedImage && imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Selected news screenshot"
                      className="max-h-40 rounded-lg shadow-md mx-auto"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Drop your image here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse • PNG, JPG up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {/* Analyze button */}
        <Button
          variant="default"
          size="lg"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full mt-6 h-12 text-base font-medium bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Verify Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NewsInputSection;