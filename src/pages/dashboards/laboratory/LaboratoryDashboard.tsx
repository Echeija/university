import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Microscope, Plus, Search, Edit2, Trash2, Save, X, AlertCircle, ArrowUpRight, ArrowDownLeft, FileText, Upload, Sparkles, Loader2 } from 'lucide-react';
import LabEquipmentStats from './LabEquipmentStats';

import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { Download } from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function LaboratoryDashboard() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  
  const [equipments, setEquipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  const [actionModal, setActionModal] = useState<{ isOpen: boolean, type: 'Checkout' | 'Return', item: any | null }>({ isOpen: false, type: 'Checkout', item: null });
  const [actionData, setActionData] = useState({ quantity: 1, notes: '' });
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [aiAnalysisModal, setAiAnalysisModal] = useState({ isOpen: false, content: '', isLoading: false });
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    description: '',
    category: 'Microscopes',
    quantity: 1,
    minThreshold: 5,
    status: 'Operational'
  });


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/lab/equipments/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ items: results.data })
          });
          
          if (!res.ok) throw new Error('Failed to bulk import equipments');
          const data = await res.json();
          notify({ title: 'Success', message: `Import complete: ${data.added} added, ${data.updated} updated.`, type: 'success' });
          fetchEquipments();
        } catch (err: any) {
          console.error(err);
          notify({ title: 'Error', message: err.message, type: 'error' });
        }
        
        // Reset file input
        e.target.value = '';
      },
      error: (error) => {
        console.error(error);
        notify({ title: 'Error', message: 'Failed to parse CSV file', type: 'error' });
        e.target.value = '';
      }
    });
  };

  const exportLogsCSV = () => {
    if (auditLogs.length === 0) {
      notify({ title: 'Info', message: 'No logs to export', type: 'info' });
      return;
    }
    const data = auditLogs.map(log => ({
      Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm'),
      Action: log.action,
      Equipment: log.equipmentName,
      'Qty Change': log.quantityChanged,
      User: log.userName,
      Role: log.userRole,
      Notes: log.notes || ''
    }));
    
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lab_audit_trail_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLogsPDF = () => {
    if (auditLogs.length === 0) {
      notify({ title: 'Info', message: 'No logs to export', type: 'info' });
      return;
    }
    
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Laboratory Audit Trail', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 28);
    
    const tableData = auditLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm'),
      log.action,
      log.equipmentName,
      (log.quantityChanged > 0 ? '+' : '') + log.quantityChanged,
      log.userName,
      log.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Date/Time', 'Action', 'Equipment', 'Qty', 'User', 'Notes']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }, // emerald-500
    });
    
    doc.save(`lab_audit_trail_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportInventoryCSV = () => {
    if (equipments.length === 0) {
      notify({ title: 'Info', message: 'No inventory to export', type: 'info' });
      return;
    }
    const data = equipments.map(eq => ({
      ID: eq.id,
      Name: eq.name,
      Category: eq.category,
      Quantity: eq.quantity,
      Status: eq.status,
      'Last Updated': format(new Date(eq.lastUpdated), 'yyyy-MM-dd HH:mm'),
      'Updated By': eq.updaterName
    }));
    
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lab_inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyzeInventory = async () => {
    setAiAnalysisModal({ isOpen: true, content: '', isLoading: true });
    try {
      const res = await fetch('/api/lab/analyze-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to analyze inventory');
      const data = await res.json();
      setAiAnalysisModal({ isOpen: true, content: data.analysis, isLoading: false });
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Error', message: e.message, type: 'error' });
      setAiAnalysisModal({ isOpen: false, content: '', isLoading: false });
    }
  };

  const fetchLogs = async (equipmentId?: number) => {
    setLoadingLogs(true);
    try {
      const url = equipmentId ? `/api/lab/logs?equipmentId=${equipmentId}` : '/api/lab/logs';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.item) return;
    
    try {
      // Calculate new quantity
      let newQty = actionModal.item.quantity;
      if (actionModal.type === 'Checkout') {
        newQty -= actionData.quantity;
        if (newQty < 0) throw new Error("Cannot checkout more than available quantity");
      } else {
        newQty += actionData.quantity;
      }
      
      const res = await fetch(`/api/lab/equipments/${actionModal.item.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...actionModal.item,
          quantity: newQty,
          action: actionModal.type,
          notes: actionData.notes
        })
      });
      
      if (!res.ok) throw new Error('Failed to save action');
      notify({ title: 'Success', message: `Equipment ${actionModal.type.toLowerCase()} logged successfully`, type: 'success' });
      setActionModal({ isOpen: false, type: 'Checkout', item: null });
      fetchEquipments();
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Error', message: e.message, type: 'error' });
    }
  };

  const fetchEquipments = async () => {
    try {
      const res = await fetch('/api/lab/equipments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch equipments');
      const data = await res.json();
      setEquipments(data);
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Error', message: 'Could not load equipments', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleOpenModal = (mode: 'add' | 'edit', item?: any) => {
    setModalMode(mode);
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        quantity: item.quantity,
        minThreshold: item.minThreshold || 5,
        status: item.status
      });
    } else {
      setFormData({
        id: null,
        name: '',
        description: '',
        category: 'Microscopes',
        quantity: 1,
        minThreshold: 5,
        status: 'Operational'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add' ? '/api/lab/equipments' : `/api/lab/equipments/${formData.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      
      notify({ title: 'Success', message: `Equipment ${modalMode === 'add' ? 'added' : 'updated'} successfully`, type: 'success' });
      setIsModalOpen(false);
      fetchEquipments();
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Error', message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      const res = await fetch(`/api/lab/equipments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      notify({ title: 'Success', message: 'Equipment deleted', type: 'success' });
      fetchEquipments();
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Error', message: e.message, type: 'error' });
    }
  };

  const filtered = equipments.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Microscope className="w-8 h-8 text-emerald-600" />
            Laboratory Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage laboratory equipments and inventory</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAnalyzeInventory}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">Smart Analyze</span>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors cursor-pointer" title="Import CSV">
              <Upload className="w-5 h-5" />
              <span>Import</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={exportInventoryCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors"
              title="Export Inventory (CSV)"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
          <button 
            onClick={() => { fetchLogs(); setAuditModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
            Audit Trail
          </button>
          {(user?.role === 'Administrator' || user?.role === 'Laboratory') && (
            <button 
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Equipment
            </button>
          )}
        </div>
      </div>
      
      {equipments.length > 0 && <LabEquipmentStats equipments={equipments} />}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Category</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Quantity</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Last Updated</th>
                {(user?.role === 'Administrator' || user?.role === 'Laboratory') && (
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Loading inventory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No equipment found</td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                      {item.description && <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium 
                        ${item.status === 'Operational' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          item.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          item.status === 'Out of Stock' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }
                      `}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {format(new Date(item.lastUpdated), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-slate-400">by {item.updaterName || 'Unknown'}</div>
                    </td>
                    {(user?.role === 'Administrator' || user?.role === 'Laboratory') && (
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <button 
                            title="Checkout Equipment"
                            onClick={() => { setActionModal({ isOpen: true, type: 'Checkout', item }); setActionData({ quantity: 1, notes: '' }); }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button 
                            title="Return Equipment"
                            onClick={() => { setActionModal({ isOpen: true, type: 'Return', item }); setActionData({ quantity: 1, notes: '' }); }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>
                          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 my-auto"></div>
                          <button 
                            title="View History"
                            onClick={() => { fetchLogs(item.id); setAuditModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            title="Edit"
                            onClick={() => handleOpenModal('edit', item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            title="Delete"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {modalMode === 'add' ? 'Add Equipment' : 'Edit Equipment'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipment Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Microscopes">Microscopes</option>
                  <option value="Glassware">Glassware</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Measuring Instruments">Measuring Instruments</option>
                  <option value="Safety Gear">Safety Gear</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Broken">Broken</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {modalMode === 'add' ? 'Save Equipment' : 'Update Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout / Return Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {actionModal.type === 'Checkout' ? <ArrowUpRight className="w-5 h-5 text-amber-500" /> : <ArrowDownLeft className="w-5 h-5 text-emerald-500" />}
                {actionModal.type} Equipment
              </h2>
              <button 
                onClick={() => setActionModal({ isOpen: false, type: 'Checkout', item: null })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleActionSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  Logging {actionModal.type.toLowerCase()} for <strong className="text-slate-900 dark:text-white">{actionModal.item?.name}</strong>. Current quantity: {actionModal.item?.quantity}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity to {actionModal.type}</label>
                <input 
                  type="number"
                  min="1"
                  max={actionModal.type === 'Checkout' ? actionModal.item?.quantity : undefined}
                  required
                  value={actionData.quantity}
                  onChange={e => setActionData({...actionData, quantity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Recipient (Optional)</label>
                <input 
                  type="text"
                  value={actionData.notes}
                  onChange={e => setActionData({...actionData, notes: e.target.value})}
                  placeholder={actionModal.type === 'Checkout' ? "e.g., Given to Dr. Smith" : "e.g., Returned in good condition"}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, type: 'Checkout', item: null })}
                  className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-medium text-white transition-colors ${actionModal.type === 'Checkout' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  Confirm {actionModal.type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {aiAnalysisModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Inventory Insights
              </h2>
              <button 
                onClick={() => setAiAnalysisModal({ ...aiAnalysisModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
              {aiAnalysisModal.isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                  <p>Analyzing inventory data with Gemini...</p>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <Markdown>{aiAnalysisModal.content}</Markdown>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900">
              <button 
                onClick={() => setAiAnalysisModal({ ...aiAnalysisModal, isOpen: false })}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Audit Trail
              </h2>
              <button 
                onClick={() => setAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingLogs ? (
                <div className="py-12 text-center text-slate-500">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No logs found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Timestamp</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Action</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Equipment</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Qty Chg</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">User</th>
                      <th className="py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium 
                            ${log.action === 'Added' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30' :
                              log.action === 'Checkout' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30' :
                              log.action === 'Return' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' :
                              log.action === 'Deleted' ? 'bg-red-100 text-red-800 dark:bg-red-900/30' :
                              'bg-slate-100 text-slate-800 dark:bg-slate-800'
                            }
                          `}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {log.equipmentName}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {log.quantityChanged > 0 ? '+' : ''}{log.quantityChanged}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-900 dark:text-white">{log.userName}</div>
                          <div className="text-xs text-slate-500">{log.userRole}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.notes}>
                          {log.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportLogsCSV}
                  disabled={auditLogs.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button 
                  onClick={exportLogsPDF}
                  disabled={auditLogs.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
              <button 
                onClick={() => setAuditModalOpen(false)}
                className="px-5 py-2 rounded-xl font-medium text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
