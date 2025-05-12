
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";
import { motion } from "framer-motion";

// List of common English letters with their frequencies for better letter distribution
const LETTER_FREQUENCIES: { [key: string]: number } = {
  'A': 8.2, 'B': 1.5, 'C': 2.8, 'D': 4.3, 'E': 12.7, 'I': 7.0,
  'F': 2.2, 'G': 2.0, 'H': 6.1, 'J': 0.2, 'K': 0.8, 'L': 4.0,
  'M': 2.4, 'N': 6.7, 'O': 7.5, 'P': 1.9, 'Q': 0.1, 'R': 6.0,
  'S': 6.3, 'T': 9.1, 'U': 2.8, 'V': 1.0, 'W': 2.4, 'X': 0.2,
  'Y': 2.0, 'Z': 0.1
};

// Common vowels
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Dictionary for word validation (partial - just for demo)
const DICTIONARY = [
  "ACT", "ADD", "AGE", "AGO", "AIR", "ALL", "AND", "ANT", "ANY", "APE", "ART", "ASK", "BAD", "BAG", 
  "BAR", "BAT", "BEE", "BIG", "BIT", "BOX", "BOY", "BUG", "BUS", "BUY", "CAB", "CAP", "CAR", "CAT", 
  "COW", "CRY", "CUP", "CUT", "DAD", "DAY", "DIG", "DOG", "DOT", "DRY", "EAR", "EAT", "EGG", "END",
  "EYE", "FAR", "FAT", "FIT", "FLY", "FOR", "FUN", "GAS", "GET", "GOD", "GOT", "GUN", "GYM", "HAD",
  "HAT", "HER", "HIM", "HIS", "HIT", "HOT", "HOW", "ICE", "INK", "ITS", "JOB", "JOY", "KEY", "KID",
  "LAW", "LAY", "LEG", "LET", "LIE", "LIP", "LOG", "LOW", "MAD", "MAN", "MAP", "MAY", "MEN", "MIX",
  "MOB", "MOP", "MUD", "MUG", "NET", "NEW", "NOD", "NOT", "NOW", "NUT", "OFF", "OIL", "OLD", "ONE",
  "OUR", "OUT", "OWL", "OWN", "PAD", "PAN", "PAY", "PEN", "PET", "PIE", "PIG", "PIN", "POT", "PUT",
  "RAT", "RAW", "RED", "RIB", "RID", "RIP", "ROD", "ROW", "RUB", "RUG", "RUN", "SAD", "SAW", "SAY",
  "SEA", "SEE", "SET", "SEW", "SHE", "SHY", "SIN", "SIP", "SIR", "SIT", "SIX", "SKI", "SKY", "SLY",
  "SON", "SPY", "SUM", "SUN", "TAG", "TAP", "TAX", "TEA", "TEN", "THE", "TIE", "TIN", "TIP", "TOE",
  "TOP", "TOY", "TRY", "TWO", "USE", "VAN", "WAR", "WAX", "WAY", "WET", "WHO", "WHY", "WIN", "WON",
  "YES", "YET", "YOU", "ZOO",
  
  "ABLE", "ACID", "AWAY", "BABY", "BACK", "BALL", "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT",
  "BEEN", "BEER", "BELL", "BELT", "BEST", "BILL", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOMB",
  "BOND", "BONE", "BOOK", "BOOM", "BORN", "BOSS", "BOTH", "DOWN", "DRAW", "DUCK", "DUMP", "DUST",
  "DUTY", "EACH", "EARN", "EAST", "EASY", "EDGE", "EGGS", "ELSE", "EVEN", "EVER", "EVIL", "EXIT",
  "FACE", "FACT", "FADE", "FAIL", "FAIR", "FALL", "FARM", "FAST", "FEAR", "FEED", "FEEL", "FEET",
  "FELL", "FELT", "FILE", "FILL", "FILM", "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIVE", "FLAG",
  "FLAT", "FLOW", "FOLD", "FOOD", "FOOT", "FORK", "FORM", "FOUR", "FREE", "FROM", "FUEL", "FULL",
  "FUND", "GAIN", "GAME", "GATE", "GAVE", "GEAR", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL", "GOES",
  "GOLD", "GOLF", "GONE", "GOOD", "GRAY", "GREW", "GREY", "GROW", "GULF", "HAIR", "HALF", "HALL",
  "HAND", "HANG", "HARD", "HARM", "HATE", "HAVE", "HEAD", "HEAR", "HEAT", "HELD", "HELL", "HELP",
  "HERE", "HERO", "HERS", "HIGH", "HILL", "HIRE", "HOLD", "HOLE", "HOLY", "HOME", "HOPE", "HOST",
  "HOUR", "HUGE", "HUNG", "HUNT", "HURT", "IDEA", "INCH", "INTO", "IRON", "ITEM", "JACK", "JANE",
  "JEAN", "JOHN", "JOIN", "JUMP", "JURY", "JUST", "KEEN", "KEEP", "KENT", "KEPT", "KICK", "KILL",
  "KIND", "KING", "KNEW", "KNOW", "LACK", "LADY", "LAID", "LAKE", "LAND", "LANE", "LAST", "LATE",
  "LEAD", "LEFT", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LIST", "LIVE", "LOAD", "LOAN",
  "LOCK", "LOGO", "LONG", "LOOK", "LORD", "LOSE", "LOSS", "LOST", "LOVE", "LUCK",
  
  "SHIRT", "SCHOOL", "PLASTIC", "ANIMAL", "WINDOW", "SYSTEM", "PLANET", "MARKET", "FRIEND", "OFFICE",
  "SUMMER", "WINTER", "FOREST", "GARDEN", "FAMILY", "PEOPLE", "BRIDGE", "CAMERA", "FINISH", "TARGET",
  "FOLLOW", "HEALTH", "TRAVEL", "BEAUTY", "MINUTE", "SECOND", "OBJECT", "ENERGY", "DINNER", "MASTER"
];

export function WordRush() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [highestScoringWord, setHighestScoringWord] = useState({ word: "", score: 0 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Generate a set of letters
  const generateLetters = (count: number = 12) => {
    const letters: string[] = [];
    
    // Ensure at least 3 vowels
    let vowelsCount = 0;
    while (vowelsCount < 3) {
      const vowel = VOWELS[Math.floor(Math.random() * VOWELS.length)];
      letters.push(vowel);
      vowelsCount++;
    }
    
    // Fill the rest with weighted random letters
    while (letters.length < count) {
      // Create a weighted selection based on letter frequency
      const allLetters = Object.keys(LETTER_FREQUENCIES);
      const totalFrequency = Object.values(LETTER_FREQUENCIES).reduce((sum, freq) => sum + freq, 0);
      
      let random = Math.random() * totalFrequency;
      let selectedLetter = 'E'; // Default if something goes wrong
      
      // Select a letter based on frequency
      for (const letter in LETTER_FREQUENCIES) {
        random -= LETTER_FREQUENCIES[letter];
        if (random <= 0) {
          selectedLetter = letter;
          break;
        }
      }
      
      letters.push(selectedLetter);
    }
    
    // Shuffle the letters
    return letters.sort(() => Math.random() - 0.5);
  };
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setAvailableLetters(generateLetters());
    setCurrentWord("");
    setFoundWords([]);
    setHighestScoringWord({ word: "", score: 0 });
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle letter click
  const handleLetterClick = (letter: string) => {
    if (!gameActive || gameOver) return;
    
    setCurrentWord(prev => prev + letter);
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle word submission
  const handleSubmitWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!gameActive || gameOver || !currentWord) return;
    
    // Convert to uppercase for comparison
    const submittedWord = currentWord.toUpperCase();
    
    // Check if the word is valid
    if (isValidWord(submittedWord)) {
      // Calculate word score
      const wordScore = calculateWordScore(submittedWord);
      
      // Update score
      setScore(prev => prev + wordScore);
      
      // Add to found words
      setFoundWords(prev => [...prev, submittedWord]);
      
      // Check if it's the highest scoring word
      if (wordScore > highestScoringWord.score) {
        setHighestScoringWord({ word: submittedWord, score: wordScore });
      }
      
      // Success feedback
      toast.success(`+${wordScore} points!`);
    } else {
      // Error feedback
      toast.error("Not a valid word!");
    }
    
    // Clear the input
    setCurrentWord("");
  };
  
  // Calculate word score based on length
  const calculateWordScore = (word: string) => {
    const length = word.length;
    
    // Scoring table
    if (length <= 2) return 0;
    if (length === 3) return 100;
    if (length === 4) return 400;
    if (length === 5) return 800;
    
    // Bonus for longer words
    return 1000 + (length - 5) * 500;
  };
  
  // Validate word
  const isValidWord = (word: string) => {
    // Must be at least 3 letters
    if (word.length < 3) return false;
    
    // Check if the word is in the dictionary
    if (!DICTIONARY.includes(word)) return false;
    
    // Check if the word has already been found
    if (foundWords.includes(word)) return false;
    
    // Check if the word can be formed from available letters
    const availableLettersCopy = [...availableLetters];
    for (const char of word) {
      const index = availableLettersCopy.indexOf(char);
      if (index === -1) return false;
      availableLettersCopy.splice(index, 1);
    }
    
    return true;
  };
  
  // Clear current word
  const clearCurrentWord = () => {
    setCurrentWord("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameActive && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameActive, gameOver]);
  
  // End game
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    saveScore("word-rush", score);
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || gameOver) return;
      
      if (e.key === 'Enter') {
        handleSubmitWord();
        return;
      }
      
      if (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace') {
        clearCurrentWord();
        return;
      }
      
      // Check if the key is a letter
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) {
        // Check if the letter is available
        const index = availableLetters.indexOf(letter);
        if (index !== -1) {
          handleLetterClick(letter);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive, gameOver, availableLetters, currentWord]);

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Word Rush</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Time: {timeLeft}s</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Form as many words as possible from a set of letters before time runs out. 
            The longer the word, the higher your score!
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-4">Your score: {score}</p>
          
          {highestScoringWord.word && (
            <div className="mb-6">
              <p className="font-bold">Best word: {highestScoringWord.word}</p>
              <p>({highestScoringWord.score} points)</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">Words Found:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {foundWords.length > 0 ? (
                foundWords.map((word, index) => (
                  <div key={index} className="bg-gray-100 px-2 py-1 rounded">
                    {word}
                  </div>
                ))
              ) : (
                <p>No words found</p>
              )}
            </div>
          </div>
          
          <Button
            onClick={startGame}
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Current Word */}
          <form onSubmit={handleSubmitWord} className="w-full mb-6">
            <div className="flex">
              <Input
                ref={inputRef}
                type="text"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
                placeholder="Type or click letters..."
                className="flex-grow text-xl h-12"
                readOnly
              />
              <Button 
                type="button"
                onClick={clearCurrentWord}
                className="ml-2 bg-red-500 hover:bg-red-600"
              >
                Clear
              </Button>
              <Button 
                type="submit"
                className="ml-2 bg-game-word hover:bg-game-word/90 text-black"
              >
                Submit
              </Button>
            </div>
          </form>
          
          {/* Available Letters */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {availableLetters.map((letter, index) => (
              <motion.button
                key={index}
                onClick={() => handleLetterClick(letter)}
                className="w-16 h-16 bg-game-word text-black font-bold text-2xl rounded-lg shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {letter}
              </motion.button>
            ))}
          </div>
          
          {/* Found Words */}
          <div className="w-full">
            <h3 className="font-bold mb-2">Words Found: {foundWords.length}</h3>
            <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
              {foundWords.length > 0 ? (
                foundWords.map((word, index) => (
                  <div key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {word}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No words found yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
