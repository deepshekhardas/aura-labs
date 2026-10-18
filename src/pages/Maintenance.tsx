import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, Search, PlusCircle, X, Wrench, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '../utils';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface AssetData {
  id: string;
  assetId?: string;
  name: string;
  type: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance: string;
  createdAt?: number;
}

export default function Maintenance() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const [newAsset, setNewAsset] = useState({
    assetId: '', name: '', type: 'Centrifuge', status: 'Operational', lastMaintenance: '', nextMaintenance: ''
  });
  
  const [logFormData, setLogFormData] = useState({
    assetId: '', notes: '', date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Centrifuge', 'Sequencer', 'Thermal Cycler', 'Liquid Handler', 'Other'];
  const statuses = ['Operational', 'Due Soon', 'Needs Repair', 'Overdue'];

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `labs/${user.uid}/assets`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: AssetData[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as AssetData);
      });
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAssets(fetched);
    }, (error) => {
      console.error('Firestore Error: ', error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, `labs/${user.uid}/assets`), {
        ...newAsset,
        createdAt: Date.now()
      });
      setIsAddModalOpen(false);
      setNewAsset({ assetId: '', name: '', type: 'Centrifuge', status: 'Operational', lastMaintenance: '', nextMaintenance: '' });
    } catch (e) {
      console.error("Failed adding asset", e);
    }
  };

  const handleLogService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !logFormData.assetId) return;
    try {
      const assetRef = doc(db, `labs/${user.uid}/assets`, logFormData.assetId);
      // Determine next maintenance by adding roughly 6 months
      const nextDate = new Date(logFormData.date);
      nextDate.setMonth(nextDate.getMonth() + 6);
      
      await updateDoc(assetRef, {
        lastMaintenance: logFormData.date,
        nextMaintenance: nextDate.toISOString().split('T')[0],
        status: 'Operational'
      });
      setIsLogModalOpen(false);
      setLogFormData({ assetId: '', notes: '', date: new Date().toISOString().split('T')[0] });
      } catch (e) {
        console.error("Failed logging service", e);
      }
    };
  
    const handleDeleteAsset = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) return;
      if (!window.confirm("Are you sure you want to delete this asset?")) return;
      try {
        await deleteDoc(doc(db, `labs/${user.uid}/assets`, id));
      } catch (e) {
        console.error("Failed deleting asset", e);
      }
    };
  
    const filteredAssets = assets.filter(a => 
    (filterCategory ? a.type === filterCategory : true) &&
    (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full relative"
    >
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto relative">
          <div className="relative group flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#D4AF37] transition-colors duration-500" size={16} strokeWidth={1.5} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets..." 
              className="pl-12 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-full text-sm font-light focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] w-full transition-all text-white placeholder:text-white/30 tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 bg-transparent border rounded-full text-sm font-light transition-all tracking-wide whitespace-nowrap",
                filterCategory ? "border-[#D4AF37]/50 text-[#D4AF37]" : "border-white/10 text-white/70 hover:bg-white/[0.02] hover:text-white"
              )}>
              <Filter size={16} strokeWidth={1.5} /> {filterCategory || 'Filter'}
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-xl z-20 overflow-hidden">
                <div className="py-2">
                  <button 
                    onClick={() => { setFilterCategory(null); setIsFilterOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setFilterCategory(cat); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-shrink-0 items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-sm font-light hover:bg-[#D4AF37]/10 transition-all tracking-wide whitespace-nowrap flex-1 xl:flex-none">
            <PlusCircle size={16} strokeWidth={1.5} /> Add Equipment
          </button>
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="flex flex-shrink-0 items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-sm font-light hover:bg-[#D4AF37] hover:text-black transition-all duration-300 tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] whitespace-nowrap flex-1 xl:flex-none">
            <Wrench size={16} strokeWidth={1.5} /> Log Service
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden mb-10 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
           <thead>
            <tr className="bg-white/[0.02] border-b border-white/10 text-white/40">
              <th className="p-4 w-32 border-r border-white/5 text-[10px] font-light uppercase tracking-[0.2em] pl-6">Asset ID</th>
              <th className="p-4 border-r border-white/5 text-[10px] font-light uppercase tracking-[0.2em]">Equipment Name</th>
              <th className="p-4 border-r border-white/5 text-[10px] font-light uppercase tracking-[0.2em]">Category</th>
              <th className="p-4 w-48 border-r border-white/5 text-[10px] font-light uppercase tracking-[0.2em]">Status</th>
              <th className="p-4 w-48 border-r border-white/5 text-[10px] font-light uppercase tracking-[0.2em]">Last Service</th>
              <th className="p-4 w-40 text-right border-r border-white/5 text-[10px] font-light uppercase tracking-[0.2em] pr-6">Next Due</th>
              <th className="p-4 w-16 text-center text-[10px] font-light uppercase tracking-[0.2em]"></th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {filteredAssets.length === 0 ? (
               <tr><td colSpan={7} className="p-8 text-center text-white/40 font-light tracking-wide text-sm">No assets found</td></tr>
            ) : filteredAssets.map((asset) => (
              <tr key={asset.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors duration-300 group">
                <td className="p-4 font-mono text-sm text-[#D4AF37] font-light border-r border-white/5 pl-6">{asset.assetId || `UNK-${asset.id.substring(0, 4).toUpperCase()}`}</td>
                <td className="p-4 font-light tracking-wide text-white/90 border-r border-white/5">{asset.name}</td>
                <td className="p-4 text-sm font-light text-white/60 border-r border-white/5">{asset.type}</td>
                <td className="p-4 border-r border-white/5">
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-light uppercase tracking-[0.2em] rounded-full border whitespace-nowrap",
                    asset.status === 'Operational' ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]" :
                    asset.status === 'Overdue' ? "border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                    asset.status === 'Needs Repair' ? "border-purple-500/30 bg-purple-500/10 text-purple-400" :
                    "border-amber-500/30 bg-amber-500/10 text-amber-500"
                  )}>
                    {asset.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-white/50 font-mono font-light border-r border-white/5 h-[72px]">
                  <div className="flex items-center gap-3 w-full">
                    <CalendarIcon size={16} strokeWidth={1.5} className="text-white/30 group-hover:text-[#D4AF37] flex-shrink-0 transition-colors duration-300" />
                    <span className="truncate">{asset.lastMaintenance || 'None'}</span>
                  </div>
                </td>
                <td className="p-4 text-right pr-6 h-[72px] border-r border-white/5">
                  <div className={cn(
                    "text-sm font-mono font-light whitespace-nowrap",
                    asset.status === 'Overdue' ? "text-red-500 font-normal drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-white/70"
                  )}>
                    {asset.nextMaintenance || 'Not set'}
                  </div>
                </td>
                <td className="p-4 text-center h-[72px]">
                  <button 
                    onClick={(e) => handleDeleteAsset(asset.id, e)}
                    className="p-2 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors duration-300 opacity-0 group-hover:opacity-100"
                    title="Delete Equipment"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <X size={20} strokeWidth={1.5} />
            </button>
            <h2 className="text-xl font-serif text-white tracking-wide mb-6">Add Equipment</h2>
            
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Asset ID</label>
                <input required type="text" value={newAsset.assetId} onChange={e => setNewAsset(prev => ({...prev, assetId: e.target.value}))} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04]" placeholder="e.g. CEN-001" />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Equipment Name</label>
                <input required type="text" value={newAsset.name} onChange={e => setNewAsset(prev => ({...prev, name: e.target.value}))} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04]" placeholder="e.g. Eppendorf 5810R" />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Category</label>
                <select value={newAsset.type} onChange={e => setNewAsset(prev => ({...prev, type: e.target.value}))} className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04] appearance-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Last Service</label>
                  <input required type="date" value={newAsset.lastMaintenance} onChange={e => setNewAsset(prev => ({...prev, lastMaintenance: e.target.value}))} className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Next Due</label>
                  <input required type="date" value={newAsset.nextMaintenance} onChange={e => setNewAsset(prev => ({...prev, nextMaintenance: e.target.value}))} className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]" />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-sm font-light hover:bg-[#D4AF37] hover:text-black transition-all">Save Equipment</button>
            </form>
          </div>
        </div>
      )}

      {/* Log Service Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsLogModalOpen(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
              <X size={20} strokeWidth={1.5} />
            </button>
            <h2 className="text-xl font-serif text-white tracking-wide mb-6">Log Service</h2>
            
            <form onSubmit={handleLogService} className="space-y-4">
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Select Equipment</label>
                <select required value={logFormData.assetId} onChange={e => setLogFormData(prev => ({...prev, assetId: e.target.value}))} className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none">
                  <option value="">-- Choose Asset --</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.assetId || `UNK-${a.id.substring(0,4)}`} - {a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Date Completed</label>
                <input required type="date" value={logFormData.date} onChange={e => setLogFormData(prev => ({...prev, date: e.target.value}))} className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/50 mb-2">Service Notes</label>
                <textarea required rows={3} value={logFormData.notes} onChange={e => setLogFormData(prev => ({...prev, notes: e.target.value}))} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.04]" placeholder="e.g. Replaced filters and calibrated..."></textarea>
              </div>
              <button type="submit" className="w-full mt-4 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-sm font-light hover:bg-[#D4AF37] hover:text-black transition-all">Submit Log</button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
