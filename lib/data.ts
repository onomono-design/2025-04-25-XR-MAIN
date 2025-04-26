export interface Chapter {
  id: string
  number: number
  title: string
  duration: string
  audioUrl: string
  coverUrl?: string // Optional chapter-specific cover
  lengthInSeconds: number // Actual duration in seconds for the audio file
}

export interface Audiobook {
  id: string
  title: string
  author: string
  narrator: string
  coverUrl: string
  audioUrl: string // Main audiobook URL (for backward compatibility)
  length: string
  progress: number
  currentChapter: number
  totalChapters: number
  rating: number
  genre: string
  description: string
  chapters: Chapter[] // Array of individual chapter data
}

// Sample audio files from public domain sources
const sampleAudioUrls = [
  "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
  "https://commondatastorage.googleapis.com/codeskulptor-assets/Evillaugh.ogg",
  "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
  "https://commondatastorage.googleapis.com/codeskulptor-assets/Collision8-Bit.ogg",
  "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3",
]

// Generate chapters for each audiobook
function generateChapters(bookId: string, totalChapters: number): Chapter[] {
  return Array.from({ length: totalChapters }, (_, i) => {
    const chapterNumber = i + 1
    // Use modulo to cycle through sample audio URLs
    const audioUrl = sampleAudioUrls[i % sampleAudioUrls.length]

    // Generate random length between 15-45 minutes
    const lengthInMinutes = Math.floor(Math.random() * 30) + 15
    const lengthInSeconds = lengthInMinutes * 60

    return {
      id: `${bookId}-chapter-${chapterNumber}`,
      number: chapterNumber,
      title: `Chapter ${chapterNumber}: ${getChapterTitle(chapterNumber)}`,
      duration: `${lengthInMinutes} min`,
      audioUrl,
      lengthInSeconds,
    }
  })
}

// Generate some sample chapter titles
function getChapterTitle(chapterNumber: number): string {
  const titles = [
    "The Beginning",
    "A New Discovery",
    "Unexpected Turns",
    "The Journey Continues",
    "Revelations",
    "Hidden Truths",
    "The Confrontation",
    "Mysteries Unveiled",
    "The Decision",
    "Final Destination",
  ]

  return titles[chapterNumber % titles.length]
}

export const audiobooks: Audiobook[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    narrator: "Carey Mulligan",
    coverUrl: "/celestial-library.png",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    length: "8h 49m",
    progress: 65,
    currentChapter: 1,
    totalChapters: 12,
    rating: 4.5,
    genre: "Fiction",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    chapters: [], // Will be populated below
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    narrator: "James Clear",
    coverUrl: "/atomic-symbol-book.png",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    length: "5h 35m",
    progress: 30,
    currentChapter: 1,
    totalChapters: 8,
    rating: 4.8,
    genre: "Self-Help",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    chapters: [], // Will be populated below
  },
  {
    id: "3",
    title: "Project Hail Mary",
    author: "Andy Weir",
    narrator: "Ray Porter",
    coverUrl: "/nebula-explorer.png",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    length: "16h 10m",
    progress: 10,
    currentChapter: 1,
    totalChapters: 10,
    rating: 4.7,
    genre: "Science Fiction",
    description:
      "A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the #1 New York Times bestselling author of The Martian.",
    chapters: [], // Will be populated below
  },
  {
    id: "4",
    title: "Dune",
    author: "Frank Herbert",
    narrator: "Scott Brick",
    coverUrl: "/Shifting Sands Leviathan.png",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    length: "21h 2m",
    progress: 5,
    currentChapter: 1,
    totalChapters: 15,
    rating: 4.6,
    genre: "Science Fiction",
    description:
      'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    chapters: [], // Will be populated below
  },
  {
    id: "5",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    narrator: "Chris Hill",
    coverUrl: "/wealth-of-mind.png",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    length: "5h 48m",
    progress: 0,
    currentChapter: 1,
    totalChapters: 6,
    rating: 4.7,
    genre: "Finance",
    description:
      "Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people.",
    chapters: [], // Will be populated below
  },
  {
    id: "6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    narrator: "Andy Serkis",
    coverUrl: "/mountain-dragon-book.png",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    length: "10h 25m",
    progress: 0,
    currentChapter: 1,
    totalChapters: 9,
    rating: 4.8,
    genre: "Fantasy",
    description:
      "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep.",
    chapters: [], // Will be populated below
  },
]

// Populate chapters for each audiobook
audiobooks.forEach((book) => {
  book.chapters = generateChapters(book.id, book.totalChapters)
})
