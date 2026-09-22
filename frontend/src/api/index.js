import axios from 'axios'
import class5 from '../data/class5.json'
import class6 from '../data/class6.json'
import class7 from '../data/class7.json'
import class8 from '../data/class8.json'
import class9 from '../data/class9.json'
import class10 from '../data/class10.json'
import class11 from '../data/class11.json'
import class12 from '../data/class12.json'

// ─── All class data ───────────────────────────────────────────────────────────
const CLASS_DATA = {
  5: class5, 6: class6, 7: class7, 8: class8,
  9: class9, 10: class10, 11: class11, 12: class12
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
})

// ─── Clean text ───────────────────────────────────────────────────────────────
const cleanText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[?.,!;:'"-]/g, '')
    .replace(/\s+/g, ' ')
}

// ─── Stop words ───────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "the", "are", "was", "were", "who", "how", "why", "when", "where",
  "which", "does", "did", "has", "have", "had", "can", "could", "would",
  "should", "will", "this", "that", "these", "those", "and", "but", "for",
  "with", "from", "into", "give", "tell", "also", "very", "just", "about"
])

// ─── Find best match ──────────────────────────────────────────────────────────
const findBestMatch = (question, classData) => {
  const cleaned = cleanText(question)
  const allWords = cleaned.split(' ').filter(w => w.length > 1)
  const keywords = allWords.filter(w => !STOP_WORDS.has(w))
  const searchWords = keywords.length > 0 ? keywords : allWords

  let bestMatch = null
  let highestScore = 0

  for (const subject in classData.subjects) {
    const questions = classData.subjects[subject]

    for (const item of questions) {
      const qCleaned = cleanText(item.question)
      const aCleaned = cleanText(item.answer)
      const tCleaned = cleanText(item.topic)
      let score = 0

      // Exact match
      if (qCleaned === cleaned) score += 100

      // One contains other
      if (qCleaned.includes(cleaned) || cleaned.includes(qCleaned)) score += 40

      // Keyword scoring
      searchWords.forEach(word => {
        if (qCleaned.includes(word)) score += 3
        if (tCleaned.includes(word)) score += 2
        if (aCleaned.includes(word)) score += 0.5
      })

      // Phrase bonus
      for (let i = 0; i < searchWords.length - 1; i++) {
        const phrase = searchWords[i] + ' ' + searchWords[i + 1]
        if (qCleaned.includes(phrase)) score += 5
      }

      if (score > highestScore) {
        highestScore = score
        bestMatch = { ...item, subject }
      }
    }
  }

  return highestScore >= 1.5 ? bestMatch : null
}

// ─── Online AI answer (needs internet) ───────────────────────────────────────
export const askOnline = (question, classNumber) =>
  API.post('/ai/ask', { question, classNumber })

// ─── Offline answer (NO internet needed) ─────────────────────────────────────
export const askOffline = (question, classNumber) => {
  const classNum = parseInt(classNumber) || 5
  const classData = CLASS_DATA[classNum]

  // Class data not found
  if (!classData) {
    return Promise.resolve({
      data: {
        success: false,
        source: 'offline',
        message: `No offline data found for Class ${classNum}.`,
      }
    })
  }

  const match = findBestMatch(question, classData)

  // No match found
  if (!match) {
    return Promise.resolve({
      data: {
        success: false,
        source: 'offline',
        message: 'No matching answer found in offline data. Please connect to internet for AI answer.',
      }
    })
  }

  // Match found ✅
  return Promise.resolve({
    data: {
      success: true,
      source: 'offline',
      answer: match.answer,
      topic: match.topic || '',
      subject: match.subject || '',
      class: classNum,
    }
  })
}

// ─── Other API calls (need internet) ─────────────────────────────────────────
export const getClasses = () =>
  API.get('/offline/classes')

export const checkDeepfake = (formData) =>
  API.post('/deepfake/check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getChatHistory = () =>
  API.get('/ai/history')

export const getDeepfakeHistory = () =>
  API.get('/deepfake/history')

export default API