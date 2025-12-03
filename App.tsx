import React, { useState, useEffect } from 'react';
import { CampaignSettingsData, Lead, ProcessingStatus } from './types';
import CampaignSettings from './components/CampaignSettings';
import FileUpload from './components/FileUpload';
import LeadTable from './components/LeadTable';
import { extractLeads, generateSMS } from './services/geminiService';
import { Layers, Activity } from 'lucide-react';

// Random contexts to cycle through as per requirement
const CONTEXTS = ["Drop and Hook", "Dedicated Lanes", "Mail Loads"];

const App: React.FC = () => {
  const [settings, setSettings] = useState<CampaignSettingsData>({
    senderName: '',
    companyName: ''
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [history, setHistory] = useState<string[]>([]); // Array of phone numbers for history

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('benux_lead_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('benux_lead_history', JSON.stringify(history));
  }, [history]);

  const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

  const handleFilesSelected = async (files: File[]) => {
    if (!settings.senderName || !settings.companyName) {
      alert("Please configure Sender Name and Company Name first.");
      return;
    }
    
    // Check if API key is present
    if (!process.env.API_KEY) {
        alert("API Key is missing. Please check configuration.");
        return;
    }

    setStatus(ProcessingStatus.PROCESSING);
    
    let newLeads: Lead[] = [];
    let currentBatchPhones = new Set<string>();

    try {
      // Process files sequentially to avoid hitting rate limits too hard
      for (const file of files) {
        const rawLeads = await extractLeads(file, settings);
        
        for (const raw of rawLeads) {
            // Strict Mobile Logic: If Gemini says it's not mobile, we skip it?
            // User requirement: "Strict Logic: Only keep mobile numbers"
            if (!raw.isMobile) continue; 
            
            // Generate deterministic ID
            const normalizedPhone = normalizePhone(raw.phoneNumber);
            const id = `${normalizedPhone}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Check Duplicates
            let isDuplicate = false;
            let duplicateSource: 'Current Batch' | 'History' | undefined = undefined;

            if (currentBatchPhones.has(normalizedPhone)) {
                isDuplicate = true;
                duplicateSource = 'Current Batch';
            } else if (history.includes(normalizedPhone)) {
                isDuplicate = true;
                duplicateSource = 'History';
            }

            if (!isDuplicate) {
                currentBatchPhones.add(normalizedPhone);
            }

            // Assign Context: Round Robin or Random
            const context = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];
            
            const sms = await generateSMS(raw.fullName, settings, context);

            newLeads.push({
                id,
                fullName: raw.fullName,
                phoneNumber: raw.phoneNumber,
                isMobile: raw.isMobile,
                context,
                smsMessage: sms,
                sourceFile: file.name,
                isDuplicate,
                duplicateSource,
                timestamp: Date.now()
            });
        }
      }

      // Update State
      setLeads(prev => [...prev, ...newLeads]);
      
      // Update History with ONLY valid unique new leads
      const uniqueNewPhones = newLeads
        .filter(l => !l.isDuplicate)
        .map(l => normalizePhone(l.phoneNumber));
      
      setHistory(prev => [...prev, ...uniqueNewPhones]);
      setStatus(ProcessingStatus.COMPLETE);

    } catch (error) {
      console.error("Processing failed", error);
      setStatus(ProcessingStatus.ERROR);
      alert("Failed to process files. Please check the console or try again.");
    } finally {
        // Reset status after a brief delay so user sees "Complete" or result
        setTimeout(() => setStatus(ProcessingStatus.IDLE), 2000);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the current list? History will be preserved.")) {
        setLeads([]);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Layers className="text-white w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">BENUX CORP</h1>
                <p className="text-xs text-blue-400 font-medium tracking-wide">COLD LEADS INTELLIGENCE</p>
             </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
             <div className={`w-2 h-2 rounded-full ${status === ProcessingStatus.PROCESSING ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
             <span className="text-xs font-mono text-slate-400">
                {status === ProcessingStatus.PROCESSING ? 'SYSTEM BUSY' : 'SYSTEM READY'}
             </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 space-y-6">
                <CampaignSettings settings={settings} setSettings={setSettings} />
                <FileUpload onFilesSelected={handleFilesSelected} isProcessing={status === ProcessingStatus.PROCESSING} />
                
                {/* Stats Card */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Session Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-white">{leads.length}</div>
                            <div className="text-xs text-slate-500">Total Leads</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-emerald-400">
                                {leads.filter(l => !l.isDuplicate).length}
                            </div>
                            <div className="text-xs text-slate-500">Valid Mobile</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Data Table */}
            <div className="lg:col-span-2">
                <LeadTable leads={leads} onClear={handleClear} />
                
                {leads.length === 0 && status !== ProcessingStatus.PROCESSING && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                        <Layers className="w-12 h-12 mb-4 opacity-20" />
                        <p>No leads generated yet.</p>
                        <p className="text-sm">Configure campaign and upload files to begin.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;