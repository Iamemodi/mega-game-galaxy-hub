
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
  // Determine difficulty color and label
  const getDifficultyInfo = () => {
    switch(difficulty) {
      case 'easy':
        return { color: 'bg-green-400', label: 'Easy' };
      case 'medium':
        return { color: 'bg-yellow-400', label: 'Medium' };
      case 'hard':
        return { color: 'bg-red-400', label: 'Hard' };
      default:
        return { color: '', label: '' };
    }
  };
  
  const difficultyInfo = getDifficultyInfo();

  // Star rating display
  const renderRating = () => {
    if (!rating) return null;
    
    return (
      <div className="flex mt-2">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Link to={`/game/${gameId}`} className="block h-full">
        <div 
          className={`${bgColor} rounded-xl p-6 h-full flex flex-col justify-between relative overflow-hidden shadow-lg group`}
        >
          {/* Background patterns for visual interest */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-black/5"></div>
            <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-black/5"></div>
          </div>
          
          {/* New badge */}
          {isNew && (
            <div className="absolute top-0 right-0">
              <div className="absolute transform rotate-45 bg-red-500 text-white font-bold py-1 right-[-35px] top-[15px] w-[140px] text-center text-xs shadow-sm">
                NEW
              </div>
            </div>
          )}

          <div className="flex justify-between items-start z-10">
            {icon && (
              <motion.div 
                className="text-4xl mb-2 p-2 bg-white/30 backdrop-blur-sm rounded-lg"
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                {icon}
              </motion.div>
            )}
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 text-xs uppercase tracking-wider bg-white/30 backdrop-blur-sm rounded-full">
                {category}
              </span>
              {difficulty && (
                <span className={`${difficultyInfo.color} px-3 py-1 text-xs rounded-full text-white shadow-sm font-medium`}>
                  {difficultyInfo.label}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto z-10">
            <h3 className="text-xl font-bold mt-3 drop-shadow-sm group-hover:text-white transition-colors">{title}</h3>
            {description && (
              <p className="text-sm mt-1 opacity-90 line-clamp-2 group-hover:text-white/90 transition-colors">
                {description}
              </p>
            )}
            {renderRating()}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
      </Link>
    </motion.div>
  );
}
