
import { Home, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface GameControlsProps {
  onRestart?: () => void;
}

export function GameControls({ onRestart }: GameControlsProps) {
  const [muted, setMuted] = useState(false);
  const navigate = useNavigate();

  const toggleMute = () => {
    setMuted(!muted);
    // In a real app, this would control actual audio
  };

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="game-controls">
      <button
        onClick={handleHome}
        className="rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 active:scale-95"
      >
        <Home className="h-6 w-6" />
      </button>
      
      <button
        onClick={handleRestart}
        className="rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 active:scale-95"
      >
        <RefreshCw className="h-6 w-6" />
      </button>
      
      <button
        onClick={toggleMute}
        className="rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 active:scale-95"
      >
        {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </button>
    </div>
  );
}
