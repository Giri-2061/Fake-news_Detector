import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RotateCcw, 
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Globe,
  Brain,
  Scale,
  HelpCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIAnalysisResponse } from "@/lib/api";

interface AIResultSectionProps {
  result: AIAnalysisResponse | null;
  onReset: () => void;
}

const AIResultSection = ({ result, onReset }: AIResultSectionProps) => {
  if (!result) return null;

  const isUncertain = result.is_uncertain;
  const aiConfidence = result.ai_confidence;
  const sourceScore = result.source_score;
  const hybridScore = result.hybrid_score;

  const getVerdictDisplay = (verdict: string) => {
    switch (verdict) {
      case "REAL":
        return { label: "Verified Real", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800" };
      case "FAKE":
        return { label: "Likely Fake", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800" };
      case "LIKELY_REAL":
        return { label: "Likely Real (Model Uncertain)", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800" };
      case "LIKELY_FAKE":
        return { label: "Likely Fake (Source Unreliable)", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800" };
      default:
        return { label: "Uncertain", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800" };
    }
  };

  const verdictInfo = getVerdictDisplay(result.final_verdict);

  const getVerdictIcon = () => {
    switch (result.final_verdict) {
      case "REAL":
        return <CheckCircle2 className="w-14 h-14 text-green-600" />;
      case "FAKE":
        return <XCircle className="w-14 h-14 text-red-600" />;
      case "LIKELY_REAL":
        return <HelpCircle className="w-14 h-14 text-amber-600" />;
      case "LIKELY_FAKE":
        return <AlertCircle className="w-14 h-14 text-orange-600" />;
      default:
        return <AlertTriangle className="w-14 h-14 text-yellow-600" />;
    }
  };

  const getSourceIcon = () => {
    if (!result.source_known) return <Shield className="w-5 h-5 text-muted-foreground" />;
    if (result.source_reliable) return <ShieldCheck className="w-5 h-5 text-green-600" />;
    return <ShieldAlert className="w-5 h-5 text-red-600" />;
  };

  const getConfidenceBarColor = (percent: number) => {
    if (percent >= 70) return "bg-green-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getIndicatorIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const indicatorLabels: Record<string, string> = {
    sensationalism_score: "Sensationalism",
    source_attribution: "Source Attribution",
    logical_consistency: "Logical Consistency",
    emotional_manipulation: "Emotional Manipulation",
    factual_claims_verifiable: "Verifiable Claims",
  };

  // Invert sensationalism and emotional manipulation (lower is better)
  const getIndicatorQuality = (key: string, score: number): { quality: string; color: string } => {
    const isNegative = key === "sensationalism_score" || key === "emotional_manipulation";
    const adjustedScore = isNegative ? 100 - score : score;
    
    if (adjustedScore >= 70) return { quality: "Good", color: "text-green-600" };
    if (adjustedScore >= 40) return { quality: "Fair", color: "text-yellow-600" };
    return { quality: "Poor", color: "text-red-600" };
  };

  return (
    <section className="py-4 md:py-6">
      <div className="w-full">
        <div className={`rounded-2xl p-6 md:p-8 border-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${verdictInfo.bg}`}>
          
          {/* AI Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Analysis
            </span>
          </div>

          {/* Main Verdict */}
          <div className="flex flex-col items-center text-center mb-6">
            {getVerdictIcon()}
            <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${verdictInfo.color}`}>
              {verdictInfo.label}
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Combined Score: <span className="font-semibold">{hybridScore}%</span>
            </p>
            
            {/* Hybrid Score Bar */}
            <div className="w-full max-w-md mt-4">
              <div className="h-3 rounded-full bg-background/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isUncertain ? "bg-amber-500" : getConfidenceBarColor(hybridScore)
                  }`}
                  style={{ width: `${hybridScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Uncertainty Warning */}
          {isUncertain && (
            <div className="mb-6 p-4 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Uncertainty Detected</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {result.final_verdict === "LIKELY_REAL" ? (
                      <>
                        The AI model has low confidence ({aiConfidence}%) but the source 
                        <strong> {result.source_name}</strong> is highly credible ({sourceScore}%). 
                        This news is <strong>likely real</strong> based on source reputation.
                      </>
                    ) : result.final_verdict === "LIKELY_FAKE" ? (
                      <>
                        The AI model shows uncertainty but the source appears unreliable ({sourceScore}%). 
                        Exercise caution with this content.
                      </>
                    ) : (
                      <>
                        The analysis shows mixed signals. We recommend verifying with additional trusted sources
                        before drawing conclusions.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          <div className="mb-6 p-4 rounded-xl bg-card/50 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">AI Analysis</h4>
            </div>
            <p className="text-muted-foreground">{result.ai_reasoning}</p>
          </div>

          {/* Analysis Grid - 3 columns */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            
            {/* AI Prediction */}
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-sm">AI Prediction</h4>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${
                    result.ai_prediction === "REAL" ? "text-green-600 dark:text-green-400" : 
                    result.ai_prediction === "FAKE" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {result.ai_prediction}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span className={aiConfidence < 70 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                      {aiConfidence}%
                      {aiConfidence < 70 && " (Low)"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        aiConfidence < 70 ? "bg-amber-500" : getConfidenceBarColor(aiConfidence)
                      }`}
                      style={{ width: `${aiConfidence}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gemini AI Analysis
                </p>
              </div>
            </div>

            {/* Source Credibility */}
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                {getSourceIcon()}
                <h4 className="font-semibold text-sm">Source Credibility</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm truncate max-w-[120px]" title={result.source_name}>
                    {result.source_name}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Score</span>
                    <span className={sourceScore >= 70 ? "text-green-600 dark:text-green-400 font-medium" : sourceScore >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}>
                      {sourceScore}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getConfidenceBarColor(sourceScore)}`}
                      style={{ width: `${sourceScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.source_known ? (
                    <>Type: <span className="capitalize">{result.source_type}</span></>
                  ) : (
                    "Unknown source"
                  )}
                </p>
              </div>
            </div>

            {/* Combined Verdict */}
            <div className="p-4 rounded-xl bg-card/50 border-2 border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-sm">Combined Score</h4>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${verdictInfo.color}`}>
                    {hybridScore}%
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Credibility</span>
                    <span>{hybridScore >= 65 ? "Credible" : hybridScore >= 35 ? "Uncertain" : "Not Credible"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isUncertain ? "bg-amber-500" : getConfidenceBarColor(hybridScore)
                      }`}
                      style={{ width: `${hybridScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(result.ai_weight * 100)}% AI + {Math.round(result.source_weight * 100)}% Source
                </p>
              </div>
            </div>
          </div>

          {/* Content Indicators */}
          {result.ai_indicators && (
            <div className="mb-6 p-4 rounded-xl bg-card/50 border border-border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Content Quality Indicators
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(result.ai_indicators).map(([key, value]) => {
                  const { quality, color } = getIndicatorQuality(key, value);
                  return (
                    <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex justify-center mb-1">
                        {getIndicatorIcon(key.includes("sensationalism") || key.includes("emotional") ? 100 - value : value)}
                      </div>
                      <div className={`text-lg font-bold ${color.replace('text-green-600', 'text-green-600 dark:text-green-400').replace('text-yellow-600', 'text-yellow-600 dark:text-yellow-400').replace('text-red-600', 'text-red-600 dark:text-red-400')}`}>
                        {value}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {indicatorLabels[key] || key}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Red Flags & Positive Signals */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {result.ai_red_flags && result.ai_red_flags.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h4 className="font-semibold text-red-800 dark:text-red-300">Red Flags</h4>
                </div>
                <ul className="space-y-1">
                  {result.ai_red_flags.map((flag, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-400">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.ai_positive_signals && result.ai_positive_signals.length > 0 && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Positive Signals</h4>
                </div>
                <ul className="space-y-1">
                  {result.ai_positive_signals.map((signal, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-400">• {signal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Recommendation</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">{result.recommendation}</p>
              </div>
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

export default AIResultSection;
