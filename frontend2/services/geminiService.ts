
import { GoogleGenAI } from "@google/genai";

// AI Services for financial insights
export const getFinancialAdvice = async (project: any, transactions: any) => {
  try {
    // Initializing the Gemini client with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a financial analyst for a luxury hotel chain in Pakistan. Analyze the following data for "${project.name}" in ${project.location}.
      Status: ${project.status}
      Transactions: ${JSON.stringify(transactions.slice(0, 15))}
      Provide a concise 2-sentence summary of the financial health and a strategic recommendation for this specific project in the Pakistani market context.`,
    });

    // Directly access the .text property from the response
    return response.text || "Strategic analysis currently unavailable.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Strategic analysis currently unavailable due to system constraints.";
  }
};
