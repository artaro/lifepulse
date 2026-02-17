import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFDocument } from 'pdf-lib';

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
  - "amount": Positive number
  - "type": "income" (credit/deposit) or "expense" (debit/withdrawal). Default to "expense" if unclear.

Category Prediction Rules:
- Use the provided JSON list of categories: [AVAILABLE_CATEGORIES]
- Try to match the transaction description to the most relevant category name.
- If NO category matches well, use "Fill in later".
- Return the EXACT category NAME from the list.

Output ONLY this JSON array. No markdown formatting. No explanation.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.LLM_API_KEY) {
      return NextResponse.json(
        { error: 'LLM_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;
    const categoriesJson = formData.get('categories') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    let systemInstruction = SYSTEM_PROMPT_BASE;
    if (categoriesJson) {
      try {
        const categories = JSON.parse(categoriesJson);
        const categoryNames = categories.map((c: any) => c.name).join(', ');
        // If there are no categories, default to generic behavior or "Fill in later"
        const catList = categoryNames || "Fill in later";
        systemInstruction = systemInstruction.replace('[AVAILABLE_CATEGORIES]', catList);
      } catch (e) {
        console.error('Failed to parse categories for prompt:', e);
        systemInstruction = systemInstruction.replace('[AVAILABLE_CATEGORIES]', "Fill in later");
      }
    } else {
      systemInstruction = systemInstruction.replace('[AVAILABLE_CATEGORIES]', "Fill in later");
    }

    let bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    const mimeType = file.type;

    // Handle Encrypted PDFs
    if (mimeType === 'application/pdf') {
      try {
        // Attempt to load the PDF. If it's encrypted just reading it might fail or return isEncrypted=true
        // We use ignoreEncryption: true to load the structure first to check isEncrypted
        const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        
        if (pdfDoc.isEncrypted) {
          if (!password) {
            return NextResponse.json(
              { error: 'Password required', code: 'PASSWORD_REQUIRED' },
              { status: 401 }
            );
          }

          // Try to unlock with password by reloading with password
          try {
             // pdf-lib load method with password decodes it
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const decryptedDoc = await PDFDocument.load(bytes, { password } as any);
             // Save back to buffer
             const savedBytes = await decryptedDoc.save();
             buffer = Buffer.from(savedBytes);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
             return NextResponse.json(
              { error: 'Incorrect password', code: 'PASSWORD_REQUIRED' },
              { status: 401 }
            );
          }
        }
      } catch (e) {
        console.error('Error checking PDF encryption:', e);
        // If it fails to load, it might be a weird file, let Gemini try or fail
      }
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      systemInstruction: systemInstruction,
    });

    let promptParts: any[] = [];

    // Handle different file types
    if (mimeType === 'text/csv' || mimeType.includes('text/')) {
      // For CSV/Text, pass as text
      const textContent = buffer.toString('utf-8');
      promptParts = [
        { text: "Extract transactions from this CSV/Text content:" },
        { text: textContent }
      ];
    } else {
      // For PDF or Images, pass as inlineData
      // Note: Gemini API supports application/pdf via inlineData
      promptParts = [
        { text: "Extract transactions from this statement file:" },
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: mimeType,
          },
        }
      ];
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks
    const cleanerText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let transactions;
    try {
      transactions = JSON.parse(cleanerText);
      if (!Array.isArray(transactions) && transactions.transactions) {
        transactions = transactions.transactions;
      }
      if (!Array.isArray(transactions)) {
        throw new Error('Response is not an array');
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: 'Failed to parse LLM response', raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Parse statement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
