import { Link2, Image, Search, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Link2,
      title: "Paste a URL",
      description: "Enter a news article URL to analyze the source and content",
    },
    {
      icon: Image,
      title: "Or Upload Image",
      description: "Upload a screenshot of news text for OCR-based analysis",
    },
    {
      icon: Search,
      title: "AI Analysis",
      description: "Our ML model analyzes the text and checks source credibility",
    },
    {
      icon: CheckCircle,
      title: "Get Results",
      description: "Receive a detailed verdict with confidence scores",
    },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center text-foreground mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1 text-sm">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
