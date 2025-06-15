import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";
import { ComingSoon } from "@/components/ComingSoon";

export function PinballGame() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setBalls(3);
  };

  return (
    <div className="game-container font-inter">
      <motion.div
        className="w-full max-w-lg p-8 bg-gradient-to-br from-white/90 rounded-3xl shadow-2xl border-2 border-game-primary/30 backdrop-blur-xl"
        initial={{ opacity: 0, y: 50, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-game-primary via-fuchsia-500 to-pink-500 animate-fade-in font-playfair">Pinball</h1>
          {gameActive && (
            <div className="flex justify-center gap-8">
              <div className="text-2xl font-semibold text-blue-800 drop-shadow">Score: <span className="font-bold">{score}</span></div>
              <div className="text-2xl font-semibold text-orange-700 drop-shadow">Balls: <span className="font-bold">{balls}</span></div>
            </div>
          )}
        </div>

        {!gameActive ? (
          <div className="text-center max-w-md mx-auto animate-fade-in">
            <p className="mb-7 text-gray-700 text-lg">
              Classic arcade pinball game. Keep the ball in play and rack up points. Control the flippers for max combos!
            </p>
            <Button 
              onClick={startGame}
              className="beautiful-button w-full text-xl"
            >
              Start Game
            </Button>
          </div>
        ) : gameOver ? (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-700 font-playfair">Game Over!</h2>
            <p className="text-xl mb-6 font-semibold">Your score: <span className="text-3xl text-game-primary">{score}</span></p>
            <Button
              onClick={startGame}
              className="beautiful-button w-full text-xl"
            >
              Play Again
            </Button>
          </div>
        ) : (
          <ComingSoon game="Pinball" />
        )}

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <GameControls onRestart={startGame} />
        </motion.div>
      </motion.div>
    </div>
  );
}
