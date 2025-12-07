
import { GoogleGenAI } from "@google/genai";
import { Transaction, Debt } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinances = async (
  transactions: Transaction[],
  debts: Debt[],
  currentMonth: string
): Promise<string> => {
  try {
    const transactionSummary = transactions.map(t => 
      `${t.date}: ${t.description} (${t.type}) - ₹${t.amount} [${t.category}]`
    ).join('\n');

    const debtSummary = debts.filter(d => !d.isPaid).map(d => 
      `${d.type === 'i_owe' ? 'I owe' : 'Owes me'} ${d.personName}: ₹${d.amount} (${d.description || 'No desc'})`
    ).join('\n');

    const prompt = `
      Act as a strict but helpful financial advisor.
      Current Month Context: ${currentMonth}
      Currency: INR (₹)

      Here is my financial data:
      
      --- TRANSACTIONS ---
      ${transactionSummary}
      
      --- OUTSTANDING DEBTS/LOANS ---
      ${debtSummary}
      
      Please provide a brief, actionable financial analysis in Markdown format.
      1. Summarize my spending habits this month.
      2. Identify the biggest money drain.
      3. Give specific advice on how to save more rupees based on the categories.
      4. Comment on my debt situation (who I need to pay back urgently or collect from).
      5. Keep it concise, under 200 words. Use bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Error analyzing finances:", error);
    return "Error connecting to AI advisor. Please check your API key.";
  }
};
