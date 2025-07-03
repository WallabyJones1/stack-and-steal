import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

function PostGameResults({ winner, onPlayAgain }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 font-sans">
      <motion.div
        className="text-center bg-slate-800/50 border border-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: -15 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
        >
          <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
        </motion.div>
        
        <h2 className="text-5xl font-black text-white font-slab tracking-tighter">
          VIBES MASTER!
        </h2>
        
        <p className="text-xl text-slate-300 mt-4">
          <span className="font-bold text-yellow-300">{winner?.name || 'A player'}</span> hit the target score!
        </p>

        <div className="my-8 bg-slate-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-400">Winner's Final Stack</h3>
          <p className="text-5xl font-bold text-green-400 mt-1">{winner?.stack || '33'}</p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onPlayAgain}
            className="w-full px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-lg shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
          >
            Play Again
          </button>
          <button
            className="w-full px-8 py-3 bg-slate-700/50 border border-slate-600 text-slate-200 font-semibold text-xl rounded-lg shadow-lg hover:bg-slate-700 hover:border-indigo-400 hover:scale-105 transition-all duration-300"
          >
            Claim Prize (Coming Soon)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default PostGameResults;
