import { Shield, Brain, Newspaper } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="hero-gradient py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        {/* Icon cluster */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-card shadow-card">
            <Newspaper className="w-6 h-6 text-primary" />
          </div>
          <div className="p-4 rounded-xl bg-primary shadow-card-hover">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="p-3 rounded-xl bg-card shadow-card">
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Nepali Fake News Detection System
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Detect misinformation in Nepali news using AI & NLP technology.
          Empowering informed decisions with intelligent analysis.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-result-real" />
            <span>AI-Powered Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>NLP Technology</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-result-real" />
            <span>Nepali Language Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
