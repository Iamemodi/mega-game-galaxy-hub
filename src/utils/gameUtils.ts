// Game utility functions and types

export type GameScore = {
  score: number;
  timestamp: number;
};

export type GameData = {
  id: string;
  title: string;
  category: string;
  played: number;
  highScore?: number;
  recentScores?: GameScore[];
};

// Get high score for a game
export function getHighScore(gameId: string): number {
  try {
    const gameData = localStorage.getItem(`game_${gameId}`);
    if (gameData) {
      const data: GameData = JSON.parse(gameData);
      return data.highScore || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting high score:", error);
    return 0;
  }
}

// Save score for a game
export function saveScore(gameId: string, score: number): void {
  try {
    // Get existing data
    const existingDataStr = localStorage.getItem(`game_${gameId}`);
    let gameData: GameData;
    
    if (existingDataStr) {
      gameData = JSON.parse(existingDataStr);
      gameData.played += 1;
      
      // Update high score if needed
      if (!gameData.highScore || score > gameData.highScore) {
        gameData.highScore = score;
      }
      
      // Add to recent scores
      if (!gameData.recentScores) {
        gameData.recentScores = [];
      }
      
      gameData.recentScores.push({
        score,
        timestamp: Date.now(),
      });
      
      // Keep only last 5 scores
      if (gameData.recentScores.length > 5) {
        gameData.recentScores = gameData.recentScores.slice(-5);
      }
    } else {
      // Create new game data
      gameData = {
        id: gameId,
        title: gameId, // This would be replaced with actual title
        category: "unknown",
        played: 1,
        highScore: score,
        recentScores: [{ score, timestamp: Date.now() }],
      };
    }
    
    // Save back to storage
    localStorage.setItem(`game_${gameId}`, JSON.stringify(gameData));
    
    // Update recent games list
    updateRecentGames(gameId);
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

// Update recent games list
function updateRecentGames(gameId: string): void {
  try {
    const recentGamesStr = localStorage.getItem("recentGames");
    let recentGames: Array<{ id: string; timestamp: number }> = [];
    
    if (recentGamesStr) {
      recentGames = JSON.parse(recentGamesStr);
      // Remove this game if it exists
      recentGames = recentGames.filter(g => g.id !== gameId);
    }
    
    // Add to beginning
    recentGames.unshift({
      id: gameId,
      timestamp: Date.now(),
    });
    
    // Keep only last 10 games
    if (recentGames.length > 10) {
      recentGames = recentGames.slice(0, 10);
    }
    
    localStorage.setItem("recentGames", JSON.stringify(recentGames));
  } catch (error) {
    console.error("Error updating recent games:", error);
  }
}

// Reset all game data (for testing)
export function resetAllGameData(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith("game_") || key === "recentGames") {
        localStorage.removeItem(key);
      }
    });
    console.log("All game data has been reset");
  } catch (error) {
    console.error("Error resetting game data:", error);
  }
}
