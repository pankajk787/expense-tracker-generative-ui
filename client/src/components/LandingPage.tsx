import { motion } from "framer-motion";
import { Zap, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex justify-center"
          >
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="bg-blue-500 p-4 rounded-full"
            >
              <TrendingUp size={48} />
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Expenso
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto"
          >
            Track your expenses with AI-powered insights and intelligent categorization
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-lg transition-colors"
              >
                Get Started
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-blue-400 hover:border-blue-300 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-colors"
              >
                Login
              </motion.button>
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Zap,
                title: "AI-Powered",
                description: "Automatic expense categorization with AI",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "Detailed insights into your spending patterns",
              },
              {
                icon: TrendingUp,
                title: "Tracking",
                description: "Real-time expense tracking and reporting",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
