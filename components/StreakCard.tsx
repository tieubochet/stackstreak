import React from 'react';
import { Flame, Trophy, Calendar, Share2 } from 'lucide-react'; 
import { UserData } from '../types';

interface StreakCardProps {
  user: UserData | null;
}

const StreakCard: React.FC<StreakCardProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center animate-pulse">
        <p className="text-slate-400">Connect wallet to view streak</p>
      </div>
    );
  }

  const progressPercentage = Math.min((user.currentStreak / 7) * 100, 100);

 
  const handleShare = () => {
    const text = `🔥 I'm on a ${user.currentStreak}-day streak on StacksStreak! \n\nChecking in daily to earn rewards and mint exclusive NFTs on #Stacks.\n\nJoin me here:`;
    const url = "https://stackstreak.vercel.app"; 
    const hashtags = "Bitcoin,Stacks,Web3";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      
      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
        {/* Background Effect */}
        <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
        
        
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-all duration-200 z-20 hover:scale-105 active:scale-95 group/btn"
          title="Share on X"
        >
          <Share2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
        </button>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wide opacity-90">Current Streak</span>
          </div>
          <div className="text-5xl font-black mb-1">{user.currentStreak} <span className="text-lg font-medium opacity-75">days</span></div>
          <p className="text-sm mt-2 opacity-80 font-medium">Keep it up! Next milestone: 7 days</p>
        </div>
      </div>

      {/* Best Streak */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col justify-center relative hover:border-slate-600 transition-colors">
        <div className="flex items-center space-x-2 mb-2 text-slate-400">
          <Trophy className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm uppercase tracking-wide">All-time Best</span>
        </div>
        <div className="text-4xl font-bold text-white">{user.bestStreak}</div>
      </div>

      {/* Total Points */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col justify-center relative hover:border-slate-600 transition-colors">
        <div className="flex items-center space-x-2 mb-2 text-slate-400">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm uppercase tracking-wide">Total Points</span>
        </div>
        <div className="text-4xl font-bold text-white">{user.points}</div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="col-span-1 md:col-span-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mt-2">
        <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">
          <span>Weekly Goal</span>
          <span>{user.currentStreak % 7} / 7 Days</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;