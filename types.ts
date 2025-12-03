export interface Lead {
  id: string;
  fullName: string;
  phoneNumber: string;
  isMobile: boolean;
  context: string;
  smsMessage: string;
  sourceFile: string;
  isDuplicate: boolean;
  duplicateSource?: 'Current Batch' | 'History';
  timestamp: number;
}

export interface CampaignSettingsData {
  senderName: string;
  companyName: string;
}

export interface ExtractedLeadRaw {
  fullName: string;
  phoneNumber: string;
  isMobile: boolean;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}