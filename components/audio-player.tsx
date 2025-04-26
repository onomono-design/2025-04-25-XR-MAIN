"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import type { Audiobook, Chapter } from "@/lib/data"
import { formatTime } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface AudioPlayerProps {
  defaultBook: Audiobook
}

export function AudioPlayer({ defaultBook }: AudioPlayerProps) {
  const [currentBook, setCurrentBook] = useState<Audiobook>(defaultBook)
  const [currentChapter, setCurrentChapter] = useState<Chapter>(defaultBook.chapters[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [xrModeActive, setXrModeActive] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    // Listen for custom events from the playlist component
    const handleBookChange = (event: CustomEvent) => {
      const newBook = event.detail.book
      setCurrentBook(newBook)

      // Set the first chapter of the new book
      if (newBook.chapters && newBook.chapters.length > 0) {
        setCurrentChapter(newBook.chapters[0])
      }

      setIsPlaying(true)
    }

    const handleChapterChange = (event: CustomEvent) => {
      if (event.detail.chapter) {
        // Direct chapter object provided
        setCurrentChapter(event.detail.chapter)

        // Update book if provided
        if (event.detail.book) {
          setCurrentBook(event.detail.book)
        }

        // Reset XR mode when changing chapters
        setXrModeActive(false)

        setIsPlaying(true)
      } else if (event.detail.chapterNumber && event.detail.book) {
        // Chapter number and book provided
        const book = event.detail.book
        const chapterNumber = event.detail.chapterNumber
        const chapter = book.chapters.find((c) => c.number === chapterNumber)

        if (chapter) {
          setCurrentChapter(chapter)
          setCurrentBook(book)
          // Reset XR mode when changing chapters
          setXrModeActive(false)
          setIsPlaying(true)
        }
      }
    }

    window.addEventListener("book-selected" as any, handleBookChange as EventListener)
    window.addEventListener("chapter-selected" as any, handleChapterChange as EventListener)

    return () => {
      window.removeEventListener("book-selected" as any, handleBookChange as EventListener)
      window.removeEventListener("chapter-selected" as any, handleChapterChange as EventListener)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Playback failed:", error)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentChapter])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.playbackRate = playbackRate
    }
  }, [volume, isMuted, playbackRate])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      // Set the duration from the audio element
      const audioDuration = audioRef.current.duration
      setDuration(isFinite(audioDuration) ? audioDuration : 0)
      console.log("Audio duration loaded:", audioDuration)
    }
  }

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleXrMode = () => {
    setXrModeActive(!xrModeActive)
  }

  const recenterCamera = () => {
    // Placeholder for future functionality
    console.log("Recenter camera clicked - functionality to be implemented")
  }

  const playNextChapter = () => {
    const currentIndex = currentBook.chapters.findIndex((c) => c.id === currentChapter.id)
    if (currentIndex === -1) return

    // Calculate the next chapter index
    const nextIndex = (currentIndex + 1) % currentBook.chapters.length
    const nextChapter = currentBook.chapters[nextIndex]

    // Reset XR mode when changing chapters
    setXrModeActive(false)

    // Update the current chapter
    setCurrentChapter(nextChapter)

    // Update the book's current chapter
    const updatedBook = {
      ...currentBook,
      currentChapter: nextChapter.number,
    }
    setCurrentBook(updatedBook)

    // Reset playback position
    setCurrentTime(0)

    // Keep playing
    setIsPlaying(true)

    // Notify the playlist component about the chapter change
    const event = new CustomEvent("chapter-selected", {
      detail: {
        book: updatedBook,
        chapter: nextChapter,
        chapterNumber: nextChapter.number,
      },
    })
    window.dispatchEvent(event)

    console.log(`Playing next chapter: ${nextChapter.title}`)
  }

  const playPreviousChapter = () => {
    const currentIndex = currentBook.chapters.findIndex((c) => c.id === currentChapter.id)
    if (currentIndex === -1) return

    // Reset XR mode when changing chapters
    setXrModeActive(false)

    // Calculate the previous chapter index
    const prevIndex = (currentIndex - 1 + currentBook.chapters.length) % currentBook.chapters.length
    const prevChapter = currentBook.chapters[prevIndex]

    // Update the current chapter
    setCurrentChapter(prevChapter)

    // Update the book's current chapter
    const updatedBook = {
      ...currentBook,
      currentChapter: prevChapter.number,
    }
    setCurrentBook(updatedBook)

    // Reset playback position
    setCurrentTime(0)

    // Start playing
    setIsPlaying(true)

    // Notify the playlist component about the chapter change
    const event = new CustomEvent("chapter-selected", {
      detail: {
        book: updatedBook,
        chapter: prevChapter,
        chapterNumber: prevChapter.number,
      },
    })
    window.dispatchEvent(event)

    console.log(`Playing previous chapter: ${prevChapter.title}`)
  }

  const changePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    setPlaybackRate(rates[nextIndex])
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleEnded = () => {
        // When track ends, play the next chapter
        // This will also reset XR mode via playNextChapter
        playNextChapter()
      }

      audio.addEventListener("ended", handleEnded)
      return () => {
        audio.removeEventListener("ended", handleEnded)
      }
    }
  }, [currentChapter, currentBook]) // Re-attach listener when chapter or book changes

  useEffect(() => {
    // Reset duration and current time when changing chapters
    setDuration(0)
    setCurrentTime(0)

    // If audio is already loaded, get its duration
    if (audioRef.current && audioRef.current.readyState > 0) {
      const audioDuration = audioRef.current.duration
      setDuration(isFinite(audioDuration) ? audioDuration : 0)
      console.log("Setting duration from loaded audio:", audioDuration)
    }
  }, [currentChapter])

  // Get the cover image to display (use chapter-specific cover if available, otherwise book cover)
  const coverToDisplay = currentChapter.coverUrl || currentBook.coverUrl

  return (
    <div className="flex flex-col w-full md:w-3/5 lg:w-2/3 p-4 md:p-8 bg-slate-900 relative">
      <audio
        ref={audioRef}
        src={currentChapter.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {}} // Handled by the useEffect
      />

      {/* XR Mode Overlay */}
      {xrModeActive && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Exit button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleXrMode}
            className="absolute top-4 right-4 text-white border-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Recenter camera button */}
          <Button
            variant="outline"
            onClick={recenterCamera}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white border-white hover:bg-white/10 transition-colors duration-200"
          >
            recenter camera
          </Button>

          {/* Controls pinned to bottom */}
          <div className="flex items-center justify-center gap-8 mt-auto mb-12 w-full">
            <Button variant="ghost" size="icon" onClick={playPreviousChapter} className="text-white">
              <SkipBack className="h-8 w-8" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full h-20 w-20"
            >
              {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={playNextChapter} className="text-white">
              <SkipForward className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-full max-w-md aspect-square mb-6 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={coverToDisplay || "/placeholder.svg"}
            alt={currentBook.title}
            fill
            className="object-cover"
            priority
          />

          {/* XR Button positioned inside album artwork */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleXrMode}
            className="absolute bottom-3 right-3 text-amber-400 border-amber-400 bg-black/50 hover:bg-black/70 z-10"
          >
            XR
          </Button>
        </div>

        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-1">{currentBook.title}</h1>
          <p className="text-md text-amber-400 mb-4">{currentChapter.title}</p>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "Loading..."}</span>
        </div>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleProgressChange}
          className="mb-6"
        />

        <div className="flex items-center justify-between gap-2 md:gap-4 w-full">
          {/* Volume control on far left */}
          <Button variant="ghost" size="icon" onClick={toggleMute} className="text-slate-200">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          {/* Spacer to push controls to center */}
          <div className="flex-grow"></div>

          {/* Previous button */}
          <Button variant="ghost" size="icon" onClick={playPreviousChapter} className="text-slate-200">
            <SkipBack className="h-5 w-5" />
          </Button>

          {/* Play/Pause button (centered) */}
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full h-14 w-14"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>

          {/* Next button */}
          <Button variant="ghost" size="icon" onClick={playNextChapter} className="text-slate-200">
            <SkipForward className="h-5 w-5" />
          </Button>

          {/* Spacer to balance layout */}
          <div className="flex-grow"></div>

          {/* Playback rate moved to right side */}
          <Button
            variant="outline"
            size="sm"
            onClick={changePlaybackRate}
            className="text-xs font-mono text-slate-200 border-slate-700"
          >
            {playbackRate}x
          </Button>
        </div>
      </div>
    </div>
  )
}
