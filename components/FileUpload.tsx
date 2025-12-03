import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Limit to 10 files
    const validFiles = files.slice(0, 10);
    setSelectedFiles(validFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]); // Clear after processing starts
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl mb-6">
       <div className="flex items-center gap-2 mb-4 text-blue-400">
        <UploadCloud className="w-5 h-5" />
        <h2 className="font-semibold text-lg tracking-wide text-white">Lead Ingestion</h2>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px]
          ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-900/30'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/*,.csv,.txt,.xlsx"
          disabled={isProcessing}
        />
        
        <div className="text-center pointer-events-none">
          <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-400' : 'text-slate-500'}`} />
          <p className="text-lg font-medium text-slate-300">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Supports Images (OCR), CSV, Text. Max 10 files.
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                <span>Selected Files ({selectedFiles.length})</span>
                <button 
                    onClick={() => setSelectedFiles([])}
                    className="text-red-400 hover:text-red-300"
                >
                    Clear All
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileIcon className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-sm text-slate-200 truncate">{file.name}</span>
                        </div>
                        <button 
                            onClick={() => removeFile(idx)}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`w-full mt-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                    ${isProcessing 
                        ? 'bg-blue-500/50 cursor-not-allowed text-blue-200' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
                `}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Leads with Gemini AI...
                    </>
                ) : (
                    <>
                        Start Extraction
                    </>
                )}
            </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;