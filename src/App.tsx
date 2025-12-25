import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import PackageDetails from "./pages/PackageDetails";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import Translation from "./pages/Translation";
import AccessibilityMap from "./pages/AccessibilityMap";
import HealthVitals from "./pages/HealthVitals";
import NotFound from "./pages/NotFound";
import VoiceAssistantWidget from "./components/VoiceAssistantWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/package/:id" element={<PackageDetails />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/translation" element={<Translation />} />
            <Route path="/accessibility-map" element={<AccessibilityMap />} />
            <Route path="/health-vitals" element={<HealthVitals />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <VoiceAssistantWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
