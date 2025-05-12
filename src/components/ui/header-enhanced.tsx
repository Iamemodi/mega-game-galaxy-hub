
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Gamepad2 } from "lucide-react";
import { Button } from "./button";

export function HeaderEnhanced() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Track scroll position to apply styling changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? "py-2 bg-white/90 dark:bg-background/90 backdrop-blur-md shadow-md" 
          : "py-4 bg-transparent"
      }`}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-1.5 bg-gradient-to-br from-game-primary to-purple-700 rounded-lg shadow-lg"
          >
            <Gamepad2 size={24} className="text-white" />
          </motion.div>
          <div className="flex flex-col">
            <motion.span 
              className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-purple-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              100 in 1
            </motion.span>
            <span className="text-xs text-muted-foreground -mt-1">Game Collection</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`font-medium hover:text-game-primary transition-colors ${
              location.pathname === "/" ? "text-game-primary" : ""
            }`}
          >
            Home
          </Link>
          <Link 
            to="/category/arcade" 
            className={`font-medium hover:text-game-primary transition-colors ${
              location.pathname === "/category/arcade" ? "text-game-primary" : ""
            }`}
          >
            Arcade
          </Link>
          <Link 
            to="/category/puzzle" 
            className={`font-medium hover:text-game-primary transition-colors ${
              location.pathname === "/category/puzzle" ? "text-game-primary" : ""
            }`}
          >
            Puzzle
          </Link>
          <Link 
            to="/category/strategy" 
            className={`font-medium hover:text-game-primary transition-colors ${
              location.pathname === "/category/strategy" ? "text-game-primary" : ""
            }`}
          >
            Strategy
          </Link>
          <Link 
            to="/category/word" 
            className={`font-medium hover:text-game-primary transition-colors ${
              location.pathname === "/category/word" ? "text-game-primary" : ""
            }`}
          >
            Word
          </Link>
          <Link 
            to="/category/idle" 
            className={`font-medium hover:text-game-primary transition-colors ${
              location.pathname === "/category/idle" ? "text-game-primary" : ""
            }`}
          >
            Idle
          </Link>
        </nav>

        {/* Search and Mobile Menu Actions */}
        <div className="flex items-center space-x-4">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-background shadow-lg border-t"
          >
            <nav className="container px-4 py-4 flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg ${
                  location.pathname === "/" 
                    ? "bg-game-primary/10 text-game-primary font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Home
              </Link>
              <Link 
                to="/category/arcade" 
                className={`px-4 py-2 rounded-lg ${
                  location.pathname === "/category/arcade" 
                    ? "bg-game-arcade/30 text-black font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Arcade Games
              </Link>
              <Link 
                to="/category/puzzle" 
                className={`px-4 py-2 rounded-lg ${
                  location.pathname === "/category/puzzle" 
                    ? "bg-game-puzzle/30 text-black font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Puzzle Games
              </Link>
              <Link 
                to="/category/strategy" 
                className={`px-4 py-2 rounded-lg ${
                  location.pathname === "/category/strategy" 
                    ? "bg-game-strategy/30 text-black font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Strategy Games
              </Link>
              <Link 
                to="/category/word" 
                className={`px-4 py-2 rounded-lg ${
                  location.pathname === "/category/word" 
                    ? "bg-game-word/30 text-black font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Word Games
              </Link>
              <Link 
                to="/category/idle" 
                className={`px-4 py-2 rounded-lg ${
                  location.pathname === "/category/idle" 
                    ? "bg-game-idle/30 text-black font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Idle Games
              </Link>
              <Link 
                to="/search" 
                className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Games
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
