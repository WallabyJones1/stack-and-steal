import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button'; 

// This component receives the 'winner' and an 'onPlayAgain' function from App.jsx
function PostGameResults({ winner, onPlayAgain }) {
  return (
    <div className="text-center p-8 animate-popIn bg-gradient-to-br from-gray-900 to-black min-h-screen flex flex-col items-center justify-center text-white">
      <Crown size={96} className="text-yellow-400 mx-auto mb-4" />
      <h2 className="text-4xl font-bold text-purple-400 mb-2">VIBES MASTER!</h2>
      <p className="text-xl text-gray-300 mb-6">
        <span className="font-bold text-white">{winner.name}</span> hit the target score!
      </p>

      <div className="bg-black bg-opacity-20 rounded-md p-4 mb-6 max-w-xs mx-auto">
        <h3 className="font-semibold text-gray-400">Winner's Final Stack</h3>
        <p className="text-3xl font-bold text-green-400">{winner.stack}</p>
      </div>

      <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
        <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
          Claim Prize (Practice)
        </Button>
        <Button 
          onClick={onPlayAgain} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Play Again
        </Button>
      </div>
      {/* PopIn animation for the results container */}
      <style jsx>{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popIn {
          animation: popIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default PostGameResults;
