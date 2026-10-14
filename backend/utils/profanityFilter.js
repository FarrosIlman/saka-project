/**
 * Profanity / Badword Filter Utility
 * Mendeteksi kata-kata kasar / tidak pantas (Bahasa Indonesia, Jawa, dan Inggris)
 */

const BAD_WORDS = [
  // Bahasa Indonesia kasar / umpatan
  'anjing', 'anjir', 'anjay', 'anjim', 'anjrit',
  'babi', 'kunyuk', 'monyet',
  'bangsat', 'bajingan', 'kampret', 'brengsek',
  'kontol', 'memek', 'itil', 'pantek', 'jembut', 'peler', 'pepek', 'titit',
  'ngentot', 'ngewe', 'kentot', 'ewe',
  'goblok', 'tolol', 'bego', 'idiot', 'bolot', 'bebal', 'dongok',
  'setan', 'iblis', 'dajjal',
  'tai', 'taek', 'berak',
  'pecun', 'lonte', 'pelacur', 'perek', 'jablay', 'sundal',
  'sange', 'coli', 'coly', 'bokep',

  // Bahasa Jawa kasar
  'asu', 'bajindul', 'matamu', 'ndasmu', 'ndas', 'picek',
  'cok', 'jancuk', 'jancok', 'dancok', 'raimu', 'suu',

  // Bahasa Inggris kasar
  'fuck', 'fck', 'shit', 'bitch', 'bastard', 'asshole',
  'dick', 'pussy', 'cunt', 'motherfucker', 'whore', 'slut'
];

/**
 * Normalisasi teks untuk mendeteksi karakter yang disamarkan (leetspeak & repeated chars)
 * Contoh: "b0l0t" -> "bolot", "anjiiiing" -> "anjing"
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    // Penggantian angka/simbol mirip huruf (leetspeak sederhana)
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    // Kompres huruf berulang lebih dari 2 kali: "anjinggggg" -> "anjing"
    .replace(/(.)\1{2,}/g, '$1$1');
}

/**
 * Cek apakah teks mengandung kata kasar
 * @param {string} text - Teks yang akan dicek
 * @returns {boolean} - true jika mengandung kata kasar
 */
function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;

  const normalized = normalizeText(text);

  // Pisahkan ke dalam token kata
  const words = normalized.split(/[\s,._\-!?@#$%^&*()+=/\\|~`{}[\];:"'<>]+/);

  for (const word of words) {
    if (!word) continue;
    // Cek kecocokan kata
    for (const bad of BAD_WORDS) {
      if (word === bad) {
        return true;
      }
    }
  }

  // Regex boundary check untuk mendeteksi variasi kata kasar majemuk
  for (const bad of BAD_WORDS) {
    const escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
    if (regex.test(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Mendapatkan daftar kata kasar yang terdeteksi dalam teks
 * @param {string} text 
 * @returns {string[]}
 */
function getDetectedBadWords(text) {
  if (!text || typeof text !== 'string') return [];
  const normalized = normalizeText(text);
  const detected = new Set();

  for (const bad of BAD_WORDS) {
    const escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
    if (regex.test(normalized)) {
      detected.add(bad);
    }
  }

  return Array.from(detected);
}

module.exports = {
  BAD_WORDS,
  containsProfanity,
  getDetectedBadWords,
  normalizeText,
};
