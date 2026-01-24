import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';

interface SpinnerProps {
  spinning: boolean;
  onComplete: () => void;
  rewardValue?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ spinning, onComplete, rewardValue }) => {
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (spinning) {
      setShowResult(false);
      // Fast spin animation
      const interval = setInterval(() => {
        setRotation((prev) => prev + 25);
      }, 16);

      // Stop after random time between 2-3s
      const stopTime = 2000 + Math.random() * 1000;
      setTimeout(() => {
        clearInterval(interval);
        // Snap to a position
        setRotation((prev) => {
          const snap = Math.ceil(prev / 360) * 360 + 180; // Land at bottom/top
          return snap; 
        });
        setTimeout(() => {
          setShowResult(true);
          onComplete();
        }, 500);
      }, stopTime);

      return () => clearInterval(interval);
    }
  }, [spinning, onComplete]);

  return (
    <div className="relative w-64 h-64 mx-auto my-8">
      {/* Outer Glow */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${spinning ? 'bg-orange-500/30' : 'bg-transparent'}`}></div>
      
      {/* The Wheel */}
      <div 
        className="w-full h-full rounded-full border-4 border-slate-700 bg-slate-800 relative overflow-hidden shadow-2xl transition-transform duration-[2000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Wheel Slices */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-full h-0.5 bg-slate-700 absolute rotate-0"></div>
           <div className="w-full h-0.5 bg-slate-700 absolute rotate-45"></div>
           <div className="w-full h-0.5 bg-slate-700 absolute rotate-90"></div>
           <div className="w-full h-0.5 bg-slate-700 absolute rotate-135"></div>
        </div>
        
        {/* Center Hub */}
        <div className="absolute inset-0 m-auto w-16 h-16 bg-slate-900 rounded-full border-2 border-orange-500 flex items-center justify-center z-10 shadow-lg">
           <Gift className="text-orange-500 w-8 h-8" />
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="w-8 h-8 bg-orange-500 rotate-45 transform origin-center shadow-lg border-2 border-white"></div>
      </div>

      {/* Result Popup */}
      {showResult && rewardValue && (
        <div className="absolute inset-0 flex items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
           <div className="bg-slate-900/90 backdrop-blur-md border border-orange-500 p-6 rounded-2xl text-center shadow-2xl">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Daily Reward</p>
              <p className="text-4xl font-extrabold text-white">+{rewardValue} <span className="text-orange-500 text-lg">PTS</span></p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Spinner;