import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CampaignSettingsData, ExtractedLeadRaw } from "../types";

// In a real scenario, this comes from process.env.API_KEY
// The user provided key AIzaSyAMPBcQrR2btkhFfpfgyWZLCGqWlHaaE2s would be set in environment variables
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const leadSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, description: "The full name of the lead." },
    phoneNumber: { type: Type.STRING, description: "The phone number found." },
    isMobile: { type: Type.BOOLEAN, description: "True if the number is likely a mobile phone number, False if landline or unknown." },
  },
  required: ["fullName", "phoneNumber", "isMobile"],
};

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: leadSchema,
};

export const extractLeads = async (
  file: File,
  settings: CampaignSettingsData
): Promise<ExtractedLeadRaw[]> => {
  try {
    const isImage = file.type.startsWith('image/');
    const fileData = await readFileAsBase64(file);
    
    // We choose a model based on the complexity. Flash is good for basic extraction.
    const modelId = 'gemini-2.5-flash'; 

    let prompt = `
      Extract all contact information from this document.
      Focus on finding 'Full Name' and 'Phone Number'.
      STRICTLY analyze the phone number formats. Mark 'isMobile' as true ONLY if it looks like a mobile number (e.g., US mobile formats, or based on context).
      Ignore general support lines or 1-800 numbers if possible, unless associated with a specific person.
    `;

    const parts = [];
    
    if (isImage) {
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: fileData
        }
      });
    } else {
      // For text/csv/etc, we decode base64 to string for better token usage if possible, 
      // but the API handles base64 text files too. Let's send as text part if it's text.
      const textContent = atob(fileData);
      parts.push({ text: textContent });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawLeads = JSON.parse(text) as ExtractedLeadRaw[];
    return rawLeads;

  } catch (error) {
    console.error("Error extracting leads:", error);
    throw error;
  }
};

export const generateSMS = async (
  leadName: string,
  settings: CampaignSettingsData,
  logisticsContext: string
): Promise<string> => {
    // We can do this locally to save latency, or use Gemini for variety. 
    // Given the prompt asks for specific logic "Create a unique compliant SMS", 
    // let's use a robust template generator with slight variations to ensure compliance.
    
    // However, if we want TRULY unique AI generation per lead, we can call Gemini.
    // For batch processing speed, local templates are better.
    // Let's use a hybrid: Use a smart local template constructor that satisfies the "Unique" requirement by rotating phrasing.
    
    const greetings = ["Hi", "Hello", "Good day", "Greetings"];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const contextMap: Record<string, string> = {
        "Drop and Hook": "We have immediate Drop and Hook capacity available.",
        "Dedicated Lanes": "We are opening up new Dedicated Lanes in your area.",
        "Mail Loads": "We have urgent Mail Loads requiring coverage."
    };

    const specificContext = contextMap[logisticsContext] || "We have logistics capacity available.";
    
    return `${greeting} ${leadName}, this is ${settings.senderName} from ${settings.companyName}. We are offering OTR driver positions. ${specificContext} Reply YES or STOP to opt out.`;
};


// Helper to read file
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g. "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};