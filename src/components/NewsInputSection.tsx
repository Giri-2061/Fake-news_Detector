import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Loader2, Link, Image, Upload, X } from "lucide-react";

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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPG, JPEG).");
        return;
      }
      // Validate file size (max 10MB)
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
    <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 card-gradient">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
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
        <button
              onClick={() => handleModeChange("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === "image"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              disabled={isLoading}
            >
              <Image className="w-4 h-4" />
              Upload Image
            </button>
          </div>

          {mode === "url" ? (
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
                placeholder="https://kathmandupost.com/news-article..."
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
                  <strong>Supported sources:</strong> Kathmandu Post, Online Khabar, Setopati, 
                  The Himalayan Times, Republica, BBC Nepali, and many more Nepali & international news sites.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Image Upload Label */}
              <label className="block text-lg font-semibold text-foreground mb-3">
                Upload News Screenshot
              </label>

              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  selectedImage
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50 hover:bg-muted/30"
                } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
              >
                {selectedImage && imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Selected news screenshot"
                        className="max-h-48 rounded-lg shadow-md mx-auto"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        Drag & drop your image here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse
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

              {/* Helper text */}
              <p className="text-sm text-muted-foreground mt-3">
                Upload a screenshot of a news article. We'll extract the text using OCR and analyze it.
              </p>

              {/* Format hint */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  <strong>Supported formats:</strong> PNG, JPG, JPEG (max 10MB). 
                  For best results, ensure the text in the image is clear and readable.
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
                {mode === "image" ? "Extracting & Analyzing..." : "Fetching & Analyzing..."}
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                {mode === "image" ? "Analyze Image" : "Verify URL"}
              </>
            )}
          </Button>
        </div>
  );
};

export default NewsInputSection;
