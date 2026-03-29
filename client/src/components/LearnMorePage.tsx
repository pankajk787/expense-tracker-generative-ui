import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, BarChart3, TrendingUp, Brain } from "lucide-react";

export default function LearnMorePage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const capabilities = [
    {
      icon: Brain,
      title: "AI-Powered Expense Recognition",
      description:
        "Our AI understands natural language descriptions and automatically categorizes your expenses with high accuracy.",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description:
        "Get detailed breakdowns of your spending patterns by category, time period, and more with interactive charts.",
    },
    {
      icon: TrendingUp,
      title: "Spending Insights",
      description:
        "Receive intelligent insights about your spending habits, trends, and areas where you can save money.",
    },
    {
      icon: Zap,
      title: "Quick Entry",
      description:
        "Simply describe your expense in plain English and the system will extract amount, category, and date automatically.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-bold text-white">📚 Learn More</h1>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 py-12"
      >
        {/* Introduction */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Explore My Capabilities
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            ExpenseTracker is powered by advanced AI technology that understands your expense 
            tracking needs. Here's what I can do to help you manage your finances more effectively.
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg hover:border-indigo-500 transition-colors"
            >
              <capability.icon className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {capability.title}
              </h3>
              <p className="text-slate-400">{capability.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Key Features */}
        <motion.div variants={itemVariants} className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
          <div className="space-y-4">
            {[
              "Real-time expense tracking with natural language input",
              "Automatic categorization using ML algorithms",
              "Monthly, weekly, and daily spending breakdowns",
              "Visual charts and graphs for better insights",
              "Secure data storage with user-specific isolation",
              "Conversation history for easy reference",
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-slate-300">{feature}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="text-center">
          <Link to="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              Start Tracking Expenses
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
