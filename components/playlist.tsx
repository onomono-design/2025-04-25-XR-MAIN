"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Audiobook, Chapter } from "@/lib/data"
import { cn, formatTime } from "@/lib/utils"

interface PlaylistProps {
  audiobooks: Audiobook[]
}

export function Playlist({ audiobooks }: PlaylistProps) {
  const [selectedBookId, setSelectedBookId] = useState(audiobooks[0].id)
  const [selectedChapterId, setSelectedChapterId] = useState(audiobooks[0].chapters[0].id)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({})

  // Get the currently selected book
  const currentBook = audiobooks.find((book) => book.id === selectedBookId) || audiobooks[0]

  // Get chapters from the current book
  const chapters = currentBook.chapters

  // Listen for chapter change events from the audio player
  useEffect(() => {
    const handleChapterChange = (event: CustomEvent) => {
      if (event.detail.chapter) {
        setSelectedChapterId(event.detail.chapter.id)
      } else if (event.detail.chapterNumber && event.detail.book) {
        const book = event.detail.book
        const chapterNumber = event.detail.chapterNumber
        const chapter = book.chapters.find((c) => c.number === chapterNumber)

        if (chapter) {
          setSelectedChapterId(chapter.id)
          setSelectedBookId(book.id)
        }
      }
    }

    window.addEventListener("chapter-selected" as any, handleChapterChange as EventListener)

    return () => {
      window.removeEventListener("chapter-selected" as any, handleChapterChange as EventListener)
    }
  }, [])

  // Load actual audio durations
  useEffect(() => {
    const loadAudioDurations = async () => {
      const newDurations: Record<string, number> = {}
      let hasNewDurations = false

      // Process chapters to avoid too many simultaneous audio loads
      for (const chapter of chapters) {
        // Only load durations for chapters we haven't loaded yet
        if (!audioDurations[chapter.id]) {
          const audio = new Audio()

          // Create a promise to get the duration once loaded
          const durationPromise = new Promise<number>((resolve) => {
            audio.addEventListener("loadedmetadata", () => {
              if (audio.duration && isFinite(audio.duration)) {
                resolve(audio.duration)
              } else {
                resolve(0) // Fallback if duration can't be determined
              }
            })

            // Handle load errors
            audio.addEventListener("error", () => {
              console.error(`Error loading audio for chapter ${chapter.id}`)
              resolve(0)
            })
          })

          // Set the source to trigger loading
          audio.src = chapter.audioUrl
          audio.preload = "metadata"

          // Wait for duration to be available
          try {
            const duration = await durationPromise
            newDurations[chapter.id] = duration
            hasNewDurations = true
          } catch (error) {
            console.error(`Failed to load duration for chapter ${chapter.id}:`, error)
          }
        }
      }

      // Only update state if we have new durations to add
      if (hasNewDurations) {
        setAudioDurations((prev) => ({ ...prev, ...newDurations }))
      }
    }

    loadAudioDurations()
  }, [chapters])

  const handleBookSelect = (book: Audiobook) => {
    setSelectedBookId(book.id)

    // Select the first chapter of the book
    if (book.chapters && book.chapters.length > 0) {
      setSelectedChapterId(book.chapters[0].id)
    }

    // Dispatch a custom event to notify the audio player
    const event = new CustomEvent("book-selected", { detail: { book } })
    window.dispatchEvent(event)
  }

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapterId(chapter.id)

    // Dispatch a custom event to notify the audio player
    const event = new CustomEvent("chapter-selected", {
      detail: {
        book: currentBook,
        chapter: chapter,
        chapterNumber: chapter.number,
      },
    })
    window.dispatchEvent(event)
  }

  return (
    <div
      className={cn("w-full md:w-2/5 lg:w-1/3 bg-slate-800 transition-all duration-300", isCollapsed && "md:w-[80px]")}
    >
      <div className="p-4 flex items-center justify-between">
        <h2
          className={cn("text-xl font-bold text-white transition-opacity duration-300", isCollapsed && "md:opacity-0")}
        >
          Chapters
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex text-white"
        >
          <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      <ScrollArea className={cn("h-[calc(100vh-120px)]", isCollapsed ? "hidden md:block" : "")}>
        {isCollapsed ? (
          <div className="py-4 space-y-4">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterSelect(chapter)}
                className={cn("w-full flex justify-center p-2", selectedChapterId === chapter.id && "bg-slate-700")}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-white">
                  {chapter.number}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-2">
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <button
                  onClick={() => handleChapterSelect(chapter)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-colors",
                    selectedChapterId === chapter.id ? "bg-amber-900/30" : "hover:bg-slate-700",
                  )}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-white flex-shrink-0">
                    {chapter.number}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-medium text-white truncate">{chapter.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {audioDurations[chapter.id] ? formatTime(audioDurations[chapter.id]) : chapter.duration}
                      </span>
                    </div>
                  </div>
                </button>
                <Separator className="my-2 bg-slate-700" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
