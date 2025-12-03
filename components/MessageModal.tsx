import React from 'react';
import { X, MessageSquare } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  leadName: string;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, message, leadName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-2 text-white font-medium">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>SMS Preview: {leadName}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-slate-800 p-4 rounded-xl rounded-tl-none border border-slate-700 text-slate-200 leading-relaxed relative">
             {message}
             <div className="absolute -top-[1px] -left-2 w-0 h-0 border-t-[10px] border-t-slate-800 border-l-[10px] border-l-transparent transform rotate-180"></div>
          </div>
          <div className="mt-4 text-xs text-slate-500 text-center">
            Standard SMS rates apply. Message length: {message.length} chars.
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-right">
             <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
             >
                Close
             </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;