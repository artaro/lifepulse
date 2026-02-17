import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY || '');

const SYSTEM_PROMPT_BASE = `You are a strict financial data extraction assistant. Your ONLY job is to extract transaction rows from the provided bank statement (PDF, CSV, or Image) into a JSON array.

Strict Rules:
- Extract data ONLY from the transaction table(s).
- IGNORE all other text, headers, footers, balances, ads, or personal info.
- If the file is a CSV, parse the rows.
- If the file is a PDF/Image, visually identify the transaction table.
- Each transaction must have:
  - "date": YYYY-MM-DD
  - "time": HH:mm (24-hour) or "" if missing
  - "description": Look for 'รายละเอียด' column not 'รายการ' column. If not found, use the main description column.
  - "amount": Positive number (float). ABSOLUTELY NO NEGATIVE SIGNS or commas.
  - "type": "income" (if amount has a minus sign in the image, e.g. -500.00) or "expense" (if amount is positive). Default to "expense".

Output ONLY this JSON array. No markdown formatting. No explanation.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.LLM_API_KEY) {
      return NextResponse.json(
        { error: 'LLM_API_KEY is not configured' },
        { status: 500 }
      );
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { file } = await request.json() as any;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // specific handling for base64
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const bytes = new Uint8Array(buffer);

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT_BASE,
    });

    // Generate content
    const result = await model.generateContent([
      "Extract transactions from this image. Return ONLY a valid JSON array.",
      {
        inlineData: {
          data: Buffer.from(bytes).toString('base64'),
          mimeType: 'image/jpeg', // Assuming jpeg for now from compression
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up
    let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBracket = cleanedText.indexOf('[');
    const lastBracket = cleanedText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
    }

    let transactions = [];
    try {
      transactions = JSON.parse(cleanedText);
    } catch {
      console.warn('Failed to parse Gemini response as JSON', text);
    }

    // ... validation ...

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validTransactions = transactions.filter((t: any) => {
      return t.date && t.description && t.amount && (t.type === 'income' || t.type === 'expense');
    });

    return NextResponse.json({ transactions: validTransactions });

  } catch (error) {
    console.error('Parse statement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
