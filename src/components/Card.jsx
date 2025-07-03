import { Shield, Gem } from 'lucide-react';

// A helper function to combine class names, which is very useful with Tailwind.
const cx = (...classNames) => classNames.filter(Boolean).join(' ');

function Card({ value, isSelected, onClick, className }) {
  const isShield = value === 'SHIELD';
  const isRogue = value === 'ROGUE';
  const isFaceCard = typeof value === 'string' && ['J', 'Q', 'K', 'A', '10'].includes(value);

  // Base styles for all cards
  const baseClasses = 'rounded-xl p-4 w-full h-full flex items-center justify-center font-black text-6xl font-["Roboto_Slab"] border border-gray-600 shadow-lg transition-transform duration-300 ease-in-out cursor-pointer relative select-none';

  // Specific styles for different card types
  const typeClasses = cx(
    isShield && 'bg-gradient-to-tr from-purple-700 to-purple-500',
    isRogue && 'bg-gradient-to-tr from-red-600 to-red-400 font-mono border-red-300',
    isFaceCard && 'bg-gradient-to-tr from-amber-600 to-amber-500 text-amber-900 font-serif',
    !isShield && !isRogue && !isFaceCard && 'bg-gradient-to-tr from-gray-700 to-gray-800 text-white' // Default number card
  );

  // Styles for when a card is selected
  const selectedClasses = isSelected ? '-translate-y-5 scale-110 shadow-yellow-400/50 shadow-[0_0_30px] border-yellow-300' : '';

  const renderCardContent = () => {
    if (isShield) {
      return <Shield className="w-1/2 h-1/2 text-white [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.5))]" />;
    }
    // For all other cards
    return <span className="[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{value}</span>;
  };

  return (
    <div 
      className={cx(baseClasses, typeClasses, selectedClasses, className)}
      onClick={onClick}
    >
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 right-0 bottom-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent"></div>
      
      <div className="relative"> {/* To ensure content is above the shine */}
        {renderCardContent()}
      </div>
    </div>
  );
}

export default Card;
