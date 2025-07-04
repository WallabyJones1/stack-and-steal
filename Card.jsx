import React from 'react';
import { motion } from 'framer-motion';

/**
 * A component that displays a single playing card using the Deck of Cards API.
 * @param {{
 * cardCode: string; // The code for the card, e.g., "KH", "5S", "AC".
 * onClick?: () => void;
 * className?: string;
 * layoutId?: string;
 * }} props
 */
function Card({ cardCode, onClick, className, layoutId }) {
  // The API uses '0' for 10.
  const imageUrl = `https://deckofcardsapi.com/static/img/${cardCode.replace('10', '0')}.png`;

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.8 },
  };

  return (
    <motion.div
      layoutId={layoutId}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClick}
      className={`w-28 h-40 transition-transform duration-300 hover:-translate-y-5 hover:z-20 cursor-pointer ${className}`}
      whileHover={{ scale: 1.1, zIndex: 20 }}
    >
      <img
        src={imageUrl}
        alt={`Playing card ${cardCode}`}
        className="w-full h-full object-contain pointer-events-none"
        // Basic shadow for depth, consistent with the theme
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
      />
    </motion.div>
  );
}

export default Card;
