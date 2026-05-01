import { Link } from "wouter";
import { Wifi } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-6">
        <Wifi className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-4xl font-display font-semibold mb-3">404</h1>
      <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
      <Link href="/" className="text-sm text-primary hover:underline">
        Back to home
      </Link>
    </div>
  );
}
