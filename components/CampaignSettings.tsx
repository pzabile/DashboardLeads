import React from 'react';
import { CampaignSettingsData } from '../types';
import { Settings, User, Building2 } from 'lucide-react';

interface CampaignSettingsProps {
  settings: CampaignSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<CampaignSettingsData>>;
}

const CampaignSettings: React.FC<CampaignSettingsProps> = ({ settings, setSettings }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass-card p-6 rounded-xl mb-6">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Settings className="w-5 h-5" />
        <h2 className="font-semibold text-lg tracking-wide text-white">Campaign Configuration</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" /> Sender Name
          </label>
          <input
            type="text"
            name="senderName"
            value={settings.senderName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
          />
        </div>
        
        <div className="group">
          <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={handleChange}
            placeholder="e.g. Benux Corp"
            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignSettings;