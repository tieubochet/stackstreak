'use client';

import React, { useState, useEffect } from 'react';

import { Wallet, LogOut, CheckCircle2, AlertCircle, Loader2, Clock, Check, Coins, TrendingUp, Activity, TrendingDown, DollarSign } from 'lucide-react';
import { 
  authenticate, 
  logout, 
  submitCheckInTransaction, 
  submitVoteTransaction,
  submitMintNftTransaction, 
  submitStakeTransaction,
  submitPredictionTransaction, 
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
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [staking, setStaking] = useState(false);
  
  // ✨ State cho Prediction
  const [predicting, setPredicting] = useState<'up' | 'down' | null>(null); 
  const [hasPredicted, setHasPredicted] = useState(false); 

  const [reward, setReward] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState<'idle' | 'voting' | 'voted'>('idle');
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

 
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
      }
    };
    initSession();
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ... (Giữ nguyên các hàm handleConnect, handleDisconnect, handleCheckIn, handleVote, handleMint, handleStake...)
  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authenticate();
      setUser(userData);
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
    try {
      await submitVoteTransaction(choice);
      setVotingStatus('voted');
    } catch (e: any) {
      setVotingStatus('idle');
    }
  };

  const handleSpinComplete = () => {
    setTimeout(() => {
      setAppState(AppState.VOTING);
    }, 2000);
  };

  const handleMint = async () => {
    if (!user) return;
    setMinting(true);
    try {
      await submitMintNftTransaction(user);
      const updatedUser = await getRealUserData();
      setUser(updatedUser);
    } catch (e) { console.error(e); } finally { setMinting(false); }
  };

  const handleStake = async () => {
    if (!user) return;
    setStaking(true);
    try {
      await submitStakeTransaction();
      alert("Staking successful! 🚀");
    } catch (e) { console.error(e); } finally { setStaking(false); }
  };


  const handlePredict = async (direction: 'up' | 'down') => {
    if (!user) return;
    setPredicting(direction);
    try {
      await submitPredictionTransaction(direction === 'up');
      setHasPredicted(true); 
      alert(`You predicted STX will go ${direction.toUpperCase()}! 📈`);
    } catch (e) {
      console.error(e);
    } finally {
      setPredicting(null);
    }
  };

  if (!mounted) return null;

  const isCheckedInToday = user && user.lastCheckInAt && 
    new Date(user.lastCheckInAt).toDateString() === new Date(now).toDateString();
  const currentDayIndex = Math.floor(now / 86400000);
  const canCheckIn = user ? user.lastCheckInDay < currentDayIndex : false;
  const hasMintedToday = user ? user.lastMintDay === currentDayIndex : false;

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-orange-500 selection:text-white">
   
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                StacksStreak
              </span>
            </div>
            <div>
              {!user ? (
                <button onClick={handleConnect} disabled={loading} className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50">
                  <Wallet className="w-4 h-4" /><span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-white">{formatAddress(user.address)}</p>
                    <p className="text-xs text-orange-400">{user.points} PTS</p>
                  </div>
                  <button onClick={handleDisconnect} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Actions (Giữ nguyên Check-in, NFT) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero / Check-in Area */}
            <div className="bg-slate-800 rounded-3xl p-1 border border-slate-700 shadow-2xl overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10 pointer-events-none"></div>
               <div className="bg-slate-900/50 backdrop-blur-sm rounded-[22px] p-8 md:p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                  {error && <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-500/20 text-red-200 px-4 py-2 rounded-lg border border-red-500/50 flex items-center gap-2 text-sm z-50"><AlertCircle className="w-4 h-4" />{error}</div>}
                  {!user ? (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-slate-700"><Wallet className="w-10 h-10 text-slate-500" /></div>
                      <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Start Your <span className="text-orange-500">Streak</span></h1>
                      <p className="text-slate-400 text-lg max-w-md mx-auto">Connect Leather or Xverse wallet to check in.</p>
                      <button onClick={handleConnect} className="mt-8 px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors">Connect Wallet</button>
                    </div>
                  ) : (
                    <>
                       {appState === AppState.IDLE && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-lg">
                           <h2 className="text-3xl font-bold mb-2">Ready for today?</h2>
                           <p className="text-slate-400 mb-6">Check in now to keep your {user.currentStreak}-day streak alive!</p>
                           <NextCheckInCountdown lastCheckInDay={user.lastCheckInDay} />
                           <div>
                             <button onClick={handleCheckIn} disabled={loading || !canCheckIn} className="group relative w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mx-auto flex justify-center disabled:hover:translate-y-0 disabled:hover:shadow-none">
                               <span className="flex items-center space-x-2">{loading ? <span>Waiting...</span> : !canCheckIn ? <><Clock className="w-6 h-6" /><span>Come back tomorrow</span></> : <><CheckCircle2 className="w-6 h-6" /><span>Check In Now</span></>}</span>
                             </button>
                           </div>
                           <p className="mt-6 text-xs text-slate-500 uppercase font-bold tracking-widest text-green-400/80">● Network: Stacks Mainnet</p>
                         </div>
                       )}
                       {appState === AppState.CHECKING_IN && <div className="text-center"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div><h3 className="text-xl font-bold text-white">Check your wallet</h3><p className="text-slate-400 mt-2">Please sign the transaction.</p></div>}
                       {appState === AppState.SPINNING && <div className="w-full"><h3 className="text-2xl font-bold text-white mb-4">Daily Reward Unlocked!</h3><Spinner spinning={true} onComplete={handleSpinComplete} rewardValue={reward} /></div>}
                       {appState === AppState.VOTING && (
                         <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
                           <div className="flex items-center justify-center mb-6"><CheckCircle2 className="w-12 h-12 text-green-500 mr-4" /><div className="text-left"><h3 className="text-xl font-bold text-white">Check-in Complete!</h3><p className="text-slate-400">You earned {reward} points.</p></div></div>
                           <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-left relative overflow-hidden">
                             {votingStatus === 'voting' && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>}
                             {votingStatus === 'voted' ? <div className="text-center py-8"><div className="inline-flex p-3 rounded-full bg-green-500/20 text-green-400 mb-3"><CheckCircle2 className="w-8 h-8" /></div><h4 className="text-xl font-bold text-white">Vote Submitted!</h4></div> : (
                               <><h4 className="text-lg font-bold mb-4">Daily Community Vote</h4><div className="grid grid-cols-2 gap-4"><button onClick={() => handleVote(true)} className="py-3 px-4 bg-slate-700 hover:bg-green-600/20 hover:border-green-500 border border-transparent rounded-lg font-medium transition-colors hover:text-green-400">Yes</button><button onClick={() => handleVote(false)} className="py-3 px-4 bg-slate-700 hover:bg-red-600/20 hover:border-red-500 border border-transparent rounded-lg font-medium transition-colors hover:text-red-400">No</button></div></>
                             )}
                           </div>
                           <button onClick={() => setAppState(AppState.IDLE)} className="mt-6 text-slate-500 hover:text-white underline text-sm">Back to Dashboard</button>
                         </div>
                       )}
                    </>
                  )}
               </div>
            </div>

            <StreakCard user={user} />

            {/* NFT MINT SECTION */}
            {user && (
              <div className="mt-8 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <img src="/assets/dolphin.jpg" alt="Dolphin NFT" className="w-40 h-40 rounded-2xl shadow-2xl relative border-2 border-cyan-500/50 object-cover transform group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 bg-black/70 text-[10px] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">SIP-009</div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white mb-2">Daily Dolphin Collectible</h3>
                    <p className="text-slate-300 text-sm mb-6">Mint your exclusive NFT. Only available if you have checked in today.</p>
                    {isCheckedInToday ? (
                      <button onClick={handleMint} disabled={minting || hasMintedToday} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto md:mx-0 disabled:hover:shadow-none">
                        {minting ? <><Loader2 className="animate-spin w-5 h-5"/><span>Minting...</span></> : hasMintedToday ? <><Check className="w-5 h-5"/><span>Already Minted</span></> : <span>🌊 Mint Free NFT</span>}
                      </button>
                    ) : (
                      <div className="flex flex-col items-center md:items-start gap-2"><div className="px-5 py-3 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl inline-flex items-center gap-2 cursor-not-allowed opacity-70"><span className="w-2 h-2 rounded-full bg-red-500"></span><span>Locked: Check-in required</span></div></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Leaderboard, PREDICTION, Stake, Heatmap */}
          <div className="lg:col-span-1 space-y-8">
             <Leaderboard />

           
             {user && (
               <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 shadow-xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20"><DollarSign className="w-5 h-5" /></div>
                     <h3 className="font-bold text-white">STX Prediction</h3>
                   </div>
                   <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400">24h</span>
                 </div>

                 {hasPredicted ? (
                   <div className="text-center py-6 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                      <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-400 mb-2"><CheckCircle2 className="w-8 h-8" /></div>
                      <p className="text-white font-bold">Prediction Submitted!</p>
                      <p className="text-xs text-slate-500 mt-1">Results announced tomorrow</p>
                   </div>
                 ) : (
                   <>
                     <p className="text-sm text-slate-400 mb-4">Will STX price go <span className="text-green-400 font-bold">UP</span> or <span className="text-red-400 font-bold">DOWN</span> tomorrow?</p>
                     <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => handlePredict('up')}
                         disabled={!!predicting}
                         className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-700/50 hover:bg-green-500/10 border border-slate-600 hover:border-green-500/50 rounded-xl transition-all group active:scale-95 disabled:opacity-50"
                       >
                         {predicting === 'up' ? <Loader2 className="w-6 h-6 text-green-500 animate-spin" /> : <TrendingUp className="w-8 h-8 text-slate-400 group-hover:text-green-400 transition-colors" />}
                         <span className="font-bold text-slate-300 group-hover:text-green-400">UP</span>
                       </button>

                       <button 
                         onClick={() => handlePredict('down')}
                         disabled={!!predicting}
                         className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-700/50 hover:bg-red-500/10 border border-slate-600 hover:border-red-500/50 rounded-xl transition-all group active:scale-95 disabled:opacity-50"
                       >
                         {predicting === 'down' ? <Loader2 className="w-6 h-6 text-red-500 animate-spin" /> : <TrendingDown className="w-8 h-8 text-slate-400 group-hover:text-red-400 transition-colors" />}
                         <span className="font-bold text-slate-300 group-hover:text-red-400">DOWN</span>
                       </button>
                     </div>
                     <p className="text-[10px] text-center text-slate-500 mt-3">Cost: 0.1 STX to participate</p>
                   </>
                 )}
               </div>
             )}

             {/* Stake Module */}
             {user && (
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-yellow-500/50 to-orange-500/50 hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 shadow-lg">
                <div className="bg-slate-900 rounded-2xl p-5 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-400 group-hover:text-yellow-300 transition-colors"><Coins className="w-6 h-6" /></div>
                      <div><h3 className="font-bold text-white text-lg leading-tight">Stake to Support</h3><p className="text-xs text-slate-400 font-medium mt-0.5">Commitment Level</p></div>
                    </div>
                    <p className="text-sm text-slate-400 mb-5 leading-relaxed">Lock <span className="text-white font-bold">0.1 STX</span> to show your dedication.</p>
                    <button onClick={handleStake} disabled={staking} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold rounded-xl shadow-[0_4px_12px_rgba(234,179,8,0.2)] hover:shadow-[0_4px_20px_rgba(234,179,8,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap">
                      {staking ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><TrendingUp className="w-4 h-4" /><span>Stake 0.1 STX</span></>}
                    </button>
                  </div>
                </div>
              </div>
             )}

             {/* Heatmap */}
             {user && (user.streakDays.length > 0 || user.currentStreak > 0) && (
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
                 <div className="flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-orange-400" /><h4 className="text-sm font-bold text-slate-200">Activity Map</h4></div>
                <StreakHeatmap streakDays={user.streakDays.length > 0 ? user.streakDays : Array.from({length: user.currentStreak}, (_, i) => Math.floor(Date.now()/86400000) - i)} days={30} />
              </div>
             )}
             
          </div>
        </div>
      </main>
    </div>
  );
}