import * as XLSX from 'xlsx';

export function parseXlsx<T = any>(buffer: Buffer): T[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<T>(worksheet, { defval: '' });
}
