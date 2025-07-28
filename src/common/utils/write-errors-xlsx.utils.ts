import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export function writeErrorsToXlsx<T extends Record<string, any>>(
  rowsWithErrors: { row: T; error: string }[],
  outputPath: string,
): void {
  const enriched = rowsWithErrors.map(({ row, error }) => ({
    ...row,
    error,
  }));

  const worksheet = XLSX.utils.json_to_sheet(enriched);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  XLSX.writeFile(workbook, outputPath);
}
