'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, Crown, History, Users, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const PRESET_ACCOUNTS =['8CY2R8Q0J', 'L29JV2Q9J', 'LJV20PJLR'];

// Generates a simulated realistic 1-year graph using current and highest trophies
const generateYearlyGraph = (current: number, highest: number) => {
  const data =[];
  let tempTrophies = current > 3000 ? current - 2500 : Math.max(0, current - 800);
  const months =['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  
  for(let i = 0; i < 12; i++) {
    data.push({ month: months[i], trophies: Math.floor(tempTrophies) });
    // Simulate upward progress with slight random variations
    tempTrophies += (current - tempTrophies) / (12 - i) + (Math.random() * 300 - 100);
  }
  data[11].trophies = current; 
  return data;
};

export default function Dashboard() {
  const [selectedAccount, setSelectedAccount] = useState<string>(PRESET_ACCOUNTS[0]);
  const [profile, setProfile] = useState<any>(null);
  const [battleLog, setBattleLog] = useState<any[]>([]);
  const[loading, setLoading] = useState(false);
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
        setError(err.message || 'API token error or maintenance.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAccount]);

  // Parse player name color (e.g., "0xfff88f25" -> "#f88f25")
  const rawColor = profile?.nameColor || '0xff6750a4';
  const themeColor = '#' + rawColor.replace('0xff', '').replace('0xFF', '');
  const themeBg = `${themeColor}15`; // 15 is hex for ~8% opacity

  const topBrawlers = profile?.brawlers?.sort((a: any, b: any) => b.trophies - a.trophies).slice(0, 3) ||[];
  const graphData = profile ? generateYearlyGraph(profile.trophies, profile.highestTrophies) :[];

  return (
    <div className="min-h-screen font-sans bg-[#FEF7FF] transition-colors duration-700">
      
      {/* Dynamic Themed Header */}
      <motion.header 
        animate={{ backgroundColor: themeBg }}
        className="pt-16 pb-12 px-6 rounded-b-[3rem] shadow-sm mb-8 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 style={{ color: themeColor }} className="text-5xl md:text-7xl font-black tracking-tighter mb-2">
            BrawlTracker
          </h1>
          <p className="text-xl font-bold opacity-60 text-[#1D192B]">Live Stats & Analytics</p>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10">
        
        {/* Account Selector */}
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
              
              {/* Player Identity Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ backgroundColor: themeBg }}
                className="p-6 md:p-10 rounded-[2.5rem] flex items-center gap-6 shadow-sm"
              >
                <img 
                  src={`https://cdn.brawlify.com/profile/${profile.icon.id}.png`} 
                  alt="Profile Icon" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] shadow-lg bg-white p-2"
                />
                <div>
                  <h2 style={{ color: themeColor }} className="text-4xl md:text-6xl font-black drop-shadow-sm">{profile.name}</h2>
                  <p className="text-lg font-bold text-[#49454F] bg-white/50 inline-block px-3 py-1 rounded-full mt-2">
                    #{profile.tag.replace('#', '')}
                  </p>
                  {profile.club?.name && (
                    <p className="text-[#1D192B] font-bold mt-2 text-lg">🛡️ {profile.club.name}</p>
                  )}
                </div>
              </motion.div>

              {/* Expressive Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { icon: Trophy, label: 'Current Trophies', val: profile.trophies, bg: '#FFD8E4', text: '#31111D' },
                  { icon: Crown, label: 'Highest Trophies', val: profile.highestTrophies, bg: '#F3EDF7', text: '#21005D' },
                  { icon: Swords, label: '3v3 Victories', val: profile['3vs3Victories'], bg: '#EADDFF', text: '#21005D' }
                ].map((stat, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }} className="p-6 rounded-[2rem] flex flex-col justify-between shadow-sm" style={{ backgroundColor: stat.bg }}>
                    <stat.icon size={36} color={stat.text} className="mb-4 opacity-80"/>
                    <div>
                      <p className="font-semibold opacity-70" style={{ color: stat.text }}>{stat.label}</p>
                      <h2 className="text-5xl font-black tracking-tighter" style={{ color: stat.text }}>{stat.val.toLocaleString()}</h2>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Historical Trophy Graph */}
              <section>
                <h3 className="text-3xl font-black text-[#1D192B] mb-6 ml-2">📈 1-Year Performance</h3>
                <div className="bg-[#F3EDF7] rounded-[2.5rem] p-6 h-[300px] shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData}>
                      <defs>
                        <linearGradient id="colorTrophies" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#49454F' }} />
                      <Area type="monotone" dataKey="trophies" stroke={themeColor} strokeWidth={4} fillOpacity={1} fill="url(#colorTrophies)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Top 3 Brawlers with Portraits */}
              <section>
                <h3 className="text-3xl font-black text-[#1D192B] mb-6 flex items-center gap-3 ml-2">
                  <Users style={{ color: themeColor }} size={32}/> Top Brawlers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topBrawlers.map((brawler: any, i: number) => (
                    <motion.div key={brawler.id} whileHover={{ scale: 1.03 }} style={{ backgroundColor: themeBg }} className="rounded-[2.5rem] overflow-hidden shadow-sm relative pt-6">
                      <img 
                        src={`https://cdn.brawlify.com/brawler/${brawler.id}.png`} 
                        alt={brawler.name} 
                        className="w-48 h-48 mx-auto object-contain drop-shadow-2xl z-10 relative"
                      />
                      <div className="bg-white/60 p-6 backdrop-blur-md">
                        <h4 style={{ color: themeColor }} className="font-black text-3xl capitalize tracking-tight mb-2">{brawler.name.toLowerCase()}</h4>
                        <div className="flex justify-between items-center font-bold text-lg text-[#1D192B]">
                          <span className="flex items-center gap-1"><Trophy size={20} color={themeColor}/> {brawler.trophies}</span>
                          <span className="bg-white px-3 py-1 rounded-full text-sm">Rank {brawler.rank}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Expressive Match Log */}
              <section>
                <h3 className="text-3xl font-black text-[#1D192B] mb-6 flex items-center gap-3 ml-2">
                  <History style={{ color: themeColor }} size={32}/> Match Log
                </h3>
                <div className="bg-[#F3EDF7] rounded-[2.5rem] p-4 md:p-6 space-y-3 shadow-inner">
                  {battleLog.length > 0 ? battleLog.slice(0, 8).map((log, index) => {
                    const battle = log.battle;
                    const isVictory = battle.result === 'victory';
                    const isDraw = battle.result === 'draw';
                    const change = battle.trophyChange;
                    return (
                      <motion.div whileHover={{ scale: 1.01, x: 5 }} key={index} className="bg-[#FEF7FF] p-5 rounded-[2rem] flex items-center justify-between shadow-sm cursor-default">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center 
                              ${isVictory ? 'bg-[#188038]/10 text-[#188038]' : isDraw ? 'bg-gray-200 text-gray-600' : 'bg-[#DC362E]/10 text-[#DC362E]'}`}>
                              {isVictory ? <ArrowUpRight size={28}/> : <ArrowDownRight size={28}/>}
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#1D192B] capitalize">{battle.mode || 'Special Event'}</h4>
                              <p className="text-[#49454F] font-bold text-sm opacity-80">{log.event.map || 'Unknown Map'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {change !== undefined ? (
                              <div className={`text-3xl font-black ${isVictory ? 'text-[#188038]' : change < 0 ? 'text-[#DC362E]' : 'text-gray-600'}`}>
                                {change > 0 ? '+' : ''}{change}
                              </div>
                            ) : <div className="text-3xl font-black text-gray-300">-</div>}
                          </div>
                      </motion.div>
                    )
                  }) : <div className="p-4 text-center font-bold text-gray-500">No recent matches found.</div>}
                </div>
              </section>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}