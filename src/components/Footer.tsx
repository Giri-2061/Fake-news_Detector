import { Brain, Github } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Footer = () => {
  return (
    <footer className="py-6 border-t border-border bg-muted/30">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4" />
            <span>Built with NLP & Machine Learning</span>
            <span className="hidden md:inline text-border">•</span>
            <span className="hidden md:inline">Personal Project</span>
          </div>

          {/* Developer section */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span>Developed by</span>
              <a
                href="https://github.com/Giri-2061"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors font-medium"
              >
                <Github className="w-4 h-4" />
                <span>@parixit</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;