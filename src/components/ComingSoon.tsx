
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

export function ComingSoon({ game }: { game?: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[420px] w-full max-w-md border-4 border-dashed bg-gradient-to-t from-slate-100/80 to-game-arcade/30 rounded-3xl shadow-inner"
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", delay: 0.1 }}
    >
      <Gamepad2 size={54} className="text-game-primary mb-5 animate-float" />
      <h2 className="text-3xl font-bold mb-2 text-fuchsia-700 font-playfair animate-fade-in">
        {game ?? "This Game"} Coming Soon
      </h2>
      <p className="text-muted-foreground text-lg text-center px-6 mb-3 font-inter animate-fade-in">
        Our team is working hard on this one! Check back again soon to play
        <span className="text-game-primary font-bold ml-1">{game ?? ""}</span>
        .
      </p>
    </motion.div>
  );
}
