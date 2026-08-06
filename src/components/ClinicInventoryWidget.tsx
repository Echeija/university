import React, { useState } from 'react';
import { PackageSearch, AlertTriangle, Plus, Edit2, Search, Activity, Archive } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function ClinicInventoryWidget() {
  const { notify } = useNotification();
  const [search, setSearch] = useState('');
  
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Amoxicillin 500mg', category: 'Medication', stock: 150, threshold: 50, unit: 'capsules' },
    { id: 2, name: 'Ibuprofen 400mg', category: 'Medication', stock: 45, threshold: 100, unit: 'tablets' },
    { id: 3, name: 'Sterile Syringes (5ml)', category: 'Supply', stock: 12, threshold: 50, unit: 'boxes' },
    { id: 4, name: 'Medical Gloves (Large)', category: 'Supply', stock: 5, threshold: 20, unit: 'boxes' },
    { id: 5, name: 'Bandages (Standard)', category: 'Supply', stock: 200, threshold: 50, unit: 'packs' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Medication', stock: '', threshold: '', unit: 'units'
  });

  const lowStockItems = inventory.filter(item => item.stock <= item.threshold);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStock = (id: number, increment: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + increment);
        if (newStock <= item.threshold && item.stock > item.threshold) {
          notify({
            title: 'Low Stock Alert',
            message: `${item.name} has fallen below the reorder threshold.`,
            type: 'error'
          });
        }
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      threshold: parseInt(formData.threshold) || 10,
      unit: formData.unit
    };
    
    setInventory([...inventory, newItem]);
    setIsAdding(false);
    setFormData({ name: '', category: 'Medication', stock: '', threshold: '', unit: 'units' });
    notify({
      title: 'Item Added',
      message: `${newItem.name} has been added to inventory.`,
      type: 'success'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Medical Inventory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track supplies & medications</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alerts ({lowStockItems.length})
          </div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockItems.map(item => (
              <div key={`alert-${item.id}`} className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-red-100 dark:border-red-900/50 text-sm flex justify-between items-center">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{item.name}</span>
                <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap">{item.stock} / {item.threshold}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddItem} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900" placeholder="e.g. Paracetamol" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900">
              <option>Medication</option>
              <option>Supply</option>
              <option>Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Stock</label>
            <input required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} type="number" className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900" placeholder="Qty" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Threshold</label>
            <input required value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} type="number" className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900" placeholder="Min" />
          </div>
          <div className="md:col-span-5 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Save Item</button>
          </div>
        </form>
      )}

      <div className="mb-4 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold">
            <tr>
              <th className="p-3 rounded-tl-lg">Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Stock Level</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right rounded-tr-lg">Update Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredInventory.map(item => {
              const isLow = item.stock <= item.threshold;
              return (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unit: {item.unit}</p>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.category}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isLow ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.stock}
                      </span>
                      <span className="text-xs text-slate-500">/ {item.threshold} (min)</span>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-teal-500'}`}
                        style={{ width: `${Math.min(100, (item.stock / (item.threshold * 2)) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                        <Activity className="w-3 h-3" /> Optimal
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleUpdateStock(item.id, -10)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors font-bold"
                        title="Decrease by 10"
                      >
                        -10
                      </button>
                      <button 
                        onClick={() => handleUpdateStock(item.id, 10)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors font-bold"
                        title="Increase by 10"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
