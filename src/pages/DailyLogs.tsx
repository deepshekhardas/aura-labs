import { useState, useEffect } from 'react';
import { ClipboardCheck, Thermometer, UserCheck, Plus, CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../context/AuthContext';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function DailyLogs() {
  const [activeTab, setActiveTab] = useState<'temp' | 'cleaning'>('temp');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-[calc(100vh-120px)] space-y-8"
    >
      <div className="flex glass-panel rounded-full p-1.5 w-max relative">
        <button 
          onClick={() => setActiveTab('temp')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 text-sm font-light tracking-wide rounded-full transition-all duration-300 relative z-10",
            activeTab === 'temp' ? "text-[#D4AF37]" : "text-white/50 hover:text-white/90"
          )}
        >
          <Thermometer size={16} strokeWidth={1.5} /> Temperature Logs
        </button>
        <button 
          onClick={() => setActiveTab('cleaning')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 text-sm font-light tracking-wide rounded-full transition-all duration-300 relative z-10",
            activeTab === 'cleaning' ? "text-[#D4AF37]" : "text-white/50 hover:text-white/90"
          )}
        >
          <ClipboardCheck size={16} strokeWidth={1.5} /> Cleaning Protocol
        </button>
        
        {/* Animated pill background */}
        <div className="absolute inset-y-1.5 w-[50%] p-1.5 flex transition-transform duration-300 pointer-events-none" style={{ transform: activeTab === 'cleaning' ? 'translateX(100%)' : 'translateX(0)' }}>
            <div className="w-full h-full bg-[#D4AF37]/10 rounded-full shadow-[inset_0_1px_1px_rgba(212,175,55,0.2)]"></div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'temp' ? (
            <motion.div key="temp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
              <TempLogs />
            </motion.div>
          ) : (
            <motion.div key="cleaning" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
              <CleaningLogs />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TempLogs() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const unitsDefaults = [
    { id: 'FRZ-01', name: 'Ultra-Low Freezer (-80°C)', targetTemp: '-80.0', currentTemp: '-79.8' },
    { id: 'FRZ-02', name: 'Standard Freezer (-20°C)', targetTemp: '-20.0', currentTemp: '-19.5' },
    { id: 'REF-01', name: 'Reagent Fridge (4°C)', targetTemp: '4.0', currentTemp: '5.2' },
    { id: 'INC-01', name: 'Incubator (37°C)', targetTemp: '37.0', currentTemp: '37.1' },
  ];

  const [units, setUnits] = useState(unitsDefaults);

  const handleUpdateTemp = (id: string, val: string) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, currentTemp: val } : u));
  };

  const getStatus = (current: string, target: string) => {
    const diff = Math.abs(parseFloat(current) - parseFloat(target));
    if (isNaN(diff)) return 'normal';
    if (diff >= 5) return 'critical';
    if (diff >= 2) return 'warning';
    return 'normal';
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const batchPromises = units.map(u => {
        return addDoc(collection(db, `labs/${user.uid}/temperatureLogs`), {
          unitId: u.id,
          unitName: u.name,
          targetTemp: u.targetTemp,
          currentTemp: u.currentTemp,
          status: getStatus(u.currentTemp, u.targetTemp),
          recordedBy: user.email || 'Unknown',
          date: today,
          createdAt: Date.now()
        });
      });
      await Promise.all(batchPromises);
      setMessage({ text: 'Morning temp logs submitted successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      setUnits(unitsDefaults);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to submit logs.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 glass-panel rounded-3xl relative">
      {message && (
        <div className={cn(
          "absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-light tracking-wide z-50 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300",
          message.type === 'success' ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-red-500/20 text-red-200 border border-red-500/30"
        )}>
          {message.text}
        </div>
      )}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-xl font-serif text-white tracking-wide">Morning Temperature Checks</h3>
          <p className="text-sm text-white/50 mt-1 font-light tracking-wide">Log current equipment state for daily compliance</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-6 py-3 rounded-full text-sm font-light tracking-wider hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-50 border border-[#D4AF37]/30"
        >
          <CheckCircle2 size={18} strokeWidth={1.5} /> {isSubmitting ? 'Submitting...' : 'Submit Readings'}
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {units.map((unit) => {
          const status = getStatus(unit.currentTemp, unit.targetTemp);
          return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={unit.id} className={cn(
            "glass-panel rounded-3xl p-6 flex flex-col relative overflow-hidden transition-all duration-500",
            status === 'critical' ? "shadow-[0_0_15px_rgba(239,68,68,0.15)] border-red-500/30 bg-red-500/5 pulse-red" :
            status === 'warning' ? "shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/30 bg-amber-500/5" : 
            "hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] border-white/5 bg-white/[0.01]"
          )}>
            {(status === 'warning' || status === 'critical') && (
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                status === 'critical' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              )}></div>
            )}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="font-mono text-xl text-white font-light tracking-wide mb-1">{unit.id}</div>
                <div className="text-xs font-light text-white/40 uppercase tracking-[0.2em]">{unit.name}</div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/10">
              <label className="block text-[10px] font-light uppercase text-white/50 tracking-[0.2em] mb-3">Record Current °C</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.1"
                  value={unit.currentTemp}
                  onChange={(e) => handleUpdateTemp(unit.id, e.target.value)}
                  className={cn(
                    "w-full border rounded-2xl px-4 py-3 text-2xl font-light font-mono focus:outline-none transition-all duration-300 bg-black/40",
                    status === 'critical'
                      ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-300"
                      : status === 'warning' 
                      ? "border-amber-500/50 focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-200" 
                      : "border-white/10 focus:border-[#D4AF37]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] text-white"
                  )}
                />
              </div>
            </div>
          </motion.div>
        )})}
      </motion.div>
    </div>
  );
}

function CleaningLogs() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const tasksDefault = [
    { id: '1', task: 'Decontaminate main biosafety cabinet', frequency: 'Daily' },
    { id: '2', task: 'Empty biohazard waste bins', frequency: 'Daily' },
    { id: '3', task: 'Clean and organize sample accessioning area', frequency: 'Daily' },
    { id: '4', task: 'Wipe down centrifuge rotors with 70% EtOH', frequency: 'Weekly' },
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleSign = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const tasksToLog = tasksDefault.filter(t => checked[t.id]);
      if (tasksToLog.length === 0) {
        setMessage({ text: 'No tasks completed.', type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        setIsSubmitting(false);
        return;
      }
      
      const batchPromises = tasksToLog.map(t => {
        return addDoc(collection(db, `labs/${user.uid}/cleaningLogs`), {
          taskId: t.id,
          taskName: t.task,
          completedBy: user.email || 'Unknown',
          completedAt: Date.now()
        });
      });
      await Promise.all(batchPromises);
      setMessage({ text: 'Cleaning log signed successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      setChecked({});
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to sign logs.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden relative">
      {message && (
        <div className={cn(
          "absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-light tracking-wide z-50 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300",
          message.type === 'success' ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-red-500/20 text-red-200 border border-red-500/30"
        )}>
          {message.text}
        </div>
      )}
      <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <div>
          <h3 className="text-xl font-serif text-white tracking-wide mb-1">End of Shift Protocol</h3>
          <p className="text-sm text-white/50 font-light tracking-wide">Please complete all required cleaning tasks before signing out.</p>
        </div>
        <button 
          onClick={handleSign}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-transparent text-[#D4AF37] px-6 py-3 rounded-full text-sm font-light tracking-wider hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-50 border border-[#D4AF37]/30"
        >
          <UserCheck size={18} strokeWidth={1.5} /> {isSubmitting ? 'WAIT...' : 'SIGN PROTOCOL'}
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="divide-y divide-white/5"
      >
        {tasksDefault.map((task) => {
          const isChecked = !!checked[task.id];
          return (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={task.id} 
              onClick={() => setChecked(prev => ({...prev, [task.id]: !isChecked}))}
              className="flex items-center gap-6 p-6 hover:bg-white/[0.02] cursor-pointer transition-colors duration-300 group"
            >
              <div className="flex-shrink-0 ml-2">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-md border transition-colors duration-300",
                  isChecked ? "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]" : "bg-black/50 border-white/20 text-transparent group-hover:border-white/40"
                )}>
                  {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="opacity-0 w-0 h-0" />}
                </div>
              </div>
              <div className="flex-1">
                <p className={cn("text-base font-light tracking-wide transition-colors", isChecked ? "text-white/60 line-through" : "text-white")}>{task.task}</p>
                <p className={"text-[10px] text-white/40 font-light uppercase tracking-[0.2em] mt-1"}>{task.frequency}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
