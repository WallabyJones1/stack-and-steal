import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

function PostGameResults({ winner, onPlayAgain }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-800 p-4">
      <motion.div
        className="text-center bg-slate-50 border border-slate-200 shadow-xl rounded-2xl p-8 md:p-12 w-full max-w-lg"
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
        
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
          WINNER!
        </h2>
        
        <p className="text-xl text-slate-600 mt-4">
          <span className="font-bold text-blue-500">{winner?.name || 'A player'}</span> hit the target score!
        </p>

        <div className="my-8 bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-slate-500">Winner's Final Stack</h3>
          <p className="text-5xl font-bold text-green-500 mt-1">{winner?.stack || '33'}</p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onPlayAgain}
            className="w-full px-8 py-3 bg-blue-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 transition-all duration-300"
          >
            Play Again
          </button>
          <button
            className="w-full px-8 py-3 bg-slate-200 border border-slate-300 text-slate-600 font-semibold text-xl rounded-lg shadow-lg hover:bg-slate-300 hover:scale-105 transition-all duration-300"
          >
            Claim Prize (Coming Soon)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default PostGameResults;
