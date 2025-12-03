'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Sidebar from './components/sidebar'
import LyricsSearch from './components/lyrics_search'
import ArtistSearch from './components/artist_search'
import GenreBrowse from './components/genre_browse'
import MoodBrowse from './components/mood_browse'
import RandomSong from './components/random_song'

export default function Home() {
  const [currentView, setCurrentView] = useState('lyrics')

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  return (
    <div className={styles.page}>
      <Sidebar onViewChange={handleViewChange} />
      
      <main className={styles.main}>
        {currentView === 'lyrics' && <LyricsSearch />}
        {currentView === 'artist' && <ArtistSearch />}
        {currentView === 'genre' && <GenreBrowse />}
        {currentView === 'mood' && <MoodBrowse />}
        {currentView === 'random' && <RandomSong />}
      </main>
    </div>
  )
}