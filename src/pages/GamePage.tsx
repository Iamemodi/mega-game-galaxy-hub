
import { useParams, Navigate } from "react-router-dom";
import { TapDot } from "../games/TapDot";
import { Game2048 } from "../games/Game2048";
import { MemoryFlip } from "../games/MemoryFlip";

const GamePage = () => {
  const { gameId } = useParams();

  // Render the appropriate game based on gameId
  const renderGame = () => {
    switch (gameId) {
      case "tap-dot":
        return <TapDot />;
      case "2048":
        return <Game2048 />;
      case "memory-flip":
        return <MemoryFlip />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        {renderGame()}
      </main>
    </div>
  );
};

export default GamePage;
