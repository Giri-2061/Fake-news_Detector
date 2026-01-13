import { Link2, Image, Cpu, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Link2,
      step: "01",
      title: "Input",
      description: "Paste a news URL or upload a screenshot",
    },
    {
      icon: Cpu,
      step: "02",
      title: "Analyze",
      description: "AI processes content and checks sources",
    },
    {
      icon: CheckCircle,
      step: "03",
      title: "Verify",
      description: "Get results with confidence scores",
    },
  ];

  return (
    <section className="py-12 border-t border-border">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-foreground">
            How It Works
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Step {step.step}
                  </p>
                  <h3 className="font-semibold text-foreground text-sm">
                    {step.title}
                  </h3>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-8 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;