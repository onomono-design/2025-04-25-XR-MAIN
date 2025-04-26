import { AudioPlayer } from "@/components/audio-player"
import { Playlist } from "@/components/playlist"
import { audiobooks } from "@/lib/data"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <main className="flex flex-1 flex-col md:flex-row">
        <AudioPlayer defaultBook={audiobooks[0]} />
        <Playlist audiobooks={audiobooks} />
      </main>
    </div>
  )
}
