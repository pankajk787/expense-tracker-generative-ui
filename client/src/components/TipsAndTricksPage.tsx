import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Lightbulb, MessageCircle, Zap, Target } from "lucide-react";

export default function TipsAndTricksPage() {
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

  const tips = [
    {
      icon: MessageCircle,
      title: "Use Natural Language",
      category: "Input Tips",
      tips: [
        "Say 'Bought groceries for ₹45 yesterday'",
        "Try 'Spent 500 rupees on fuel today'",
        "Use 'Had dinner at restaurant, cost me 1200'",
        "Be conversational - the AI understands context",
      ],
    },
    {
      icon: Target,
      title: "Get Better Insights",
      category: "Query Tips",
      tips: [
        "Ask for breakdowns by asking 'show me monthly breakdown'",
        "Request specific date ranges: 'expenses from Jan to Mar'",
        "Ask for categories: 'what did I spend on food?'",
        "Compare periods: 'how much did I spend this month vs last?'",
      ],
    },
    {
      icon: Zap,
      title: "Pro Tips",
      category: "Advanced Usage",
      tips: [
        "Include dates in descriptions for accurate tracking",
        "Mention the category if you want specific organization",
        "Ask for visualizations using 'chart', 'graph', or 'visualization'",
        "Get summaries by asking 'give me a summary of expenses'",
      ],
    },
    {
      icon: Lightbulb,
      title: "Save Time",
      category: "Efficiency Tips",
      tips: [
        "Group similar expenses: 'food-$100, transport-₹50, entertainment-₹30'",
        "Use quick phrases like 'lunch-₹12', 'coffee-₹5'",
        "Ask 'what are my top expenses?' to find areas to cut",
        "Request 'weekly summary' for regular check-ins",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
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
          <h1 className="text-2xl font-bold text-white">💡 Tips & Tricks</h1>
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
            Make the Most of ExpenseTracker
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Master these tips and tricks to track your expenses more efficiently and get better insights
            from your spending data.
          </p>
        </motion.div>

        {/* Tips Grid */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {tips.map((tipSection, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <tipSection.icon className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {tipSection.title}
                  </h3>
                  <p className="text-xs text-slate-400">{tipSection.category}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {tipSection.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-indigo-400 mt-0.5">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Common Mistakes */}
        <motion.div variants={itemVariants} className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">❌ Avoid These Mistakes</h3>
          <div className="space-y-3">
            {[
              "❌ Forgetting to include amounts in your description",
              "❌ Using unclear category names",
              "❌ Not specifying dates for past expenses",
              "❌ Being too vague - 'spent money' instead of 'bought coffee for ₹5'",
              "❌ Not reviewing your monthly summaries regularly",
            ].map((mistake, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-slate-300"
              >
                {mistake}
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
              Try It Out Now
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
