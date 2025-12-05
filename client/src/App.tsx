import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Docs from "@/pages/docs";
import Nodes from "@/pages/nodes";
import Connect from "@/pages/connect";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import CopilotPage from "@/pages/copilot";
import DeployPage from "@/pages/deploy";
import LogsPage from "@/pages/logs";
import AccountPage from "@/pages/account";
import Login from "@/pages/login";
import Register from "@/pages/register";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/docs" component={Docs} />
      <Route path="/nodes" component={Nodes} />
      <Route path="/connect" component={Connect} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/copilot" component={CopilotPage} />
      <Route path="/deploy" component={DeployPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;