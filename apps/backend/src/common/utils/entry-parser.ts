export type EntryType = 'DOCTOR_DIRECT' | 'NORMAL' | 'UNKNOWN';

export function parseEntryMessage(message: string) {
  if (!message) return { type: 'UNKNOWN' };

  // 🔥 simple + safe
  const cleaned = message.trim().toUpperCase();

  console.log('CLEANED:', cleaned);

  // 🔥 use includes instead of strict regex
  if (cleaned.includes('BOOK_DR_')) {
    const index = cleaned.indexOf('BOOK_DR_');
    const doctorId = cleaned.substring(index + 8).trim();

    return {
      type: 'DOCTOR_DIRECT',
      doctorId,
    };
  }

  return { type: 'NORMAL' };
}
