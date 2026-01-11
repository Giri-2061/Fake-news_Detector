import { Brain, Github, BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 border-t border-border mt-auto">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4" />
            <span>Built using NLP & Machine Learning | Academic Project</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Nepali Fake News Detection System. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
