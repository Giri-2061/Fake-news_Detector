import { CheckCircle2, XCircle, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultSectionProps {
  result: {
    prediction: "real" | "fake";
    confidence: number;
  } | null;
  onReset: () => void;
}

const ResultSection = ({ result, onReset }: ResultSectionProps) => {
  if (!result) return null;

  const isReal = result.prediction === "real";

  return (
    <section className="py-8 md:py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <div
          className={`rounded-2xl p-6 md:p-8 border-2 animate-slide-up ${
            isReal ? "result-real" : "result-fake"
          }`}
        >
          {/* Result header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {isReal ? (
              <CheckCircle2 className="w-12 h-12 text-real" />
            ) : (
              <XCircle className="w-12 h-12 text-fake" />
            )}
          </div>

          {/* Prediction label */}
          <h2
            className={`text-3xl md:text-4xl font-bold text-center mb-2 ${
              isReal ? "text-real" : "text-fake"
            }`}
          >
            {isReal ? "Real News" : "Fake News"}
          </h2>

          {/* Confidence score */}
          <div className="text-center mb-6">
            <span className="text-lg text-foreground/80">
              Confidence Score:{" "}
              <span className="font-semibold">{result.confidence}%</span>
            </span>
          </div>

          {/* Confidence bar */}
          <div className="w-full max-w-md mx-auto mb-6">
            <div className="h-3 rounded-full bg-background/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isReal ? "bg-result-real" : "bg-result-fake"
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 max-w-lg mx-auto">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              This prediction is based on linguistic patterns and semantic
              analysis learned from verified Nepali news data using advanced NLP
              and machine learning models.
            </p>
          </div>

          {/* Reset button */}
          <div className="text-center mt-6">
            <Button variant="outline" size="lg" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
              Analyze Another
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultSection;
