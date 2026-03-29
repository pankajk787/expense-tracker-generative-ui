import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatContainer from "./ChatContainer";
import { LogOut, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-700 bg-slate-800/50 backdrop-blur"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div>
            <div className="flex gap-2 items-center">
                <span className="p-2 text-white bg-blue-500 rounded-full inline-block">
                    <TrendingUp size={24} className=""/>
                </span>
              <div>
                <h1 className="text-2xl font-bold text-white">Expenso</h1>
                <p className="text-slate-400 text-sm">Welcome, {user?.name}</p>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <ChatContainer />
    </div>
  );
}
