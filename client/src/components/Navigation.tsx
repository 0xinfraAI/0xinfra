import { ArrowRight, LogOut, User, Settings, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getTrialDaysRemaining, isTrialActive } from "@/lib/authUtils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface NavigationProps {
  transparent?: boolean;
}

const navLinks = [
  { label: 'NODES', href: '/nodes' },
  { label: 'DEPLOY', href: '/deploy' },
  { label: 'AI COPILOT', href: '/copilot' },
  { label: 'PRICING', href: '/pricing' },
  { label: 'DASHBOARD', href: '/dashboard' },
  { label: 'DOCS', href: '/docs' },
];

export function Navigation({ transparent = false }: NavigationProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const trialDays = user?.trialEnd ? getTrialDaysRemaining(user.trialEnd) : 0;
  const trialActive = user?.trialEnd ? isTrialActive(user.trialEnd) : false;

  const bgClass = transparent 
    ? "bg-background/90 backdrop-blur-sm" 
    : "bg-background";

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 ${bgClass} border-b border-border flex items-center justify-between px-4 md:px-8 h-16`}>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <span className="font-mono font-bold text-lg tracking-widest">0xinfra</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8 font-mono text-sm">
          {navLinks.map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="hover:text-primary hover:underline decoration-primary underline-offset-4 transition-colors"
              data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted transition-colors"
            data-testid="mobile-menu-button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {isLoading ? (
            <div className="w-8 h-8 border border-primary animate-pulse hidden md:block" />
          ) : isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-muted hover:bg-muted/80 border border-border px-4 py-2 transition-colors"
                data-testid="user-menu-button"
              >
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-6 h-6 object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="font-mono text-sm hidden md:block">
                  {user.firstName || user.email?.split('@')[0] || 'Account'}
                </span>
                {trialActive && trialDays > 0 && (
                  <span className="hidden lg:block bg-primary text-black text-xs px-2 py-0.5 font-mono">
                    {trialDays}d TRIAL
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border z-50">
                    <div className="p-4 border-b border-border">
                      <p className="font-mono text-sm text-muted-foreground">Signed in as</p>
                      <p className="font-mono text-sm truncate">{user.email || 'No email'}</p>
                      {trialActive && (
                        <div className="mt-2 bg-primary/10 border border-primary/50 p-2">
                          <p className="font-mono text-xs text-primary">
                            TRIAL: {trialDays} days remaining
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {user.apiCallsUsed?.toLocaleString() || 0} / {user.apiCallsLimit?.toLocaleString() || 100000} API calls
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="py-2">
                      <a 
                        href="/account" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        data-testid="dropdown-account-link"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="font-mono text-sm">Account Settings</span>
                      </a>
                      <a 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        data-testid="dropdown-dashboard-link"
                      >
                        <User className="w-4 h-4" />
                        <span className="font-mono text-sm">Dashboard</span>
                      </a>
                    </div>
                    <div className="border-t border-border py-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors"
                        data-testid="dropdown-logout-link"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-mono text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <a href="/login">
                <button 
                  className="font-mono text-sm hover:text-primary transition-colors px-4 py-2"
                  data-testid="login-button"
                >
                  LOG IN
                </button>
              </a>
              <a href="/register">
                <button 
                  className="bg-primary text-black font-mono font-bold px-6 py-2 text-sm hover:bg-white transition-colors flex items-center gap-2 border border-transparent hover:border-black"
                  data-testid="signup-button"
                >
                  GET STARTED <ArrowRight className="w-4 h-4" />
                </button>
              </a>
            </div>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border">
            <div className="flex flex-col py-4">
              {navLinks.map((item) => (
                <a 
                  key={item.label} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-4 font-mono text-sm hover:bg-muted hover:text-primary transition-colors border-b border-border/50"
                  data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.label}
                </a>
              ))}
              
              {isAuthenticated && user ? (
                <>
                  <div className="px-6 py-4 border-t border-border">
                    <p className="font-mono text-xs text-muted-foreground mb-1">Signed in as</p>
                    <p className="font-mono text-sm truncate">{user.email || 'No email'}</p>
                    {trialActive && (
                      <div className="mt-2 bg-primary/10 border border-primary/50 p-2">
                        <p className="font-mono text-xs text-primary">
                          TRIAL: {trialDays} days remaining
                        </p>
                      </div>
                    )}
                  </div>
                  <a 
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-6 py-4 font-mono text-sm hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-4 font-mono text-sm hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-3 text-left w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-6 py-4 flex flex-col gap-3 border-t border-border">
                  <a href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button 
                      className="w-full font-mono text-sm border border-border py-3 hover:border-primary hover:text-primary transition-colors"
                      data-testid="mobile-login-button"
                    >
                      LOG IN
                    </button>
                  </a>
                  <a href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button 
                      className="w-full bg-primary text-black font-mono font-bold py-3 text-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
                      data-testid="mobile-signup-button"
                    >
                      GET STARTED <ArrowRight className="w-4 h-4" />
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
