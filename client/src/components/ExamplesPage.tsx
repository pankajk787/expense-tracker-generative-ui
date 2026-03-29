import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, BarChart2 } from "lucide-react";

export default function ExamplesPage() {
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

  const examples = [
    {
      category: "Adding Expenses",
      icon: MessageCircle,
      queries: [
        {
          user: "I bought a laptop for ₹50,000 today",
          ai: "Added: Laptop - ₹50,000 on today's date",
        },
        {
          user: "Spent $45 on groceries yesterday",
          ai: "Added: Groceries - $45 on yesterday",
        },
        {
          user: "Had dinner at Pizza Hut, cost me 800 rupees on 15th March",
          ai: "Added: Food/Dining - ₹800 on March 15",
        },
        {
          user: "Paid ₹1500 for gym membership this month",
          ai: "Added: Health/Fitness - ₹1500 for this month",
        },
      ],
    },
    {
      category: "Querying Expenses",
      icon: BarChart2,
      queries: [
        {
          user: "What did I spend on food this month?",
          ai: "Shows total food expenses: ₹3,450 across 8 transactions",
        },
        {
          user: "Give me my total expenses for January and February",
          ai: "January: ₹25,000 | February: ₹28,500",
        },
        {
          user: "How much did I spend on transport?",
          ai: "Transport expenses: ₹2,100 total",
        },
        {
          user: "What are my top 3 spending categories?",
          ai: "1. Food - ₹5,200, 2. Transport - ₹2,100, 3. Entertainment - ₹1,500",
        },
      ],
    },
    {
      category: "Visualizations",
      icon: BarChart2,
      queries: [
        {
          user: "Show me my monthly breakdown till date",
          ai: "Displays a chart showing spending for each month",
        },
        {
          user: "Visualize my weekly expenses for this month",
          ai: "Creates a bar chart showing weekly spending patterns",
        },
        {
          user: "Chart my daily expenses for the last 7 days",
          ai: "Shows daily comparison to identify highest spending days",
        },
        {
          user: "Generate an expense report for Q1",
          ai: "Creates a comprehensive visualization of quarterly spending",
        },
      ],
    },
    {
      category: "Analysis & Insights",
      icon: BarChart2,
      queries: [
        {
          user: "Where am I overspending?",
          ai: "Food and entertainment are 60% of your budget",
        },
        {
          user: "Compare my expenses this month vs last month",
          ai: "This month is 15% higher - primarily in dining and shopping",
        },
        {
          user: "What's my average daily spending?",
          ai: "Your average daily spend: ₹850 (total ₹25,500 for 30 days)",
        },
        {
          user: "Give me a summary of my spending habits",
          ai: "You spend most on food (40%), followed by transport (25%) and utilities (20%)",
        },
      ],
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-bold text-white">✨ Examples</h1>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-12"
      >
        {/* Introduction */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            See What I Can Do
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Explore real examples of how to use ExpenseTracker for different tasks. 
            These conversations show the types of queries you can make.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <motion.div
          variants={containerVariants}
          className="space-y-8 mb-12"
        >
          {examples.map((exampleGroup, groupIdx) => (
            <motion.div
              key={groupIdx}
              variants={itemVariants}
              className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center gap-3">
                <exampleGroup.icon className="w-6 h-6 text-white" />
                <h3 className="text-xl font-semibold text-white">
                  {exampleGroup.category}
                </h3>
              </div>

              {/* Examples */}
              <div className="p-6 space-y-4">
                {exampleGroup.queries.map((query, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="space-y-3"
                  >
                    {/* User Message */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-indigo-300">You</span>
                      </div>
                      <div className="flex-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg px-4 py-3">
                        <p className="text-slate-100">{query.user}</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-emerald-300">AI</span>
                      </div>
                      <div className="flex-1 bg-emerald-600/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                        <p className="text-slate-200">{query.ai}</p>
                      </div>
                    </div>

                    {idx < exampleGroup.queries.length - 1 && (
                      <hr className="my-2 border-slate-700" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Reference */}
        <motion.div variants={itemVariants} className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">📋 Quick Reference</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Amounts",
                examples: "₹500, $100, 1000 rupees, 50 dollars",
              },
              {
                title: "Dates",
                examples: "today, yesterday, 15th March, 2026-03-15",
              },
              {
                title: "Categories",
                examples: "food, transport, entertainment, utilities",
              },
              {
                title: "Time Periods",
                examples: "this month, last week, this year, Q1",
              },
            ].map((ref, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
              >
                <h4 className="font-semibold text-indigo-400 mb-2">
                  {ref.title}
                </h4>
                <p className="text-sm text-slate-300">{ref.examples}</p>
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
              Start Your Journey
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
