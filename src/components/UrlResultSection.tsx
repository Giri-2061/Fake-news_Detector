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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComprehensiveResponse } from "@/lib/api";

interface UrlResultSectionProps {
  result: ComprehensiveResponse | null;
  onReset: () => void;
}

const UrlResultSection = ({ result, onReset }: UrlResultSectionProps) => {
  if (!result) return null;

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes("CREDIBLE") && !verdict.includes("NOT")) return "text-green-600";
    if (verdict.includes("UNCERTAIN")) return "text-yellow-600";
    return "text-red-600";
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict.includes("CREDIBLE") && !verdict.includes("NOT")) return "bg-green-50 border-green-200";
    if (verdict.includes("UNCERTAIN")) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict.includes("CREDIBLE") && !verdict.includes("NOT")) {
      return <CheckCircle2 className="w-12 h-12 text-green-600" />;
    }
    if (verdict.includes("UNCERTAIN")) {
      return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    }
    return <XCircle className="w-12 h-12 text-red-600" />;
  };

  const getSourceIcon = (isReliable: boolean, known: boolean) => {
    if (!known) return <Shield className="w-5 h-5 text-gray-500" />;
    if (isReliable) return <ShieldCheck className="w-5 h-5 text-green-600" />;
    return <ShieldAlert className="w-5 h-5 text-red-600" />;
  };

  const credibilityPercent = Math.round(result.overall_credibility * 100);

  return (
    <section className="py-8 md:py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <div className={`rounded-2xl p-6 md:p-8 border-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${getVerdictBg(result.verdict)}`}>
          
          {/* Main Verdict */}
          <div className="flex flex-col items-center text-center mb-8">
            {getVerdictIcon(result.verdict)}
            <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${getVerdictColor(result.verdict)}`}>
              {result.verdict}
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Overall Credibility: <span className="font-semibold">{credibilityPercent}%</span>
            </p>
            
            {/* Credibility Bar */}
            <div className="w-full max-w-md mt-4">
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    credibilityPercent >= 70 ? "bg-green-500" :
                    credibilityPercent >= 50 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${credibilityPercent}%` }}
                />
              </div>
            </div>
          </div>

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

          {/* Analysis Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            
            {/* Source Credibility */}
            <div className="p-4 rounded-xl bg-white/50">
              <div className="flex items-center gap-2 mb-3">
                {getSourceIcon(result.source.is_reliable, result.source.known)}
                <h4 className="font-semibold">Source Credibility</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{result.source.name}</span>
                </div>
                <p className="text-muted-foreground">
                  {result.source.known ? (
                    <>
                      Type: <span className="capitalize">{result.source.type}</span> • 
                      Score: <span className={result.source.is_reliable ? "text-green-600" : "text-red-600"}>
                        {Math.round(result.source.score * 100)}%
                      </span>
                    </>
                  ) : (
                    "Unknown source - exercise caution"
                  )}
                </p>
              </div>
            </div>

            {/* ML Prediction */}
            <div className="p-4 rounded-xl bg-white/50">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">AI Content Analysis</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  Prediction: <span className={`font-semibold ${
                    result.ml_prediction === "REAL" ? "text-green-600" : "text-red-600"
                  }`}>
                    {result.ml_prediction}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Confidence: {Math.round(result.ml_confidence * 100)}%
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
                <p className="text-sm text-blue-700">{result.recommendation}</p>
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
