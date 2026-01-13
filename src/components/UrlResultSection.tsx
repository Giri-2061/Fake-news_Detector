import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RotateCcw, 
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Globe,
  Brain,
  Scale,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComprehensiveResponse } from "@/lib/api";

interface UrlResultSectionProps {
  result: ComprehensiveResponse | null;
  onReset: () => void;
}

const UrlResultSection = ({ result, onReset }: UrlResultSectionProps) => {
  if (!result) return null;

  const mlConfidencePercent = Math.round(result.ml_confidence * 100);
  const sourceScorePercent = Math.round(result.source.score * 100);
  const credibilityPercent = Math.round(result.overall_credibility * 100);

  // Determine if there's uncertainty (source is credible but ML says fake with low confidence)
  const isModelUncertain = mlConfidencePercent < 70;
  const isSourceCredible = sourceScorePercent >= 80;
  const hasConflict = result.source.known && isSourceCredible && result.ml_prediction === "FAKE" && isModelUncertain;

  const getVerdictColor = (verdict: string) => {
    if (hasConflict) return "text-amber-600";
    if (verdict.includes("CREDIBLE") && !verdict.includes("NOT")) return "text-green-600";
    if (verdict.includes("UNCERTAIN")) return "text-yellow-600";
    return "text-red-600";
  };

  const getVerdictBg = (verdict: string) => {
    if (hasConflict) return "bg-amber-50 border-amber-200";
    if (verdict.includes("CREDIBLE") && !verdict.includes("NOT")) return "bg-green-50 border-green-200";
    if (verdict.includes("UNCERTAIN")) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getVerdictIcon = (verdict: string) => {
    if (hasConflict) {
      return <HelpCircle className="w-12 h-12 text-amber-600" />;
    }
    if (verdict.includes("CREDIBLE") && !verdict.includes("NOT")) {
      return <CheckCircle2 className="w-12 h-12 text-green-600" />;
    }
    if (verdict.includes("UNCERTAIN")) {
      return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    }
    return <XCircle className="w-12 h-12 text-red-600" />;
  };

  const getSourceIcon = (isReliable: boolean, known: boolean) => {
    if (!known) return <Shield className="w-5 h-5 text-muted-foreground" />;
    if (isReliable) return <ShieldCheck className="w-5 h-5 text-green-600" />;
    return <ShieldAlert className="w-5 h-5 text-red-600" />;
  };

  // Override verdict display if there's a conflict
  const displayVerdict = hasConflict 
    ? "LIKELY REAL (Model Uncertain)" 
    : result.verdict;

  const getConfidenceBarColor = (percent: number) => {
    if (percent >= 70) return "bg-green-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <section className="py-4 md:py-6">
      <div className="w-full">
        <div className={`rounded-2xl p-6 md:p-8 border-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${getVerdictBg(result.verdict)}`}>
          
          {/* Main Verdict */}
          <div className="flex flex-col items-center text-center mb-6">
            {getVerdictIcon(result.verdict)}
            <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${getVerdictColor(result.verdict)}`}>
              {displayVerdict}
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Combined Credibility: <span className="font-semibold">{credibilityPercent}%</span>
            </p>
            
            {/* Credibility Bar */}
            <div className="w-full max-w-md mt-4">
              <div className="h-3 rounded-full bg-background/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getConfidenceBarColor(credibilityPercent)}`}
                  style={{ width: `${credibilityPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Uncertainty Warning */}
          {hasConflict && (
            <div className="mb-6 p-4 rounded-xl bg-amber-100 border border-amber-300">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Model Uncertainty Detected</h4>
                  <p className="text-sm text-amber-700">
                    The AI model has low confidence ({mlConfidencePercent}%) but the source 
                    <strong> {result.source.name}</strong> is highly credible ({sourceScorePercent}%). 
                    This news is <strong>likely real</strong> based on source reputation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Article Info */}
          {result.title && (
            <div className="mb-6 p-4 rounded-xl bg-white/50">
              <h3 className="font-semibold text-foreground mb-2">{result.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {result.author && <span>By: {result.author}</span>}
                {result.date && <span>Date: {result.date}</span>}
              </div>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                View Original
              </a>
            </div>
          )}

          {/* Detailed Breakdown Header */}
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Detailed Analysis Breakdown</h3>
          </div>

          {/* Analysis Grid - 3 columns */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            
            {/* ML Model Prediction */}
            <div className="p-4 rounded-xl bg-white/50 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-sm">AI Model Prediction</h4>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${
                    result.ml_prediction === "REAL" ? "text-green-600" : "text-red-600"
                  }`}>
                    {result.ml_prediction}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span className={isModelUncertain ? "text-amber-600 font-medium" : ""}>
                      {mlConfidencePercent}%
                      {isModelUncertain && " (Low)"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-background overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isModelUncertain ? "bg-amber-500" : getConfidenceBarColor(mlConfidencePercent)
                      }`}
                      style={{ width: `${mlConfidencePercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on linguistic patterns and ML analysis
                </p>
              </div>
            </div>

            {/* Source Credibility */}
            <div className="p-4 rounded-xl bg-white/50 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                {getSourceIcon(result.source.is_reliable, result.source.known)}
                <h4 className="font-semibold text-sm">Source Credibility</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{result.source.name}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Score</span>
                    <span className={sourceScorePercent >= 70 ? "text-green-600 font-medium" : sourceScorePercent >= 50 ? "text-yellow-600" : "text-red-600"}>
                      {sourceScorePercent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-background overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getConfidenceBarColor(sourceScorePercent)}`}
                      style={{ width: `${sourceScorePercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.source.known ? (
                    <>Type: <span className="capitalize">{result.source.type}</span></>
                  ) : (
                    "Unknown source"
                  )}
                </p>
              </div>
            </div>

            {/* Final Combined Score */}
            <div className="p-4 rounded-xl bg-white/50 border-2 border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-sm">Combined Verdict</h4>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${getVerdictColor(result.verdict)}`}>
                    {credibilityPercent}%
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Credibility</span>
                    <span>{hasConflict ? "Likely Real" : (credibilityPercent >= 70 ? "High" : credibilityPercent >= 50 ? "Medium" : "Low")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-background overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        hasConflict ? "bg-amber-500" : getConfidenceBarColor(credibilityPercent)
                      }`}
                      style={{ width: `${credibilityPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  70% AI + 30% Source Score
                </p>
              </div>
            </div>
          </div>

          {/* Content Flags */}
          {result.content_analysis.flags.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Content Warnings</h4>
              </div>
              <ul className="space-y-1">
                {result.content_analysis.flags.map((flag, index) => (
                  <li key={index} className="text-sm text-yellow-800">• {flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Recommendation</h4>
                <p className="text-sm text-blue-700">
                  {hasConflict 
                    ? `Although the AI model shows uncertainty, ${result.source.name} is a highly credible source (${sourceScorePercent}%). This news is likely authentic. Consider verifying specific claims if needed.`
                    : result.recommendation
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Trusted Sources */}
          <div className="p-4 rounded-xl bg-white/50">
            <h4 className="font-semibold mb-3">Verify with Trusted Sources</h4>
            <div className="flex flex-wrap gap-2">
              {result.trusted_sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {new URL(source).hostname.replace("www.", "")}
                </a>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Analyze Another
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrlResultSection;
