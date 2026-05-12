import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_DIR = path.join(__dirname, '..', 'mock-data');

export function readJson<T>(relativePath: string): T {
  const filePath = path.join(MOCK_DIR, relativePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeJson<T>(relativePath: string, data: T): void {
  const filePath = path.join(MOCK_DIR, relativePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function getNextId<T extends { id: number }>(items: T[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}
