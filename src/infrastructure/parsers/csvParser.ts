import Papa from 'papaparse';
import { CreateTransactionInput } from '@/domain/entities';
import { TransactionType, StatementSource } from '@/domain/enums';

export interface CsvColumnMapping {
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  typeColumn?: string; // optional — if not provided, negative = expense
  referenceColumn?: string;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  referenceId: string;
  rawRow: Record<string, string>;
}

export interface CsvParseResult {
  transactions: ParsedTransaction[];
  headers: string[];
  totalRows: number;
  skippedRows: number;
  errors: string[];
}

/**
 * Parse a CSV file and extract transaction data.
 * Returns parsed transactions with auto-detected types based on amount sign.
 */
export function parseCsvFile(
  fileContent: string,
  mapping: CsvColumnMapping
): CsvParseResult {
  const errors: string[] = [];
  let skippedRows = 0;

  const result = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    result.errors.forEach((err) => {
      errors.push(`Row ${err.row}: ${err.message}`);
    });
  }

  const headers = result.meta.fields || [];
  const transactions: ParsedTransaction[] = [];

  result.data.forEach((row, index) => {
    try {
      const dateStr = row[mapping.dateColumn]?.trim();
      const description = row[mapping.descriptionColumn]?.trim();
      const amountStr = row[mapping.amountColumn]?.trim();

      if (!dateStr || !amountStr) {
        skippedRows++;
        return;
      }

      const rawAmount = parseFloat(amountStr.replace(/[,]/g, ''));

      if (isNaN(rawAmount) || rawAmount === 0) {
        skippedRows++;
        return;
      }

      // Determine transaction type
      let type: TransactionType;
      if (mapping.typeColumn && row[mapping.typeColumn]) {
        const typeVal = row[mapping.typeColumn].toLowerCase().trim();
        type =
          typeVal === 'income' || typeVal === 'credit' || typeVal === 'cr'
            ? TransactionType.INCOME
            : TransactionType.EXPENSE;
      } else {
        // Negative amounts = expense, positive = income
        type = rawAmount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME;
      }

      const amount = Math.abs(rawAmount);

      // Generate reference ID for deduplication
      const referenceId = mapping.referenceColumn
        ? row[mapping.referenceColumn]?.trim() || `csv-${dateStr}-${index}`
        : `csv-${dateStr}-${amount}-${index}`;

      // Parse date to ISO format
      const parsedDate = parseDate(dateStr);

      transactions.push({
        date: parsedDate,
        description: description || 'CSV Import',
        amount,
        type,
        referenceId,
        rawRow: row,
      });
    } catch {
      errors.push(`Row ${index + 1}: Failed to parse row`);
      skippedRows++;
    }
  });

  return {
    transactions,
    headers,
    totalRows: result.data.length,
    skippedRows,
    errors,
  };
}

/**
 * Convert ParsedTransactions to CreateTransactionInput array for bulk insert.
 */
export function toTransactionInputs(
  parsed: ParsedTransaction[],
  accountId: string
): CreateTransactionInput[] {
  return parsed.map((t) => ({
    accountId,
    type: t.type,
    amount: t.amount,
    description: t.description,
    transactionDate: t.date,
    source: StatementSource.CSV_IMPORT,
    referenceId: t.referenceId,
  }));
}

/**
 * Try to parse various date formats to YYYY-MM-DD.
 */
function parseDate(dateStr: string): string {
  // Try common formats


  // YYYY-MM-DD format
  const isoMatch = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  // DD/MM/YYYY format (common in Thai banks)
  const ddmmMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmMatch) {
    return `${ddmmMatch[3]}-${ddmmMatch[2].padStart(2, '0')}-${ddmmMatch[1].padStart(2, '0')}`;
  }

  // Fallback: try JS Date parser
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Last resort: return as-is
  return dateStr;
}
