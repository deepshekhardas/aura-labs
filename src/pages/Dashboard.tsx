import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, FileText, Clock, AlertTriangle, ShieldCheck, Database, Server, Cpu, BrainCircuit, Maximize2, TerminalSquare, Wifi, Fingerprint, HardDrive, Radio, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const stats = [
  { name: "Samples Processed", value: "432", change: "+12%", icon: Activity, color: "text-blue-400" },
  { name: "Pending Print Jobs", value: "14", change: "-4", icon: FileText, color: "text-indigo-400" },
  { name: "Avg Processing Time", value: "2.4 hrs", change: "-15min", icon: Clock, color: "text-emerald-400" },
  { name: "Maintenance Alerts", value: "3", change: "Urgent", icon: AlertTriangle, color: "text-rose-400" }
];

const chartData = [
  { time: '08:00', samples: 45, efficiency: 85 },
  { time: '10:00', samples: 120, efficiency: 90 },
  { time: '12:00', samples: 190, efficiency: 88 },
  { time: '14:00', samples: 250, efficiency: 95 },
  { time: '16:00', samples: 310, efficiency: 92 },
  { time: '18:00', samples: 432, efficiency: 96 },
];

const systemLogs = [
  { id: 1, message: 'Spectrometer calibration completed successfully.', time: '2 mins ago', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 2, message: 'Centrifuge Alpha vibration anomaly detected.', time: '15 mins ago', icon: AlertTriangle, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
  { id: 3, message: 'Batch #INV-492 processing initiated via terminal.', time: '1 hr ago', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 4, message: 'AI model updated: Structural diagnostics v4.2.', time: '2 hrs ago', icon: Server, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 5, message: 'Database backup synchronized with external vault.', time: '3 hrs ago', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

const aiInsights = [
  { title: "Throughput Optimization", details: "Increasing Centrifuge B RPM by 5% will reduce overall batch time by 12 mins.", impact: "High" },
  { title: "Maintenance Prediction", details: "Thermal Cycler 3 shows heating pattern degradation. Maintenance suggested within 48h.", impact: "Critical" },
  { title: "Anomaly Detected", details: "Spike in reagent usage recorded during Batch #INV-490.", impact: "Moderate" }
];

const capabilityData = [
  { subject: 'Processing', A: 120, B: 110, fullMark: 150 },
  { subject: 'Storage', A: 98, B: 130, fullMark: 150 },
  { subject: 'Compute', A: 86, B: 130, fullMark: 150 },
  { subject: 'Bandwidth', A: 99, B: 100, fullMark: 150 },
  { subject: 'Security', A: 145, B: 90, fullMark: 150 },
  { subject: 'Uptime', A: 140, B: 85, fullMark: 150 },
];

const processingQueue = [
  { id: 'JOB-9942', type: 'Genomic Sequence', status: 'Processing', progress: 78, priority: 'High', node: 'Node-Alpha' },
  { id: 'JOB-9943', type: 'Fluid Analysis', status: 'Queued', progress: 0, priority: 'Standard', node: 'Node-Beta' },
  { id: 'JOB-9941', type: 'Neural Mapping', status: 'Completed', progress: 100, priority: 'Critical', node: 'Node-Omega' },
  { id: 'JOB-9944', type: 'Isotope Decay Sync', status: 'Processing', progress: 34, priority: 'High', node: 'Node-Alpha' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'volume' | 'efficiency'>('volume');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memUsage, setMemUsage] = useState(68);

  // Simulate real-time hardware fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(10, prev + (Math.random() * 10 - 5))));
      setMemUsage(prev => Math.min(100, Math.max(20, prev + (Math.random() * 6 - 3))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <p className="mb-6 rounded-xl border border-[#D4AF37]/30 p-4 text-sm text-[#D4AF37]">Portfolio demo: all dashboard metrics, equipment activity and insights below are simulated. No laboratory hardware or clinical prediction system is connected.</p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-[0.05] rounded-full blur-[80px]"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">Welcome Back</h3>
              <div className="px-2 py-0.5 rounded border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5"><Fingerprint size={10} /> Demo session</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide mb-4">Laboratory Overview</h1>
            <p className="text-sm font-light text-white/50 max-w-xl leading-relaxed">
              Explore an illustrative lab workflow with <span className="text-white font-medium">sample metrics</span>, printable demo labels and equipment log screens.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setTerminalOpen(!terminalOpen)} className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-300">
              <TerminalSquare size={18} strokeWidth={1.5} />
            </button>
            <button onClick={() => {
              const report = new jsPDF();
              report.text('Aura Labs - Demo Dashboard Report', 15, 20);
              report.setFontSize(10);
              report.text('Illustrative data only. No connected hardware or clinical predictions.', 15, 30);
              stats.forEach((stat, index) => report.text(`${stat.name}: ${stat.value} (sample)`, 15, 45 + index * 10));
              report.save('Aura-Demo-Report.pdf');
            }} className="shrink-0 px-6 py-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-light tracking-wide hover:bg-[#D4AF37] hover:-translate-y-1 hover:text-black hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] transition-all duration-300">
              Download Demo Report
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {terminalOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="mb-8"
          >
            <div className="bg-black/80 border border-white/10 rounded-2xl p-4 font-mono text-xs text-[#D4AF37] h-48 overflow-y-auto uppercase shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 text-white/50 mb-2 border-b border-white/10 pb-2"><Wifi size={12} className="text-emerald-400" /> SECURE UPLINK ESTABLISHED // AURA LABS NETWORK</div>
              <p className="text-emerald-400">&gt; Executing diagnostic protocol...</p>
              <p className="text-white/70">&gt; Node 01: ON-LINE [Latency: 4ms]</p>
              <p className="text-white/70">&gt; Node 02: ON-LINE [Latency: 2ms]</p>
              <p className="text-rose-400">&gt; Node 03: WARNING - Thermal fluctuation detected in Sector 4</p>
              <p className="text-white/70 mt-4">&gt; Awaiting command input <span className="animate-pulse bg-[#D4AF37] w-2 h-3 inline-block align-middle ml-1"></span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-48 hover:bg-white/[0.05] transition-colors group cursor-default relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none transform group-hover:scale-110">
               <stat.icon size={120} />
            </div>
            <div className="flex items-start justify-between relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <stat.icon size={18} className={stat.color} strokeWidth={1.5} />
              </div>
              <div className={`px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono tracking-wider ${stat.change.includes('+') ? 'text-emerald-400' : stat.change.includes('Urgent') ? 'text-rose-400' : 'text-slate-400'}`}>
                {stat.change}
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="text-4xl font-serif text-[#D4AF37] mb-2">{stat.value}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                {stat.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-3xl p-6 lg:p-8 lg:col-span-2 flex flex-col relative overflow-hidden"
        >
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500 opacity-[0.03] rounded-full blur-[80px]"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
            <div>
              <h2 className="text-xl font-serif text-white tracking-wide">Simulated Telemetry</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-1">Illustrative hardware activity</p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 shrink-0">
              <button 
                onClick={() => setActiveTab('volume')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === 'volume' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-white/50 hover:text-white/80'}`}
              >
                Volume
              </button>
              <button 
                onClick={() => setActiveTab('efficiency')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === 'efficiency' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-white/50 hover:text-white/80'}`}
              >
                Efficiency
              </button>
            </div>
          </div>
          
          <div className="h-[300px] w-full flex-1 min-h-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTab === 'volume' ? '#818cf8' : '#D4AF37'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeTab === 'volume' ? '#818cf8' : '#D4AF37'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.2)" 
                  tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace'}} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace'}}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: activeTab === 'volume' ? '#818cf8' : '#D4AF37', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeTab === 'volume' ? 'samples' : 'efficiency'} 
                  stroke={activeTab === 'volume' ? '#818cf8' : '#D4AF37'} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-3xl p-6 lg:p-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-1/2 right-[-50px] w-48 h-48 bg-purple-500 opacity-[0.03] rounded-full blur-[60px]"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-serif text-white tracking-wide">System Logs</h2>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
               <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">Sample logs</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 scrollbar-hide relative z-10">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full ${log.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                  <log.icon size={14} className={log.color} />
                </div>
                <div className="flex-1 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <p className="text-sm font-light text-white/80 leading-relaxed mb-1">{log.message}</p>
                  <p className="text-[10px] font-mono tracking-widest text-white/30 uppercase">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 border border-white/10 rounded-full text-xs font-mono uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white/80 transition-colors">
            View All Logs
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* AI Predictive Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel rounded-3xl p-6 lg:p-8 flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full blur-[80px]"></div>
          
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
               <BrainCircuit size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white tracking-wide">Aura Intelligence Unit</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]/70 mt-1">Example insights - not clinical guidance</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-colors duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-white/90">{insight.title}</h4>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border ${insight.impact === 'Critical' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : insight.impact === 'High' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/10'}`}>
                    {insight.impact}
                  </span>
                </div>
                <p className="text-sm font-light text-white/60 leading-relaxed">
                  {insight.details}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Capability Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel rounded-3xl p-6 lg:p-8 flex flex-col relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="text-xl font-serif text-white tracking-wide">Infrastructure Matrix</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-1">Vector Analysis</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50 hover:text-white transition-colors">
              <Maximize2 size={14} />
            </button>
          </div>

          <div className="h-[250px] w-full flex-1 min-h-0 relative z-10 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={capabilityData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Aura Labs System" dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Baseline Average" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={1} strokeDasharray="3 3"/>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Advanced Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Hardware Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-panel rounded-3xl p-6 lg:p-8 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
               <Cpu size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white tracking-wide">Hardware Nodes</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-1">Simulated Resource Allocation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-white/60 uppercase tracking-widest"><Zap size={10} className="inline mr-1 text-[#D4AF37]"/> Core Compute (CPU)</span>
                <span className="text-xs font-mono text-[#D4AF37]">{cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37] rounded-full transition-all duration-700 ease-out" style={{ width: `${cpuUsage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-white/60 uppercase tracking-widest"><HardDrive size={10} className="inline mr-1 text-indigo-400"/> Memory Subsystem</span>
                <span className="text-xs font-mono text-indigo-400">{memUsage.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500/50 to-indigo-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${memUsage}%` }}></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Active Nodes</span>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(n => (
                     <div key={n} className="w-1.5 h-4 bg-emerald-500/50 rounded-sm animate-pulse" style={{ animationDelay: `${n * 0.15}s`}}></div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Processing Queue Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="glass-panel rounded-3xl p-6 lg:p-8 lg:col-span-2 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                 <Radio size={18} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white tracking-wide">Processing Queue</h2>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-1">Active Batches</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-h-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                  <th className="pb-3 font-normal">Job ID</th>
                  <th className="pb-3 font-normal">Analysis Type</th>
                  <th className="pb-3 font-normal">Progress</th>
                  <th className="pb-3 font-normal">Priority & Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processingQueue.map((job) => (
                  <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <span className="font-mono text-xs text-white/80">{job.id}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-light text-white/90">{job.type}</span>
                    </td>
                    <td className="py-4 w-1/3 pr-8">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono tracking-widest uppercase ${job.status === 'Completed' ? 'text-emerald-400' : job.status === 'Processing' ? 'text-[#D4AF37]' : 'text-slate-400'}`}>{job.status}</span>
                        <span className="text-[10px] font-mono text-white/60">{job.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${job.status === 'Completed' ? 'bg-emerald-400' : job.status === 'Processing' ? 'bg-[#D4AF37]' : 'bg-slate-500'}`} style={{ width: `${job.progress}%` }}></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border inline-block w-fit ${job.priority === 'Critical' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : job.priority === 'High' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-slate-500/30 text-slate-400 bg-slate-500/10'}`}>{job.priority}</span>
                        <span className="text-[10px] text-white/40 font-light">{job.node}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
