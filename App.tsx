import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { 
  authenticate, 
  logout, 
  submitCheckInTransaction, 
  submitVoteTransaction,
  formatAddress, 
  getRealUserData, 
  userSession 
} from './services/stacks';
import { UserData, AppState } from './types';
import Spinner from './components/Spinner';
import StreakCard from './components/StreakCard';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState<'idle' | 'voting' | 'voted'>('idle');

  // Initialize checks for existing session
  useEffect(() => {
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
  }, []);

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
    setError(null);
    setAppState(AppState.CHECKING_IN);
    
    try {
      const { newData, reward: newReward } = await submitCheckInTransaction(user);
      
      setUser(newData);
      setReward(newReward);
      
      // Transition to Spinner
      setLoading(false);
      setAppState(AppState.SPINNING);
    } catch (e: any) {
      console.error("Check-in failed", e);
      setError("Transaction cancelled or failed");
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
      console.error("Vote failed", e);
      // We don't block the flow if vote fails, just reset status
      setVotingStatus('idle');
    }
  };

  const handleSpinComplete = () => {
    setTimeout(() => {
      setAppState(AppState.VOTING);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
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
                <button 
                  onClick={handleConnect}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-white">{formatAddress(user.address)}</p>
                    <p className="text-xs text-orange-400">{user.points} PTS</p>
                  </div>
                  <button 
                    onClick={handleDisconnect}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Actions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero / Check-in Area */}
            <div className="bg-slate-800 rounded-3xl p-1 border border-slate-700 shadow-2xl overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10 pointer-events-none"></div>
               
               <div className="bg-slate-900/50 backdrop-blur-sm rounded-[22px] p-8 md:p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                  
                  {error && (
                    <div className="absolute top-4 left-0 right-0 mx-auto w-max max-w-[90%] bg-red-500/20 text-red-200 px-4 py-2 rounded-lg border border-red-500/50 flex items-center gap-2 text-sm z-50">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {!user ? (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-slate-700">
                        <Wallet className="w-10 h-10 text-slate-500" />
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
                        Start Your <span className="text-orange-500">Streak</span>
                      </h1>
                      <p className="text-slate-400 text-lg max-w-md mx-auto">
                        Connect Leather or Xverse wallet to check in, earn rewards, and climb the Stacks leaderboard.
                      </p>
                      <button 
                        onClick={handleConnect}
                        className="mt-8 px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <>
                       {appState === AppState.IDLE && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-lg">
                           <h2 className="text-3xl font-bold mb-2">Ready for today?</h2>
                           <p className="text-slate-400 mb-8">Check in now to keep your {user.currentStreak}-day streak alive!</p>
                           
                           <button 
                             onClick={handleCheckIn}
                             disabled={loading}
                             className="group relative w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mx-auto flex justify-center"
                           >
                             <span className="flex items-center space-x-2">
                               {loading ? (
                                 <span>Waiting for Wallet...</span>
                               ) : (
                                 <>
                                   <CheckCircle2 className="w-6 h-6" />
                                   <span>Check In Now</span>
                                 </>
                               )}
                             </span>
                           </button>
                           <p className="mt-4 text-xs text-slate-500 uppercase font-bold tracking-widest text-green-400/80">
                             ● Network: Stacks Mainnet
                           </p>
                         </div>
                       )}

                       {appState === AppState.CHECKING_IN && (
                         <div className="text-center">
                           <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                           <h3 className="text-xl font-bold text-white">Check your wallet</h3>
                           <p className="text-slate-400 mt-2">Please sign the transaction to check in.</p>
                         </div>
                       )}

                       {appState === AppState.SPINNING && (
                         <div className="w-full">
                           <h3 className="text-2xl font-bold text-white mb-4">Daily Reward Unlocked!</h3>
                           <Spinner 
                              spinning={true} 
                              onComplete={handleSpinComplete} 
                              rewardValue={reward}
                           />
                         </div>
                       )}

                       {appState === AppState.VOTING && (
                         <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
                           <div className="flex items-center justify-center mb-6">
                             <CheckCircle2 className="w-12 h-12 text-green-500 mr-4" />
                             <div className="text-left">
                               <h3 className="text-xl font-bold text-white">Check-in Complete!</h3>
                               <p className="text-slate-400">You earned {reward} points.</p>
                             </div>
                           </div>
                           
                           <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-left relative overflow-hidden">
                             {votingStatus === 'voting' && (
                                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
                                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                             )}
                             
                             {votingStatus === 'voted' ? (
                               <div className="text-center py-8">
                                 <div className="inline-flex p-3 rounded-full bg-green-500/20 text-green-400 mb-3">
                                   <CheckCircle2 className="w-8 h-8" />
                                 </div>
                                 <h4 className="text-xl font-bold text-white">Vote Submitted!</h4>
                                 <p className="text-slate-400 mt-2">Thanks for participating.</p>
                               </div>
                             ) : (
                               <>
                                 <h4 className="text-lg font-bold mb-4">Daily Community Vote</h4>
                                 <p className="text-slate-400 text-sm mb-4">Should Stacks increase block size limit?</p>
                                 <div className="grid grid-cols-2 gap-4">
                                   <button 
                                     onClick={() => handleVote(true)}
                                     className="py-3 px-4 bg-slate-700 hover:bg-green-600/20 hover:border-green-500 border border-transparent rounded-lg font-medium transition-colors hover:text-green-400"
                                   >
                                     Yes
                                   </button>
                                   <button 
                                     onClick={() => handleVote(false)}
                                     className="py-3 px-4 bg-slate-700 hover:bg-red-600/20 hover:border-red-500 border border-transparent rounded-lg font-medium transition-colors hover:text-red-400"
                                   >
                                     No
                                   </button>
                                 </div>
                               </>
                             )}
                           </div>
                           
                           <button 
                              onClick={() => setAppState(AppState.IDLE)}
                              className="mt-6 text-slate-500 hover:text-white underline text-sm"
                           >
                             Back to Dashboard
                           </button>
                         </div>
                       )}
                    </>
                  )}
                  
               </div>
            </div>

            {/* Stats Grid */}
            <StreakCard user={user} />

          </div>

          {/* Right Column: Leaderboard */}
          <div className="lg:col-span-1">
             <Leaderboard />
             
             {/* Info Card */}
             <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
               <div className="flex items-start space-x-3">
                 <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-bold text-sm text-slate-300 mb-1">How it works</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     1. Check in once every 24 hours.<br/>
                     2. Missing a day resets your streak to 0.<br/>
                     3. Higher streaks = better rewards multipliers.<br/>
                     4. Top 10 users earn weekly STX prizes.
                   </p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;