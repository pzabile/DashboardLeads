import React, { useState } from 'react';
import { Lead } from '../types';
import { Eye, Download, Trash2, Smartphone, PhoneOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import MessageModal from './MessageModal';
import { exportLeadsToExcel } from '../services/excelService';

interface LeadTableProps {
  leads: Lead[];
  onClear: () => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onClear }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (leads.length === 0) return null;

  const validLeads = leads.filter(l => !l.isDuplicate);
  const duplicateCount = leads.length - validLeads.length;

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="font-semibold text-lg tracking-wide text-white flex items-center gap-2">
             Generated Leads
             <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
               {leads.length} Total
             </span>
           </h2>
           {duplicateCount > 0 && (
             <p className="text-sm text-yellow-500 mt-1 flex items-center gap-1">
               <AlertCircle className="w-3 h-3" /> {duplicateCount} duplicates found & flagged
             </p>
           )}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClear}
            className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <button 
            onClick={() => exportLeadsToExcel(leads)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export to Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800/50 text-slate-200 font-medium border-b border-slate-700">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Context</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leads.map((lead) => (
              <tr key={lead.id} className={`hover:bg-slate-800/30 transition-colors ${lead.isDuplicate ? 'bg-red-500/5' : ''}`}>
                <td className="px-6 py-4">
                  {lead.isDuplicate ? (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded border border-red-500/20" title={`Duplicate found in ${lead.duplicateSource}`}>
                      <AlertCircle className="w-3 h-3" /> Duplicate
                    </span>
                  ) : lead.isMobile ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                      <Smartphone className="w-3 h-3" /> Mobile
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 text-xs px-2 py-1 bg-slate-500/10 rounded border border-slate-500/20">
                      <PhoneOff className="w-3 h-3" /> Other
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-slate-200">
                  {lead.fullName}
                </td>
                <td className="px-6 py-4 font-mono">
                  {lead.phoneNumber}
                </td>
                <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                        {lead.context}
                    </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedLead(lead)}
                    className="text-blue-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium uppercase tracking-wider"
                  >
                    <Eye className="w-3 h-3" /> View SMS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MessageModal 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)}
        message={selectedLead?.smsMessage || ''}
        leadName={selectedLead?.fullName || ''}
      />
    </div>
  );
};

export default LeadTable;