'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, Crown, History, Users, ArrowUpRight, ArrowDownRight, User, Zap } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PRESET_ACCOUNTS =['8CY2R8Q0J', 'L29JV2Q9J', 'LJV20PJLR'];

// Helpers to format Game Modes for the Brawlify CDN Icons
const formatModeName = (mode: string) => {
  if (!mode) return 'Special Event';
  return mode.replace(/([A-Z])/g, ' $1').trim();
};

const getModeIcon = (mode: string) => {
  if (!mode) return '';
  const formatted = mode.replace(/([A-Z])/g, '-$1').replace(/^./, str => str.toUpperCase());
  return `https://cdn.brawlify.com/gamemode/${formatted}.png`;
};

// Extracts exactly which brawler YOU played during a specific match
const getPlayedBrawler = (log: any, playerTag: string) => {
  if (!log?.battle) return null;
  try {
    const tag = playerTag.replace('#', '');
    let players =[];
    if (log.battle.teams) players = log.battle.teams.flat();
    else if (log.battle.players) players = log.battle.players;
    
    const me = players.find((p: any) => p.tag.replace('#', '') === tag);
    return me?.brawler?.id || null;
  } catch (e) {
    return null;
  }
};

export default function Dashboard() {
  const[selectedAccount, setSelectedAccount] = useState<string>(PRESET_ACCOUNTS[0]);
  const[profile, setProfile] = useState<any>(null);
  const [battleLog, setBattleLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAccount) return;
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const [profileRes, logRes] = await Promise.all([
          fetch(`/api/player?tag=${selectedAccount}&endpoint=profile`),
          fetch(`/api/player?tag=${selectedAccount}&endpoint=battlelog`)
        ]);
        const profileData = await profileRes.json();
        const logData = await logRes.json();

        if (profileData.error) throw new Error(profileData.error);
        
        setProfile(profileData);
        setBattleLog(logData.items ||[]);
      } catch (err: any) {
        setError(err.message || 'API error.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAccount]);

  // Generate REAL graph data from ALL 25 maximum matches
  const realGraphData = useMemo(() => {
    if (!profile || !battleLog || battleLog.length === 0) return[];
    let currentTrophies = profile.trophies;
    const data = [{ match: 'Now', trophies: currentTrophies }];
    
    for (let i = 0; i < battleLog.length; i++) {
      const change = battleLog[i]?.battle?.trophyChange;
      if (change !== undefined) currentTrophies -= change; 
      data.push({ match: `-${i + 1}`, trophies: currentTrophies });
    }
    return data.reverse(); 
  }, [profile, battleLog]);

  const rawColor = profile?.nameColor || '0xff6750a4';
  const themeColor = '#' + rawColor.replace('0xff', '').replace('0xFF', '');
  const themeBg = `${themeColor}15`;

  // Showing ALL brawlers instead of just 3
  const allBrawlers = profile?.brawlers?.sort((a: any, b: any) => b.trophies - a.trophies) ||[];

  return (
    <div className="min-h-screen font-sans bg-[#FEF7FF] transition-colors duration-700">
      
      <motion.header animate={{ backgroundColor: themeBg }} className="pt-16 pb-12 px-6 rounded-b-[3rem] shadow-sm mb-8">
        <div className="max-w-5xl mx-auto">
          <h1 style={{ color: themeColor }} className="text-5xl md:text-7xl font-black tracking-tighter mb-2">
            BrawlTracker
          </h1>
          <p className="text-xl font-bold opacity-60 text-[#1D192B]">Live Stats & Match History</p>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10">
        
        <section>
          <p className="text-[#49454F] font-bold text-sm uppercase tracking-widest mb-3 ml-2">Select Account</p>
          <div className="flex flex-wrap gap-3">
            {PRESET_ACCOUNTS.map(account => (
              <button key={account} onClick={() => setSelectedAccount(account)}
                style={{
                  backgroundColor: selectedAccount === account ? themeColor : '#F3EDF7',
                  color: selectedAccount === account ? '#FFF' : '#49454F'
                }}
                className="px-6 py-3 rounded-full font-bold text-base transition-all active:scale-95 shadow-sm">
                <div className="flex items-center gap-2"><User size={18} /> #{account}</div>
              </button>
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
               <div style={{ borderTopColor: themeColor }} className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin"></div>
             </motion.div>
          ) : error ? (
             <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFD8E4] text-[#31111D] p-6 rounded-[2rem] text-center font-bold">🚨 {error}</motion.div>
          ) : profile ? (
            <motion.div key="content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }} className="space-y-12">
              
              {/* Profile Header */}
              <motion.div style={{ backgroundColor: themeBg }} className="p-6 md:p-10 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                <img 
                  src={`https://cdn.brawlify.com/profile-icons/regular/${profile.icon.id}.png`} 
                  alt="Profile Icon" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl shadow-lg border-4 border-white object-cover"
                />
                <div>
                  <h2 style={{ color: themeColor }} className="text-4xl md:text-6xl font-black drop-shadow-sm">{profile.name}</h2>
                  <p className="text-lg font-bold text-[#49454F] bg-white/50 inline-block px-3 py-1 rounded-full mt-2">
                    #{profile.tag.replace('#', '')}
                  </p>
                </div>
              </motion.div>

              {/* Trophies Chart */}
              <section>
                <h3 className="text-3xl font-black text-[#1D192B] mb-2 ml-2">📈 Real Match Tracker</h3>
                <p className="text-[#49454F] ml-2 mb-6 font-medium text-sm opacity-80">Fluctuations over your max available match history.</p>
                <div className="bg-[#F3EDF7] rounded-[2.5rem] p-6 h-[300px] shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={realGraphData}>
                      <defs>
                        <linearGradient id="colorTrophies" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <XAxis dataKey="match" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#49454F', fontSize: 12 }} />
                      <YAxis domain={['dataMin - 15', 'dataMax + 15']} hide={true} />
                      <Area type="monotone" dataKey="trophies" stroke={themeColor} strokeWidth={5} fillOpacity={1} fill="url(#colorTrophies)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* FULL MATCH LOG WITH ICONS */}
              <section>
                <div className="flex items-center justify-between mb-6 ml-2 pr-2">
                  <h3 className="text-3xl font-black text-[#1D192B] flex items-center gap-3">
                    <History style={{ color: themeColor }} size={32}/> Full Match Log
                  </h3>
                  <span className="text-sm font-bold text-[#49454F] bg-[#F3EDF7] px-3 py-1 rounded-full">Last {battleLog.length}</span>
                </div>
                
                {/* Max height with scrolling so the page doesn't get infinitely long */}
                <div className="bg-[#F3EDF7] rounded-[2.5rem] p-4 md:p-6 space-y-4 shadow-inner max-h-[800px] overflow-y-auto">
                  {battleLog.length > 0 ? battleLog.map((log, index) => {
                    const battle = log.battle;
                    const isVictory = battle.result === 'victory';
                    const isDraw = battle.result === 'draw';
                    const change = battle.trophyChange;
                    const playedBrawlerId = getPlayedBrawler(log, profile.tag);

                    return (
                      <motion.div whileHover={{ scale: 1.01, x: 2 }} key={index} className="bg-[#FEF7FF] p-4 md:p-5 rounded-[2rem] flex items-center justify-between shadow-sm cursor-default">
                          <div className="flex items-center gap-3 md:gap-5">
                            
                            {/* GAME MODE ICON */}
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-sm shrink-0">
                               <img 
                                 src={getModeIcon(battle.mode)} 
                                 alt={battle.mode} 
                                 className="w-full h-full object-contain"
                                 onError={(e) => e.currentTarget.style.display = 'none'}
                               />
                            </div>

                            {/* BRAWLER USED ICON */}
                            {playedBrawlerId && (
                              <div className="hidden sm:block w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-white border-2 border-[#EADDFF] shrink-0 shadow-sm relative pt-1">
                                <img 
                                  src={`https://cdn.brawlify.com/brawler/${playedBrawlerId}.png`} 
                                  alt="Brawler" 
                                  className="w-[120%] h-[120%] object-cover -ml-1 -mt-1"
                                />
                              </div>
                            )}

                            <div>
                              <h4 className="text-lg md:text-xl font-black text-[#1D192B] capitalize leading-tight">{formatModeName(battle.mode)}</h4>
                              <p className="text-[#49454F] font-bold text-xs md:text-sm opacity-80">{log.event.map || 'Unknown Map'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            {change !== undefined ? (
                              <div className={`text-2xl md:text-3xl font-black ${isVictory ? 'text-[#188038]' : change < 0 ? 'text-[#DC362E]' : 'text-gray-600'}`}>
                                {change > 0 ? '+' : ''}{change}
                              </div>
                            ) : <div className="text-2xl md:text-3xl font-black text-gray-300">-</div>}
                            
                            {/* Win/Loss Arrow Indicator */}
                            <div className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center 
                              ${isVictory ? 'bg-[#188038]/10 text-[#188038]' : isDraw ? 'bg-gray-200 text-gray-600' : 'bg-[#DC362E]/10 text-[#DC362E]'}`}>
                              {isVictory ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                            </div>
                          </div>
                      </motion.div>
                    )
                  }) : <div className="p-8 text-center font-bold text-gray-500">No matches found in API history.</div>}
                </div>
              </section>

              {/* ALL BRAWLERS GRID */}
              <section>
                <div className="flex items-center justify-between mb-6 ml-2 pr-2">
                  <h3 className="text-3xl font-black text-[#1D192B] flex items-center gap-3">
                    <Users style={{ color: themeColor }} size={32}/> All Brawlers Progress
                  </h3>
                  <span className="text-sm font-bold text-[#49454F] bg-[#F3EDF7] px-3 py-1 rounded-full">{allBrawlers.length} Unlocked</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allBrawlers.map((brawler: any) => (
                    <motion.div key={brawler.id} whileHover={{ scale: 1.03 }} style={{ backgroundColor: themeBg }} className="rounded-[1.5rem] overflow-hidden shadow-sm relative pt-4">
                      <img 
                        src={`https://cdn.brawlify.com/brawlers/borders/${brawler.id}.png`} 
                        alt={brawler.name} 
                        className="w-20 h-20 md:w-24 md:h-24 mx-auto drop-shadow-xl z-10 relative rounded-[1rem]"
                      />
                      <div className="bg-white/80 p-3 md:p-4 mt-3 backdrop-blur-md">
                        <h4 style={{ color: themeColor }} className="font-black text-lg md:text-xl capitalize tracking-tight text-center mb-2 truncate">
                          {brawler.name.toLowerCase()}
                        </h4>
                        
                        <div className="flex justify-center items-center font-bold text-[#1D192B] mb-2 text-sm">
                          <span className="flex items-center gap-1"><Trophy size={14} color={themeColor}/> {brawler.trophies}</span>
                        </div>
                        
                        <div className="flex gap-1 justify-center">
                           <span className="bg-[#EADDFF] text-[#21005D] px-2 py-1 rounded-md text-[10px] md:text-xs font-bold text-center flex-1 shadow-sm">
                             T{brawler.rank}
                           </span>
                           <span className="bg-[#FFD8E4] text-[#31111D] px-2 py-1 rounded-md text-[10px] md:text-xs font-bold text-center flex-1 flex justify-center items-center gap-1 shadow-sm">
                             <Zap size={10}/> P{brawler.power}
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}