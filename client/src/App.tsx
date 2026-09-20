import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { ScrollToAnchor } from "@/components/ScrollToAnchor";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { AdminPostForm } from "@/pages/admin/AdminPostForm";

function Router() {
  return (
    <>
      <ScrollToAnchor />
      <Switch>
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/posts/new">
          <AdminPostForm mode="create" />
        </Route>
        <Route path="/admin/posts/:id/edit">
          <AdminPostForm mode="edit" />
        </Route>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/" component={Landing} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
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
