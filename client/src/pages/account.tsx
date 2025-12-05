import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Zap, Key, ArrowRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getTrialDaysRemaining, isTrialActive, getPlanLimits } from "@/lib/authUtils";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import type { Connection } from "@shared/schema";

function TrialBanner({ daysRemaining, isActive }: { daysRemaining: number; isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="bg-red-500/10 border border-red-500 p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="font-mono font-bold text-red-400">TRIAL EXPIRED</h3>
        </div>
        <p className="font-mono text-sm text-muted-foreground mb-4">
          Your free trial has ended. Upgrade to continue accessing 0xinfra's RPC infrastructure.
        </p>
        <a href="/pricing">
          <button className="bg-primary text-black font-mono font-bold px-6 py-3 hover:bg-white transition-colors flex items-center gap-2">
            VIEW PLANS <ArrowRight className="w-4 h-4" />
          </button>
        </a>
      </div>
    );
  }

  const urgencyClass = daysRemaining <= 2 ? 'border-yellow-500 bg-yellow-500/10' : 'border-primary bg-primary/10';
  const textClass = daysRemaining <= 2 ? 'text-yellow-400' : 'text-primary';

  return (
    <div className={`${urgencyClass} border p-6 mb-8`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Clock className={`w-5 h-5 ${textClass}`} />
            <h3 className={`font-mono font-bold ${textClass}`}>
              {daysRemaining} DAY{daysRemaining !== 1 ? 'S' : ''} LEFT IN TRIAL
            </h3>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            You're on the free trial. Upgrade to unlock unlimited API calls and premium features.
          </p>
        </div>
        <a href="/pricing" className="hidden md:block">
          <button className="bg-primary text-black font-mono font-bold px-6 py-3 hover:bg-white transition-colors flex items-center gap-2">
            UPGRADE NOW <ArrowRight className="w-4 h-4" />
          </button>
        </a>
      </div>
    </div>
  );
}

function UsageCard({ title, used, limit, icon: Icon }: { title: string; used: number; limit: number; icon: any }) {
  const percentage = limit === Infinity ? 0 : (used / limit) * 100;
  const isHigh = percentage > 80;
  
  return (
    <div className="border border-border p-6 hover:border-primary transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h4 className="font-mono text-sm text-muted-foreground uppercase">{title}</h4>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold">{used.toLocaleString()}</span>
        <span className="text-muted-foreground font-mono text-sm">
          {limit === Infinity ? '' : ` / ${limit.toLocaleString()}`}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="w-full h-2 bg-muted">
          <div 
            className={`h-full ${isHigh ? 'bg-yellow-500' : 'bg-primary'} transition-all`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PlanCard({ planType, limits }: { planType: string; limits: { apiCalls: number; connections: number } }) {
  const planLabels: Record<string, { name: string; color: string }> = {
    trial: { name: 'FREE TRIAL', color: 'bg-yellow-500' },
    free: { name: 'FREE', color: 'bg-muted' },
    starter: { name: 'STARTER', color: 'bg-blue-500' },
    pro: { name: 'PRO', color: 'bg-primary' },
    enterprise: { name: 'ENTERPRISE', color: 'bg-purple-500' },
  };

  const plan = planLabels[planType] || planLabels.free;

  return (
    <div className="border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-mono text-sm text-muted-foreground uppercase">Current Plan</h4>
        <span className={`${plan.color} text-black font-mono font-bold px-3 py-1 text-sm`}>
          {plan.name}
        </span>
      </div>
      <ul className="space-y-2 font-mono text-sm">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          {limits.apiCalls === Infinity ? 'Unlimited' : limits.apiCalls.toLocaleString()} API calls/month
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          {limits.connections === Infinity ? 'Unlimited' : limits.connections} API connections
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          {planType === 'trial' || planType === 'free' ? 'Standard support' : 'Priority support'}
        </li>
      </ul>
      {(planType === 'trial' || planType === 'free') && (
        <a href="/pricing" className="block mt-4">
          <button className="w-full bg-muted hover:bg-primary hover:text-black font-mono text-sm py-3 transition-colors flex items-center justify-center gap-2">
            UPGRADE PLAN <ArrowRight className="w-4 h-4" />
          </button>
        </a>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: connections = [] } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view your account.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const trialDays = user.trialEnd ? getTrialDaysRemaining(user.trialEnd) : 0;
  const trialActive = user.trialEnd ? isTrialActive(user.trialEnd) : false;
  const limits = getPlanLimits(user.planType || 'trial');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-24 px-4 md:px-8 max-w-6xl mx-auto pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border-l-2 border-primary pl-6 mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-tight">Account</h1>
            <p className="font-mono text-muted-foreground text-sm mt-2">
              Manage your 0xinfra account and subscription
            </p>
          </div>

          {(user.planType === 'trial') && (
            <TrialBanner daysRemaining={trialDays} isActive={trialActive} />
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-border p-6">
              <h3 className="font-mono text-sm text-muted-foreground uppercase mb-4">Profile</h3>
              <div className="flex items-center gap-4 mb-6">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 object-cover border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted flex items-center justify-center border border-border">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || 'Anonymous User'}
                  </h4>
                  <p className="font-mono text-sm text-muted-foreground">{user.email || 'No email'}</p>
                </div>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email || 'No email set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>ID: {user.id?.substring(0, 8)}...</span>
                </div>
              </div>
            </div>

            <PlanCard planType={user.planType || 'trial'} limits={limits} />
          </div>

          <h3 className="font-mono text-lg font-bold mb-4 uppercase">Usage This Month</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <UsageCard 
              title="API Calls" 
              used={user.apiCallsUsed || 0} 
              limit={user.apiCallsLimit || limits.apiCalls}
              icon={Zap}
            />
            <UsageCard 
              title="Connections" 
              used={connections.length} 
              limit={limits.connections}
              icon={Key}
            />
            <div className="border border-border p-6 hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-mono text-sm text-muted-foreground uppercase">Security</h4>
              </div>
              <p className="text-2xl font-bold mb-2">ACTIVE</p>
              <p className="font-mono text-xs text-muted-foreground">
                All API keys encrypted and secure
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="font-mono text-lg font-bold mb-4 uppercase">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <a href="/connect">
                <button className="bg-primary text-black font-mono font-bold px-6 py-3 hover:bg-white transition-colors flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  CREATE API KEY
                </button>
              </a>
              <a href="/dashboard">
                <button className="bg-muted hover:bg-muted/80 font-mono px-6 py-3 transition-colors flex items-center gap-2">
                  VIEW DASHBOARD
                </button>
              </a>
              <a href="/api/logout">
                <button className="bg-transparent border border-border hover:border-red-500 hover:text-red-400 font-mono px-6 py-3 transition-colors">
                  SIGN OUT
                </button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
