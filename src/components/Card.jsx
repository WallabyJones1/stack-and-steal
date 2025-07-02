// src/components/Card.jsx

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({ card, selected, onClick, disabled = false }) => {
  if (!card) return null;

  const getColor = () => {
    switch (card.type) {
      case 'NUMBER':
        return 'border-blue-400 bg-blue-950 text-blue-200';
      case 'SHIELD':
        return 'border-yellow-300 bg-yellow-900 text-yellow-200';
      case 'ROGUE':
        return 'border-red-400 bg-red-900 text-red-300';
      default:
        return 'border-gray-500 bg-slate-800 text-white';
    }
  };

  return (
    <motion.div
      whileHover={!disabled ? { y: -8 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={clsx(
        'w-20 h-28 rounded-xl border-2 shadow-md cursor-pointer flex items-center justify-center font-bold text-2xl transition-all duration-150',
        getColor(),
        {
          'ring-4 ring-green-500': selected,
          'opacity-40 pointer-events-none': disabled,
        }
      )}
      onClick={() => !disabled && onClick && onClick(card)}
    >
      {card.label}
    </motion.div>
  );
};

export default Card;
