
import { Header } from "../components/Header";
import { DailyPick } from "../components/DailyPick";
import { FeaturedGames } from "../components/FeaturedGames";
import { GameCategories } from "../components/GameCategories";
import { RecentGames } from "../components/RecentGames";
import { Link } from "react-router-dom";
import { GameCard } from "../components/GameCard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-4 pb-20">
        <h1 className="text-3xl font-bold mt-4 mb-6">
          <span className="text-game-primary">100 in 1</span> Games
        </h1>
        
        <DailyPick />
        <GameCategories />
        
        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">New Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <GameCard 
              title="Snake" 
              category="Arcade"
              gameId="snake-game" 
              bgColor="bg-game-arcade" 
              icon="🐍"
              description="Eat and grow longer"
            />
            <GameCard 
              title="Flappy Bird" 
              category="Arcade"
              gameId="flappy-bird" 
              bgColor="bg-game-arcade"
              icon="🐦"
              description="Fly through pipes" 
            />
            <GameCard 
              title="Connect Four" 
              category="Strategy"
              gameId="connect-four" 
              bgColor="bg-game-strategy"
              icon="⚫️"
              description="Connect 4 in a row"
            />
            <GameCard 
              title="Simon Says" 
              category="Strategy"
              gameId="simon-says" 
              bgColor="bg-game-strategy"
              icon="🎵"
              description="Remember the pattern"
            />
            <GameCard 
              title="Word Search" 
              category="Word"
              gameId="word-search" 
              bgColor="bg-game-word"
              icon="🔍"
              description="Find hidden words"
            />
            <GameCard 
              title="Hangman" 
              category="Word"
              gameId="hangman" 
              bgColor="bg-game-word"
              icon="✎" 
              description="Guess the word"
            />
            <GameCard 
              title="Cookie Clicker" 
              category="Idle"
              gameId="cookie-clicker" 
              bgColor="bg-game-idle"
              icon="🍪"
              description="Bake virtual cookies" 
            />
            <GameCard 
              title="Tower of Hanoi" 
              category="Puzzle"
              gameId="tower-of-hanoi" 
              bgColor="bg-game-puzzle"
              icon="🏔️"
              description="Move the stack of disks"
            />
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">All Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Arcade Games */}
            <GameCard 
              title="Tap The Button" 
              category="Arcade"
              gameId="tap-button" 
              bgColor="bg-game-arcade"
              icon="○" 
              description="Tap as fast as you can"
            />
            <GameCard 
              title="Avoid The Spikes" 
              category="Arcade"
              gameId="avoid-spikes" 
              bgColor="bg-game-arcade"
              icon="▲"
              description="Dodge the obstacles"
            />
            <GameCard 
              title="Reaction Time Tester" 
              category="Arcade"
              gameId="reaction-tester" 
              bgColor="bg-game-arcade"
              icon="⚡"
              description="How fast can you react?"
            />
            <GameCard 
              title="Tap the Dot" 
              category="Arcade"
              gameId="tap-dot" 
              bgColor="bg-game-arcade"
              icon="●"
              description="Test your reflexes"
            />
            <GameCard 
              title="Snake" 
              category="Arcade"
              gameId="snake-game" 
              bgColor="bg-game-arcade"
              icon="🐍"
              description="Eat and grow longer" 
            />
            <GameCard 
              title="Flappy Bird" 
              category="Arcade"
              gameId="flappy-bird" 
              bgColor="bg-game-arcade"
              icon="🐦"
              description="Fly through pipes" 
            />
            
            {/* Puzzle Games */}
            <GameCard 
              title="2048" 
              category="Puzzle"
              gameId="2048" 
              bgColor="bg-game-puzzle"
              icon="◼"
              description="Merge the numbers"
            />
            <GameCard 
              title="Memory Flip" 
              category="Puzzle"
              gameId="memory-flip" 
              bgColor="bg-game-puzzle"
              icon="☰"
              description="Train your memory"
            />
            <GameCard 
              title="Sliding Puzzle" 
              category="Puzzle"
              gameId="sliding-puzzle" 
              bgColor="bg-game-puzzle"
              icon="◫"
              description="Arrange the tiles" 
            />
            <GameCard 
              title="Color Match" 
              category="Puzzle"
              gameId="color-match" 
              bgColor="bg-game-puzzle"
              icon="🎨"
              description="Match the right color"
            />
            <GameCard 
              title="Math Puzzle" 
              category="Puzzle"
              gameId="math-puzzle" 
              bgColor="bg-game-puzzle"
              icon="➗"
              description="Solve math problems"
            />
            <GameCard 
              title="Tower of Hanoi" 
              category="Puzzle"
              gameId="tower-of-hanoi" 
              bgColor="bg-game-puzzle"
              icon="🏔️"
              description="Move the stack of disks"
            />
            
            {/* Word Games */}
            <GameCard 
              title="Word Scramble" 
              category="Word"
              gameId="word-scramble" 
              bgColor="bg-game-word"
              icon="Aa"
              description="Unscramble the words"
            />
            <GameCard 
              title="Word Search" 
              category="Word"
              gameId="word-search" 
              bgColor="bg-game-word"
              icon="🔍"
              description="Find hidden words"
            />
            <GameCard 
              title="Hangman" 
              category="Word"
              gameId="hangman" 
              bgColor="bg-game-word"
              icon="✎"
              description="Guess the word"
            />
            
            {/* Strategy Games */}
            <GameCard 
              title="Tic Tac Toe" 
              category="Strategy"
              gameId="tic-tac-toe" 
              bgColor="bg-game-strategy"
              icon="✕"
              description="Classic 3x3 game"
            />
            <GameCard 
              title="Rock Paper Scissors" 
              category="Strategy"
              gameId="rock-paper-scissors" 
              bgColor="bg-game-strategy"
              icon="✊"
              description="Make your choice"
            />
            <GameCard 
              title="Connect Four" 
              category="Strategy"
              gameId="connect-four" 
              bgColor="bg-game-strategy"
              icon="⚫️"
              description="Connect 4 in a row"
            />
            <GameCard 
              title="Simon Says" 
              category="Strategy"
              gameId="simon-says" 
              bgColor="bg-game-strategy"
              icon="🎵"
              description="Remember the pattern"
            />
            
            {/* Idle Games */}
            <GameCard 
              title="Idle Clicker" 
              category="Idle"
              gameId="idle-clicker" 
              bgColor="bg-game-idle"
              icon="💰"
              description="Click and earn coins"
            />
            <GameCard 
              title="Cookie Clicker" 
              category="Idle"
              gameId="cookie-clicker" 
              bgColor="bg-game-idle"
              icon="🍪"
              description="Bake virtual cookies"
            />
          </div>
        </div>
        
        <FeaturedGames />
        <RecentGames />
      </main>
    </div>
  );
};

export default Index;
