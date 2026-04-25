'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Swords, Crown, History, Users, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

const PRESET_ACCOUNTS =['8CY2R8Q0J', 'L29JV2Q9J', 'LJV20PJLR'];

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
        setError(err.message || 'Error fetching data. Check API token.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAccount]);

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-[#EADDFF] text-[#21005D] pt-16 pb-12 px-6 rounded-b-[3rem] mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2">BrawlTracker</h1>
          <p className="text-xl font-medium opacity-80">Trophies, brawlers, and matches.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10">
        <section>
          <p className="text-[#49454F] font-bold text-sm uppercase tracking-widest mb-3 ml-2">Accounts</p>
          <div className="flex flex-wrap gap-3">
            {PRESET_ACCOUNTS.map(account => (
              <button key={account} onClick={() => setSelectedAccount(account)}
                className={`px-6 py-3 rounded-full font-bold text-base transition-transform active:scale-95 shadow-sm 
                  ${selectedAccount === account ? 'bg-[#6750A4] text-white shadow-md' : 'bg-[#F3EDF7] text-[#49454F]'}`}>
                <div className="flex items-center gap-2"><User size={18} /> #{account}</div>
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-[#EADDFF] border-t-[#6750A4] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-[#FFD8E4] text-[#31111D] p-6 rounded-[2rem] text-center font-bold">🚨 {error}</div>
        ) : profile ? (
          <div className="space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#FFD8E4] p-6 rounded-[2rem] flex flex-col justify-between shadow-sm">
                <Trophy size={36} className="text-[#31111D] mb-4"/>
                <div>
                  <p className="text-[#63283B] font-semibold">Current Trophies</p>
                  <h2 className="text-5xl font-black text-[#31111D]">{profile.trophies.toLocaleString()}</h2>
                </div>
              </div>
              <div className="bg-[#F3EDF7] p-6 rounded-[2rem] flex flex-col justify-between shadow-sm">
                <Crown size={36} className="text-[#21005D] mb-4"/>
                <div>
                  <p className="text-[#49454F] font-semibold">Highest Trophies</p>
                  <h2 className="text-5xl font-black text-[#21005D]">{profile.highestTrophies.toLocaleString()}</h2>
                </div>
              </div>
              <div className="bg-[#EADDFF] p-6 rounded-[2rem] flex flex-col justify-between shadow-sm">
                <Swords size={36} className="text-[#21005D] mb-4"/>
                <div>
                  <p className="text-[#49454F] font-semibold">3v3 Victories</p>
                  <h2 className="text-5xl font-black text-[#21005D]">{profile['3vs3Victories'].toLocaleString()}</h2>
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-3xl font-black text-[#1D192B] mb-6 flex items-center gap-3 ml-2">
                <History className="text-[#6750A4]" size={32}/> Match Log
              </h3>
              <div className="bg-[#F3EDF7] rounded-[2rem] p-4 space-y-3 shadow-inner">
                {battleLog.length > 0 ? battleLog.slice(0, 8).map((log, index) => {
                  const battle = log.battle;
                  const isVictory = battle.result === 'victory';
                  const isDraw = battle.result === 'draw';
                  const change = battle.trophyChange;
                  return (
                    <div key={index} className="bg-[#FEF7FF] p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                            ${isVictory ? 'bg-[#188038]/10 text-[#188038]' : isDraw ? 'bg-gray-200 text-gray-600' : 'bg-[#DC362E]/10 text-[#DC362E]'}`}>
                            {isVictory ? <ArrowUpRight size={24}/> : <ArrowDownRight size={24}/>}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-[#1D192B] capitalize">{battle.mode || 'Special'}</h4>
                            <p className="text-[#49454F] font-medium text-sm">{log.event.map || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {change !== undefined ? (
                            <div className={`text-3xl font-black ${isVictory ? 'text-[#188038]' : change < 0 ? 'text-[#DC362E]' : 'text-gray-600'}`}>
                              {change > 0 ? '+' : ''}{change}
                            </div>
                          ) : <div className="text-3xl font-black text-gray-300">-</div>}
                        </div>
                    </div>
                  )
                }) : <div className="p-4 text-center font-bold text-gray-500">No matches found.</div>}
              </div>
            </section>

            <section>
              <h3 className="text-3xl font-black text-[#1D192B] mb-6 flex items-center gap-3 ml-2">
                <Users className="text-[#6750A4]" size={32}/> Brawlers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.brawlers.sort((a: any, b: any) => b.trophies - a.trophies).map((brawler: any) => (
                  <div key={brawler.id} className="bg-[#F3EDF7] p-5 rounded-[1.5rem] flex items-center gap-4 shadow-sm">
                    <div className="flex-1">
                        <h4 className="font-black text-xl text-[#1D192B] capitalize">{brawler.name.toLowerCase()}</h4>
                        <div className="flex items-center gap-1 text-[#49454F] font-bold mt-1">
                          <Trophy size={16} className="text-[#6750A4]"/> {brawler.trophies}
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-[#EADDFF] text-[#21005D] rounded-full flex flex-col items-center justify-center font-black">
                        <span className="text-[9px] opacity-70">RANK</span>
                        <span className="text-lg -mt-1">{brawler.rank}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        ) : null}
      </main>
    </div>
  );
}
