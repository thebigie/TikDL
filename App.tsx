import React, { useState, useEffect } from 'react';
import { fetchTikTokData } from './services/tiktokService';
import { TikTokData } from './types';

// --- Helper Functions ---
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'Just now';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp * 1000));
};

const calculateEngagement = (data: TikTokData['data']) => {
  if (!data.play_count || data.play_count === 0) return "N/A";
  const engagement = ((data.digg_count + data.comment_count + data.share_count) / data.play_count) * 100;
  return engagement.toFixed(1) + "%";
};

// --- Components ---

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-auto max-w-[90vw]">
      <div className="glass px-6 py-3 rounded-full flex items-center gap-3 text-sm font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-[#0f172a]/90 backdrop-blur-xl border border-cyan-500/30 text-cyan-50 whitespace-nowrap">
        <i className="fa-solid fa-circle-check text-cyan-400"></i>
        {message}
      </div>
    </div>
  );
};

const StatBadge = ({ icon, label, value, color }: { icon: string, label: string, value: string, color: string }) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group backdrop-blur-md">
    <i className={`fa-solid ${icon} text-xl mb-2 group-hover:scale-110 transition-transform duration-300 ${color}`}></i>
    <span className="font-bold text-lg text-white tracking-tight">{value}</span>
    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
  </div>
);

const DownloadButton = ({ href, icon, label, subLabel, primary = false }: any) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className={`
      relative group overflow-hidden rounded-2xl p-4 flex items-center gap-4 transition-all duration-300
      ${primary 
        ? 'btn-primary text-white border border-transparent' 
        : 'glass hover:bg-white/10 text-slate-200 border-white/10 hover:border-cyan-500/30'
      }
    `}
  >
    <div className={`
      w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-500 group-hover:rotate-12
      ${primary ? 'bg-black/20 text-white' : 'bg-white/5 text-cyan-400'}
    `}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div className="flex flex-col text-left z-10 min-w-0">
      <span className="font-bold text-base tracking-wide truncate">{label}</span>
      {subLabel && <span className={`text-xs ${primary ? 'text-cyan-50/80' : 'text-slate-400'} font-medium truncate block`}>{subLabel}</span>}
    </div>
    {/* Shine Effect */}
    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-0"></div>
  </a>
);

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TikTokData['data'] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!url) {
      showToast("Please enter a link first");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchTikTokData(url);
      setData(result.data);
    } catch (err: any) {
      setError(err.message || "Failed to load video. Please check the link.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      showToast("Link pasted!");
    } catch (err) {
      showToast("Click 'Allow' to paste");
    }
  };

  const reset = () => {
    setData(null);
    setUrl('');
    setError(null);
  };

  const copyCaption = () => {
    if (data?.title) {
      navigator.clipboard.writeText(data.title);
      showToast("Caption copied!");
    }
  };

  const showToast = (msg: string) => setToast(msg);

  return (
    <div className="min-h-screen pb-10 relative flex flex-col font-outfit">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-12 transition-transform duration-300 relative overflow-hidden">
               {/* Subtle shine on logo */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <i className="fa-brands fa-tiktok text-white text-xl drop-shadow-md"></i>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white select-none">
              Tik<span className="text-cyan-400">DL</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
             <a href="#" className="hover:text-cyan-400 transition-colors">How it works</a>
             <a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-12 md:pt-20 flex-grow w-full relative z-10">
        
        {/* Search / Hero Section */}
        <div className={`transition-all duration-700 ease-out ${data ? 'translate-y-0 opacity-100' : 'translate-y-[5vh]'} mb-16`}>
          <div className="text-center mb-12 relative">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md shadow-lg shadow-cyan-900/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Fast & Free
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-2xl leading-[1.1]">
              TikToks without <br className="hidden md:block"/>
              <span className="gradient-title">Watermarks.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
              Unlimited downloads for videos, slideshows, and audio. <br className="hidden md:block"/> Save your favorite content in HD.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative z-20">
            <div className="glass-input rounded-3xl p-2.5 md:p-3 flex items-center gap-2 md:gap-3 relative group shadow-2xl shadow-black/40 transition-all duration-300 hover:shadow-cyan-900/10 hover:border-cyan-500/30">
              <button onClick={handlePaste} className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all" title="Paste Link">
                <i className="fa-solid fa-paste text-xl"></i>
              </button>
              
              <input 
                type="text" 
                placeholder="Paste video link here..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-3 py-3 md:py-4 outline-none text-base md:text-lg font-medium w-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              />
              
              <button 
                onClick={handleFetch}
                disabled={loading}
                className="btn-primary text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95 shadow-lg shadow-cyan-500/20 shrink-0"
              >
                {loading ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-lg md:text-xl"></i>
                ) : (
                  <>
                    <span className="hidden md:inline">Download</span>
                    <i className="fa-solid fa-arrow-right md:-rotate-45 text-lg"></i>
                  </>
                )}
              </button>
            </div>
            
            <div className="md:hidden flex justify-center mt-6">
              <button onClick={handlePaste} className="text-sm font-semibold text-cyan-300 flex items-center gap-2 bg-cyan-950/40 px-5 py-2.5 rounded-full border border-cyan-500/20 active:bg-cyan-900/60 transition-colors">
                <i className="fa-regular fa-clipboard"></i> Paste from Clipboard
              </button>
            </div>

            {error && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 flex items-center gap-3 animate-fade-in-up backdrop-blur-md justify-center font-medium text-center">
                <i className="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Dashboard */}
        {data && (
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up pb-20">
            
            {/* Left Col: Media Player */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel rounded-[2rem] p-3 shadow-2xl ring-1 ring-white/5">
                <div className="relative rounded-[1.5rem] overflow-hidden bg-[#000] aspect-[9/16] shadow-inner group">
                  {data.images ? (
                    <div className="grid grid-cols-2 gap-0.5 w-full h-full overflow-y-auto custom-scrollbar bg-black/50">
                      {data.images.map((img, idx) => (
                        <div key={idx} className="relative group/img aspect-[9/16]">
                          <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <a href={img} target="_blank" rel="noreferrer" download className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                              <i className="fa-solid fa-download"></i>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <video 
                      src={data.play} 
                      controls 
                      loop
                      poster={data.cover}
                      className="w-full h-full object-contain"
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 z-10 text-xs font-bold text-white shadow-lg pointer-events-none">
                    <i className="fa-solid fa-play text-cyan-400"></i> {formatNumber(data.play_count)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Info & Actions */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Profile & Stats */}
              <div className="glass-panel rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-xl">
                      <img src={data.author.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-[#0f172a]" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                       <div>
                         <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 truncate">
                          {data.author.nickname}
                          <i className="fa-solid fa-circle-check text-cyan-400 text-lg"></i>
                        </h2>
                        <div className="text-sm font-medium text-slate-400">@{data.author.unique_id}</div>
                       </div>
                       
                       <div className="glass px-4 py-2 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-2 border-white/5 self-start md:self-auto whitespace-nowrap">
                         <i className="fa-regular fa-clock"></i> {formatDate(data.create_time || data.processed_time)}
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
                         <span className="bg-white/5 rounded-lg px-3 py-1.5 text-slate-300 border border-white/5">
                            <i className="fa-solid fa-globe mr-1.5 text-slate-400"></i>
                            {data.region}
                         </span>
                         <span className="bg-white/5 rounded-lg px-3 py-1.5 text-slate-300 border border-white/5">
                            <i className="fa-regular fa-hourglass mr-1.5 text-slate-400"></i>
                            {data.duration}s
                         </span>
                         <span className="bg-cyan-500/10 rounded-lg px-3 py-1.5 text-cyan-300 border border-cyan-500/20">
                            {calculateEngagement(data)} Engagement
                         </span>
                    </div>
                  </div>
                </div>
                
                {/* Caption */}
                <div className="mt-6 bg-[#020617]/50 rounded-xl p-4 border border-white/5 relative group">
                    {data.title ? (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Caption</span>
                                <button onClick={copyCaption} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors uppercase font-bold tracking-wider">
                                    <i className="fa-regular fa-copy"></i> Copy
                                </button>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed font-light max-h-32 overflow-y-auto custom-scrollbar">{data.title}</p>
                        </div>
                    ) : (
                         <p className="text-sm text-slate-400 italic">No caption provided.</p>
                    )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <StatBadge icon="fa-heart" label="Likes" value={formatNumber(data.digg_count)} color="text-rose-500" />
                  <StatBadge icon="fa-comment-dots" label="Comments" value={formatNumber(data.comment_count)} color="text-sky-400" />
                  <StatBadge icon="fa-share-nodes" label="Shares" value={formatNumber(data.share_count)} color="text-emerald-400" />
                  <StatBadge icon="fa-bookmark" label="Saved" value={formatNumber(data.collect_count)} color="text-amber-400" />
                </div>
              </div>

              {/* Downloads */}
              <div className="glass-panel rounded-[2rem] p-6 md:p-8">
                <h3 className="text-xl font-bold flex items-center gap-3 text-white mb-6">
                  <i className="fa-solid fa-cloud-arrow-down text-cyan-400"></i>
                  Download Media
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!data.images && (
                    <>
                      <DownloadButton 
                        href={data.hdplay || data.play} 
                        icon="fa-video" 
                        label="HD Video" 
                        subLabel="No Watermark" 
                        primary={true}
                      />
                      <DownloadButton 
                        href={data.wmplay} 
                        icon="fa-brands fa-tiktok" 
                        label="Original" 
                        subLabel="With Watermark" 
                      />
                    </>
                  )}
                  
                  <DownloadButton 
                    href={data.music} 
                    icon="fa-music" 
                    label="Audio MP3" 
                    subLabel={data.music_info.title.length > 20 ? data.music_info.title.substring(0,20) + '...' : 'Original Sound'} 
                  />
                  
                  <DownloadButton 
                    href={data.cover} 
                    icon="fa-image" 
                    label="Cover Image" 
                    subLabel="High Quality JPG" 
                  />
                  
                  {data.images && (
                     <div className="md:col-span-2 bg-cyan-900/10 border border-cyan-500/20 rounded-2xl p-4 flex items-start gap-4 text-cyan-200 text-sm">
                       <i className="fa-solid fa-layer-group text-lg mt-0.5"></i>
                       <div>
                         <p className="font-bold">Slideshow Detected</p>
                         <p className="opacity-80 text-xs mt-1">Download individual photos using the download buttons overlaying the images on the left.</p>
                       </div>
                     </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      <footer className="w-full py-8 text-center mt-auto border-t border-white/5 bg-[#020617]/80 backdrop-blur-md relative z-10">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
           Crafted with <i className="fa-solid fa-heart text-rose-500 animate-pulse text-xs"></i> by <span className="text-slate-300 font-medium">Shkar Faraidun</span>
        </p>
      </footer>
    </div>
  );
};

export default App;