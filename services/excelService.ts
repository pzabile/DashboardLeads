import * as XLSX from 'xlsx';
import { Lead } from '../types';

export const exportLeadsToExcel = (leads: Lead[]) => {
  const dataToExport = leads.map(lead => ({
    "Full Name": lead.fullName,
    "Phone Number": lead.phoneNumber,
    "Generated SMS": lead.smsMessage,
    "Source File": lead.sourceFile,
    "Duplicate Status": lead.isDuplicate ? `Duplicate (${lead.duplicateSource})` : "Unique",
    "Mobile Status": lead.isMobile ? "Mobile" : "Other"
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  
  // Generate file name with timestamp
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Benux_Corp_Leads_${date}.xlsx`);
};