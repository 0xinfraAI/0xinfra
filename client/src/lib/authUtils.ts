export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function getTrialDaysRemaining(trialEnd: string | Date | null): number {
  if (!trialEnd) return 0;
  const end = new Date(trialEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(trialEnd: string | Date | null): boolean {
  if (!trialEnd) return false;
  return new Date(trialEnd) > new Date();
}

export function getPlanLimits(planType: string): { apiCalls: number; connections: number } {
  switch (planType) {
    case "trial":
      return { apiCalls: 100000, connections: 3 };
    case "free":
      return { apiCalls: 50000, connections: 2 };
    case "starter":
      return { apiCalls: 500000, connections: 10 };
    case "pro":
      return { apiCalls: 5000000, connections: 50 };
    case "enterprise":
      return { apiCalls: Infinity, connections: Infinity };
    default:
      return { apiCalls: 0, connections: 0 };
  }
}
