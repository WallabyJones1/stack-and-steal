import { motion } from 'framer-motion';
import { Shield, Bot, Gem, Droplets, Wallet } from 'lucide-react';
import Card from '../components/Card.jsx';

// New component for the animated background grid
const AnimatedCardGrid = () => {
  const cardValues = ['A', 7, 'K', 'ROGUE', 5, 'J', 9, 'SHIELD', 3, 'Q', 8, 2];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full grid grid-cols-4 md:grid-cols-6 gap-4 p-4 -z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {[...Array(24)].map((_, i) => (
        <motion.div key={i} variants={cardVariants} className="opacity-20">
          <Card value={cardValues[i % cardValues.length]} />
        </motion.div>
      ))}
    </motion.div>
  );
};

function LandingPage({ onStartPractice, onNavigateToLobby, connected }) {
  const modeButtonClasses = "w-full px-8 py-4 bg-slate-800/70 border border-slate-600 text-slate-200 font-semibold text-xl rounded-lg shadow-lg hover:bg-slate-700 hover:border-indigo-400 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-slate-600 backdrop-blur-sm";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 overflow-hidden">
      <AnimatedCardGrid />
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>

      <motion.div 
        className="text-center z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-7xl md:text-8xl font-black text-white font-slab tracking-tighter [text-shadow:0_5px_15px_rgba(0,0,0,0.5)]">
          Stack & Steal
        </h1>
        <p className="text-2xl text-indigo-300 font-semibold mt-2">
          by Rogue Vibes
        </p>
      </motion.div>

      <motion.div
        className="mt-12 w-full max-w-sm flex flex-col items-center gap-4 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
      >
        <button onClick={onNavigateToLobby} className={modeButtonClasses} disabled={!connected}>
            <Gem size={24} /> Play Live
        </button>
        <button onClick={onStartPractice} className={modeButtonClasses}>
          <Bot size={24} /> Practice vs Bots
        </button>
      </motion.div>
    </div>
  );
}

export default LandingPage;
