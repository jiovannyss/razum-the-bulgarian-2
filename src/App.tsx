import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyLeagues from "./pages/MyLeagues";
import MyWallet from "./pages/MyWallet";

const App = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-leagues" element={<MyLeagues />} />
        <Route path="/my-wallet" element={<MyWallet />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
