import { Shield } from 'lucide-react';

// A helper function to combine class names, which is very useful with Tailwind.
const cx = (...classNames) => classNames.filter(Boolean).join(' ');

function Card({ card, isSelected, className, onClick }) {
  const rank = card?.rank; // Use optional chaining in case card is null

  // Default to a card back if no card is provided
  if (!card) {
    return (
      <div className={cx(
        "w-full h-full rounded-lg shadow-lg bg-slate-800 border-2 border-slate-600 p-2",
        className
      )}>
        <div className="w-full h-full rounded-md border-2 border-slate-500 bg-slate-700"></div>
      </div>
    );
  }

  const isShield = rank === 'SHIELD';
  const isRogue = rank === 'ROGUE';
  const isFaceCard = typeof rank === 'string' && ['J', 'Q', 'K', 'A'].includes(rank);
  const isTen = rank === 10;

  // Base styles for all cards
  const baseClasses = 'w-full h-full rounded-lg shadow-lg border-2 transition-all duration-200 ease-in-out cursor-pointer relative flex items-center justify-center font-black';

  // Specific styles for different card types
  const typeClasses = cx(
    'font-slab',
    isShield && 'bg-sky-500 border-sky-300',
    isRogue && 'bg-red-600 border-red-400 text-white',
    isFaceCard && 'bg-amber-400 border-amber-200 text-amber-900',
    !isShield && !isRogue && !isFaceCard && 'bg-slate-200 border-slate-400 text-slate-800' // Default number card
  );

  // Styles for when a card is selected
  const selectedClasses = isSelected ? 'ring-4 ring-yellow-300 shadow-yellow-300/50 -translate-y-4' : 'hover:-translate-y-2';

  const renderCardContent = () => {
    if (isShield) {
      return <Shield className="w-1/2 h-1/2 text-white" />;
    }
    // For all other cards, render the rank
    return <span className={cx("text-5xl", (isTen || isFaceCard) && "text-6xl")}>{rank}</span>;
  };

  return (
    <div 
      className={cx(baseClasses, typeClasses, selectedClasses, className)}
      onClick={onClick}
    >
      {/* Corner Pips */}
      {!isShield && (
        <>
          <span className="absolute top-2 left-3 text-2xl font-bold">{rank}</span>
          <span className="absolute bottom-2 right-3 text-2xl font-bold transform rotate-180">{rank}</span>
        </>
      )}
      {renderCardContent()}
    </div>
  );
}

export default Card;
