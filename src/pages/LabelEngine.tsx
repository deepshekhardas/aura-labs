import { useState, useEffect } from 'react';
import { Printer, FileBadge2, Download, Search, Settings2, Plus } from 'lucide-react';
import { cn } from '../utils';
import { collection, getDocs, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { buildLabelPdf } from '../label-pdf';

interface SampleData {
  id: string;
  localId: string;
  patient: string;
  type: string;
  time: string;
  priority: string;
  createdAt: number;
}

export default function LabelEngine() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `labs/${user.uid}/samples`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSamples: SampleData[] = [];
      snapshot.forEach((doc) => {
        fetchedSamples.push({ id: doc.id, ...doc.data() } as SampleData);
      });
      // Sort by createdAt descending
      fetchedSamples.sort((a, b) => b.createdAt - a.createdAt);
      
      setSamples(fetchedSamples);
    }, (error) => {
      console.error('Firestore Error: ', error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const toggleSelect = (id: string) => {
    if (selectedLabels.includes(id)) {
      setSelectedLabels(selectedLabels.filter(i => i !== id));
    } else {
      setSelectedLabels([...selectedLabels, id]);
    }
  };

  const handlePrint = () => {
    void exportPDF();
  };

  const exportPDF = async () => {
    if (selectedLabels.length === 0 || isGenerating) return;
    setErrorMessage('');
    
    setIsGenerating(true);
    try {
      const selectedTestData = samples.filter((sample) => selectedLabels.includes(sample.id));
      buildLabelPdf(selectedTestData).save(`Aura_Demo_Labels_${Date.now()}.pdf`);
      setSelectedLabels([]);
    } catch (err) {
      setErrorMessage('PDF export failed. Your selection is preserved; please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSample = async () => {
    if (!user) return;
    const types = ['Blood - EDTA', 'Serum', 'Urine', 'Plasma', 'Blood - SST'];
    const priorities = ['Routine', 'STAT', 'ASAP'];
    const names = ['Doe, John', 'Smith, Jane', 'Johnson, Robert', 'Williams, Mary', 'Brown, James'];
    
    const newSample = {
      localId: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      patient: names[Math.floor(Math.random() * names.length)],
      type: types[Math.floor(Math.random() * types.length)],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, `labs/${user.uid}/samples`), newSample);
    } catch (e) {
      console.error("Failed adding sample", e);
      setErrorMessage('Demo sample could not be saved. Please try again.');
    }
  };

  const filteredSamples = samples.filter(s => 
    s.localId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-[calc(100vh-120px)]"
    >
      <p className="text-xs text-white/60 mb-4">Demo samples only. PDF labels are 4 x 2 inches. No physical printer is connected.</p>
      {errorMessage && <p role="alert" className="text-sm text-rose-300 mb-4">{errorMessage}</p>}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#D4AF37] transition-colors duration-500" size={16} strokeWidth={1.5} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Scan or enter ID..." 
              className="pl-12 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-full text-sm font-light focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all w-full text-white placeholder:text-white/30 tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-transparent border border-white/10 rounded-full text-sm font-light hover:bg-white/[0.02] hover:text-white transition-all text-white/70 tracking-wide whitespace-nowrap">
            <Settings2 size={16} strokeWidth={1.5} />
            4x2" PDF Format
          </button>
          <button 
            onClick={handleAddSample}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-sm font-light hover:bg-[#D4AF37] hover:text-black transition-all duration-300 tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.1)] whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={1.5} /> Add Demo Sample
          </button>
        </div>
        <div className="flex gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
          <button 
            onClick={exportPDF}
            disabled={selectedLabels.length === 0 || isGenerating}
            className="flex flex-shrink-0 items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/10 rounded-full text-sm font-light disabled:opacity-30 hover:bg-white/[0.02] hover:text-white transition-all text-white/70 tracking-wide whitespace-nowrap flex-1 xl:flex-none"
          >
            <Download size={16} strokeWidth={1.5} />
            {isGenerating ? 'Exporting...' : 'PDF Export'}
          </button>
          <button 
            onClick={handlePrint}
            disabled={selectedLabels.length === 0 || isGenerating}
            className="flex flex-shrink-0 items-center justify-center gap-2 px-8 py-3 bg-transparent border border-[#D4AF37]/50 text-[#D4AF37] rounded-full text-sm font-light disabled:opacity-30 hover:bg-[#D4AF37] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] tracking-wider whitespace-nowrap flex-1 xl:flex-none"
          >
            <Printer size={16} strokeWidth={1.5} className={isGenerating ? "animate-pulse" : ""} />
            {isGenerating ? 'Preparing...' : `Print-ready PDF (${selectedLabels.length})`}
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10 text-white/40">
              <th className="p-4 w-14 text-center">
                <input 
                  type="checkbox" 
                  checked={filteredSamples.length > 0 && selectedLabels.length === filteredSamples.length}
                  onChange={() => {
                    if (selectedLabels.length === filteredSamples.length) setSelectedLabels([]);
                    else setSelectedLabels(filteredSamples.map((s) => s.id));
                  }}
                  className="rounded-sm border-white/20 bg-black/50 text-[#D4AF37] focus:ring-[#D4AF37]/30 focus:ring-offset-0 focus:ring-offset-[#050505] transition-colors w-4 h-4"
                />
              </th>
              <th className="p-4 text-[10px] font-light uppercase tracking-[0.2em]">Sample ID</th>
              <th className="p-4 text-[10px] font-light uppercase tracking-[0.2em]">Patient</th>
              <th className="p-4 text-[10px] font-light uppercase tracking-[0.2em]">Specimen</th>
              <th className="p-4 text-[10px] font-light uppercase tracking-[0.2em]">Priority</th>
              <th className="p-4 text-[10px] font-light uppercase tracking-[0.2em]">Time Logged</th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {filteredSamples.map((sample) => (
              <tr 
                key={sample.id} 
                className={cn(
                  "border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors duration-300",
                  selectedLabels.includes(sample.id) && "bg-[#D4AF37]/5 border-[#D4AF37]/20"
                )}
                onClick={() => toggleSelect(sample.id)}
              >
                <td className="p-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedLabels.includes(sample.id)} 
                    aria-label={`Select sample ${sample.localId}`}
                    onClick={e => e.stopPropagation()}
                    onChange={() => toggleSelect(sample.id)}
                    className="rounded-sm border-white/20 bg-black/50 text-[#D4AF37] focus:ring-[#D4AF37]/30 focus:ring-offset-0 focus:ring-offset-[#050505] transition-colors w-4 h-4"
                  />
                </td>
                <td className="p-4 font-mono text-sm text-white/70 font-light tracking-wide">
                  <div className="flex items-center gap-3">
                    <FileBadge2 size={16} strokeWidth={1.5} className="text-[#D4AF37]/60" />
                    {sample.localId}
                  </div>
                </td>
                <td className="p-4 text-sm font-light tracking-wide text-white/90">{sample.patient}</td>
                <td className="p-4 text-sm font-light tracking-wide text-white/60">{sample.type}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-light uppercase tracking-[0.2em] rounded-full border",
                    sample.priority === 'STAT' ? "border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                    sample.priority === 'ASAP' ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]" :
                    "border-white/10 bg-white/5 text-white/50"
                  )}>
                    {sample.priority}
                  </span>
                </td>
                <td className="p-4 text-[11px] text-white/40 tracking-wider font-mono font-light">{sample.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {samples.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 bg-black/20">
            <div className="p-8 text-center max-w-sm">
              <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                <FileBadge2 size={24} strokeWidth={1.5} className="text-[#D4AF37]/50" />
              </div>
              <p className="text-sm font-light tracking-wider text-white/80 mb-2">Registry is empty</p>
              <p className="text-[11px] font-light text-white/40 leading-relaxed uppercase tracking-wider">Scan barcode or manually initialize sequence to begin generation</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
