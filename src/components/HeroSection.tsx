import { Shield, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.04]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container relative max-w-5xl mx-auto px-4">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Detection</span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Nepali Fake News
            <span className="block text-primary">Detection System</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Verify the authenticity of Nepali news articles using advanced 
            NLP and machine learning technology.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Source Verification</span>
            </div>
            <div className="h-4 w-px bg-border hidden md:block" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-result-real animate-pulse" style={{ backgroundColor: 'hsl(152 69% 40%)' }} />
              <span>Real-time Analysis</span>
            </div>
            <div className="h-4 w-px bg-border hidden md:block" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>95%+ Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;