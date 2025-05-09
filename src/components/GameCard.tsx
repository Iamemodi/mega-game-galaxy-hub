
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface GameCardProps {
  title: string;
  gameId: string;
  category: string;
  bgColor: string;
  icon?: string;
  description?: string;
  isNew?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: number;
}

export function GameCard({ 
  title, 
  gameId, 
  category, 
  bgColor,
  icon,
  description,
  isNew,
  difficulty,
  rating
}: GameCardProps) {
  // Determine difficulty color
  const difficultyColor = difficulty === 'easy' 
    ? 'bg-green-400' 
    : difficulty === 'medium' 
      ? 'bg-yellow-400' 
      : difficulty === 'hard' 
        ? 'bg-red-400' 
        : '';

  // Star rating display
  const renderRating = () => {
    if (!rating) return null;
    
    return (
      <div className="flex mt-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="h-full"
    >
      <Link to={`/game/${gameId}`} className="block h-full">
        <div className={`${bgColor} rounded-xl p-6 shadow-lg h-full flex flex-col justify-between relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20">
            {isNew && (
              <div className="absolute transform rotate-45 bg-red-500 text-white font-bold py-1 right-[-35px] top-[15px] w-[140px] text-center text-xs">
                NEW
              </div>
            )}
          </div>

          <div className="flex justify-between items-start">
            {icon && <div className="text-4xl mb-2">{icon}</div>}
            <div className="flex flex-col items-end">
              <span className="px-2 py-1 text-xs uppercase tracking-wide bg-white bg-opacity-30 rounded-full mb-1">
                {category}
              </span>
              {difficulty && (
                <span className={`${difficultyColor} px-2 py-1 text-xs rounded-full text-white`}>
                  {difficulty}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <h3 className="text-lg font-bold mt-2">{title}</h3>
            {description && <p className="text-sm mt-1 opacity-90 line-clamp-2">{description}</p>}
            {renderRating()}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
