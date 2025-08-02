import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import Admin from "./pages/Admin"; // TEMPORARILY DISABLED
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyLeagues from "./pages/MyLeagues";
import MyWallet from "./pages/MyWallet";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="glowter-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* <Route path="/admin" element={<Admin />} /> TEMPORARILY DISABLED */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-leagues" element={<MyLeagues />} />
                <Route path="/my-wallet" element={<MyWallet />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
