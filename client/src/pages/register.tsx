import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    registerMutation.mutate(formData);
  };

  const trialBenefits = [
    "100,000 free API requests",
    "Access to all blockchain networks",
    "7 days trial period",
    "No credit card required",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="mb-8 text-center">
          <Link href="/">
            <a className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <div className="w-3 h-3 bg-primary animate-pulse" />
              <span className="font-mono font-bold text-xl tracking-widest">0xinfra</span>
            </a>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">
            Start Building
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Create your account and start building today
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-black border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 font-mono text-sm">{error}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-sm text-muted-foreground">FIRST NAME</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-background border border-border px-12 py-3 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="John"
                      data-testid="input-firstName"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-sm text-muted-foreground">LAST NAME</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="Doe"
                    data-testid="input-lastName"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-sm text-muted-foreground">EMAIL *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-border px-12 py-3 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="you@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-sm text-muted-foreground">PASSWORD *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-background border border-border px-12 py-3 font-mono text-sm focus:border-primary focus:outline-none transition-colors pr-12"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-primary text-black font-mono font-bold py-4 text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <span className="animate-pulse">CREATING ACCOUNT...</span>
                ) : (
                  <>
                    CREATE ACCOUNT <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="font-mono text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login">
                  <a className="text-primary hover:underline" data-testid="link-login">
                    Sign in
                  </a>
                </Link>
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-primary/5 border border-primary/30 p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              <span className="font-mono font-bold text-sm">FREE TRIAL</span>
            </div>
            <h3 className="font-bold text-lg">What you get:</h3>
            <ul className="space-y-3">
              {trialBenefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-mono">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <a className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to home
            </a>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
