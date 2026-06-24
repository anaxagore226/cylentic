/** Code examen XXXX-XXXX */
const SAFE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateExamAccessCode(): string {
  const part = () => Array.from({ length: 4 }, () => SAFE[Math.floor(Math.random() * SAFE.length)]).join("");
  return `${part()}-${part()}`;
}

