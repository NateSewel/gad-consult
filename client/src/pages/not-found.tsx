import { Link } from "wouter";
import { ArrowLeft, FileX2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-legal-mesh">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2rem] border border-border/70 bg-card/70 p-8 sm:p-10 shadow-xl shadow-black/10 backdrop-blur grain-overlay">
          <div className="grid place-items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground shadow-lg shadow-secondary/20">
              <FileX2 className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl sm:text-4xl leading-tight" data-testid="notfound-title">
              Page not found
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed" data-testid="notfound-desc">
              The page you’re looking for doesn’t exist — or was moved.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
              data-testid="notfound-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
