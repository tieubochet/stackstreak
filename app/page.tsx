'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, CheckCircle2, AlertCircle, Loader2, Clock, Check, Coins, TrendingUp, Activity, TrendingDown, DollarSign, Palette } from 'lucide-react';
import { 
  authenticate, 
  logout, 
  submitCheckInTransaction, 
  submitVoteTransaction, 
  submitMintNftTransaction, 
  submitStakeTransaction, 
  submitPredictionTransaction,
  fetchBnsName,
  formatAddress, 
  getRealUserData, 
  userSession 
} from '../services/stacks';
import { UserData, AppState } from '../types';
import Spinner from '../components/Spinner';
import StreakCard from '../components/StreakCard';
import Leaderboard from '../components/Leaderboard';
import NextCheckInCountdown from '../components/NextCheckInCountdown';
import StreakHeatmap from '../components/StreakHeatmap';

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [bnsName, setBnsName] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [staking, setStaking] = useState(false);
  const [predicting, setPredicting] = useState<'up' | 'down' | null>(null);
  const [hasPredicted, setHasPredicted] = useState(false);
  
  // ✨ Theme States (Lưu trữ cục bộ)
  const [activeThemeId, setActiveThemeId] = useState<number>(0);
  
  const [reward, setReward] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState<'idle' | 'voting' | 'voted'>('idle');
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  // 1. Load theme từ localStorage khi vào web
  useEffect(() => {
    const savedTheme = localStorage.getItem('stacks_streak_theme');
    if (savedTheme) {
      setActiveThemeId(Number(savedTheme));
    }
  }, []);

  // 2. Áp dụng Theme vào body mỗi khi activeThemeId thay đổi
  useEffect(() => {
    document.body.setAttribute('data-theme', activeThemeId.toString());
  }, [activeThemeId]);

  useEffect(() => {
    setMounted(true);
    const initSession = async () => {
      if (userSession.isSignInPending()) {
        await userSession.handlePendingSignIn();
        window.history.replaceState({}, document.title, "/");
      }
      
      if (userSession.isUserSignedIn()) {
        const userData = await getRealUserData();
        setUser(userData);
        if (userData) {
          fetchBnsName(userData.address).then(name => name && setBnsName(name));
        }
      }
    };
    initSession();
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authenticate();
      setUser(userData);
      fetchBnsName(userData.address).then(name => name && setBnsName(name));
    } catch (e: any) {
      console.error(e);
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    logout();
    setUser(null);
    setAppState(AppState.IDLE);
    setVotingStatus('idle');
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    setAppState(AppState.CHECKING_IN);
    try {
      const { newData, reward: newReward } = await submitCheckInTransaction(user);
      setUser(newData);
      setReward(newReward);
      setLoading(false);
      setAppState(AppState.SPINNING);
    } catch (e: any) {
      setError("Transaction cancelled");
      setLoading(false);
      setAppState(AppState.IDLE);
    }
  };

  const handleVote = async (choice: boolean) => {
    setVotingStatus('voting');
    try { await submitVoteTransaction(choice); setVotingStatus('voted'); } catch (e) { setVotingStatus('idle'); }
  };
  const handleSpinComplete = () => { setTimeout(() => { setAppState(AppState.VOTING); }, 2000); };
  const handleMint = async () => { if (!user) return; setMinting(true); try { await submitMintNftTransaction(user); const u = await getRealUserData(); setUser(u); } catch (e) { } finally { setMinting(false); } };
  const handleStake = async () => { if (!user) return; setStaking(true); try { await submitStakeTransaction(); alert("Staked!"); } catch (e) { } finally { setStaking(false); } };
  const handlePredict = async (dir: 'up' | 'down') => { if (!user) return; setPredicting(dir); try { await submitPredictionTransaction(dir === 'up'); setHasPredicted(true); } catch (e) { } finally { setPredicting(null); } };

  // ✨ Handle Theme Selection (Local Only)
  const themes = [
    { id: 0, name: 'Standard', color: 'bg-orange-500' },
    { id: 1, name: 'Matrix', color: 'bg-green-500' },
    { id: 2, name: 'Cyberpunk', color: 'bg-fuchsia-500' },
  ];

  const handleSelectTheme = (id: number) => {
    setActiveThemeId(id);
    localStorage.setItem('stacks_streak_theme', id.toString());
  };

  if (!mounted) return null;

  const isCheckedInToday = user && user.lastCheckInAt && 
    new Date(user.lastCheckInAt).toDateString() === new Date(now).toDateString();
  const currentDayIndex = Math.floor(now / 86400000);
  const canCheckIn = user ? user.lastCheckInDay < currentDayIndex : false;
  const hasMintedToday = user ? user.lastMintDay === currentDayIndex : false;

  return (
    // Sử dụng màu từ biến CSS thay vì class cứng
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted">
                StacksStreak
              </span>
            </div>
            
            <div>
              {!user ? (
                <button onClick={handleConnect} disabled={loading} className="flex items-center space-x-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50">
                  <Wallet className="w-4 h-4" /><span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-foreground">{bnsName || formatAddress(user.address)}</p>
                    <p className="text-xs text-primary">{user.points} PTS</p>
                  </div>
                  <button onClick={handleDisconnect} className="p-2 hover:bg-card rounded-lg text-muted hover:text-foreground transition-colors"><LogOut className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero / Check-in Area */}
            <div className="bg-card rounded-3xl p-1 border border-border shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 pointer-events-none"></div>
               <div className="bg-background/50 backdrop-blur-sm rounded-[22px] p-8 md:p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                  {error && <div className="absolute top-4 mx-auto bg-red-500/20 text-red-200 px-4 py-2 rounded-lg border border-red-500/50 flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
                  {!user ? (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-border"><Wallet className="w-10 h-10 text-muted" /></div>
                      <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">Start Your <span className="text-primary">Streak</span></h1>
                      <button onClick={handleConnect} className="mt-8 px-8 py-3 bg-foreground text-background rounded-full font-bold hover:bg-muted transition-colors">Connect Wallet</button>
                    </div>
                  ) : (
                    <>
                       {appState === AppState.IDLE && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-lg">
                           <h2 className="text-3xl font-bold mb-2 text-foreground">Ready for today?</h2>
                           <p className="text-muted mb-6">Check in now to keep your {user.currentStreak}-day streak alive!</p>
                           <NextCheckInCountdown lastCheckInDay={user.lastCheckInDay} />
                           <button onClick={handleCheckIn} disabled={loading || !canCheckIn} className="group w-full sm:w-auto px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:shadow-[0_0_50px_rgba(var(--primary),0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mx-auto flex justify-center items-center gap-2">
                             {loading ? 'Waiting...' : !canCheckIn ? <><Clock className="w-6 h-6"/>Come back tomorrow</> : <><CheckCircle2 className="w-6 h-6"/>Check In Now</>}
                           </button>
                         </div>
                       )}
                       {appState === AppState.CHECKING_IN && <div className="text-center"><Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6"/><h3 className="text-xl font-bold">Check your wallet</h3></div>}
                       {appState === AppState.SPINNING && <Spinner spinning={true} onComplete={handleSpinComplete} rewardValue={reward} />}
                       {appState === AppState.VOTING && <div className="w-full max-w-md mx-auto"><h3 className="text-xl font-bold mb-4">Community Vote</h3><div className="grid grid-cols-2 gap-4"><button onClick={() => handleVote(true)} className="py-3 bg-card border border-border hover:border-primary transition-colors">Yes</button><button onClick={() => handleVote(false)} className="py-3 bg-card border border-border hover:border-red-500 transition-colors">No</button></div></div>}
                    </>
                  )}
               </div>
            </div>

            <StreakCard user={user} />

            {/* NFT Section */}
            {user && (
              <div className="bg-gradient-to-r from-card to-background border border-primary/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                 <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <img src="/assets/dolphin.jpg" className="w-32 h-32 rounded-xl shadow-lg border-2 border-primary/50" alt="NFT" />
                    <div className="flex-1">
                       <h3 className="text-xl font-bold text-foreground">Daily Collectible</h3>
                       <button onClick={handleMint} disabled={minting || hasMintedToday} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">{minting ? 'Minting...' : hasMintedToday ? 'Already Minted' : 'Mint NFT'}</button>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
             <Leaderboard />

             {/* ✨ THEME SWITCHER (Giao diện mới) */}
             <div className="bg-card rounded-2xl p-5 border border-border shadow-xl">
               <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                 <Palette className="w-5 h-5" /> Theme Selector
               </div>
               <div className="grid grid-cols-1 gap-2">
                 {themes.map((theme) => {
                   const isActive = activeThemeId === theme.id;
                   return (
                     <button
                       key={theme.id}
                       onClick={() => handleSelectTheme(theme.id)}
                       className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                         isActive 
                           ? 'border-primary bg-primary/10' 
                           : 'border-border bg-background/50 hover:bg-muted/20'
                       }`}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-6 h-6 rounded-full ${theme.color} border border-white/20`}></div>
                         <span className={`text-sm font-bold ${isActive ? 'text-foreground' : 'text-muted'}`}>
                           {theme.name}
                         </span>
                       </div>
                       {isActive && <Check className="w-4 h-4 text-primary" />}
                     </button>
                   )
                 })}
               </div>
             </div>

             {/* Prediction Market */}
             {user && (
               <div className="bg-card rounded-2xl p-5 border border-border shadow-xl">
                 <div className="flex items-center gap-2 mb-4 text-foreground font-bold"><DollarSign className="w-5 h-5 text-primary" /> Prediction</div>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handlePredict('up')} className="py-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 rounded-xl text-green-400 font-bold">UP</button>
                    <button onClick={() => handlePredict('down')} className="py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-xl text-red-400 font-bold">DOWN</button>
                 </div>
               </div>
             )}

             {/* Stake */}
             {user && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3 text-yellow-500"><Coins className="w-6 h-6" /><h3 className="font-bold">Stake 0.1 STX</h3></div>
                <button onClick={handleStake} disabled={staking} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">{staking ? 'Processing...' : 'Stake Now'}</button>
              </div>
             )}
             
             {/* Heatmap */}
             {user && (user.streakDays.length > 0 || user.currentStreak > 0) && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
                <StreakHeatmap streakDays={user.streakDays.length > 0 ? user.streakDays : Array.from({length: user.currentStreak}, (_, i) => Math.floor(Date.now()/86400000) - i)} days={30} />
              </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}