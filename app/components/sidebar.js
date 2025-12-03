'use client'

import { useState } from 'react'
import styles from './sidebar.module.css'

export default function Sidebar({ onViewChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeView, setActiveView] = useState('lyrics')

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleViewChange = (view) => {
    setActiveView(view)
    onViewChange(view)
    setIsOpen(false)
  }

  return (
    <>
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <h2>LyricQuest</h2>

          <nav className={styles.nav}>
            <button 
              className={`${styles.navButton} ${activeView === 'lyrics' ? styles.active : ''}`}
              onClick={() => handleViewChange('lyrics')}
            >
              Lyrics
            </button>

            <button 
              className={`${styles.navButton} ${activeView === 'artist' ? styles.active : ''}`}
              onClick={() => handleViewChange('artist')}
            >
              Artist
            </button>

            <button 
              className={`${styles.navButton} ${activeView === 'genre' ? styles.active : ''}`}
              onClick={() => handleViewChange('genre')}
            >
              Genre
            </button>

            <button 
              className={`${styles.navButton} ${activeView === 'mood' ? styles.active : ''}`}
              onClick={() => handleViewChange('mood')}
            >
              Mood
            </button>

            <button 
              className={`${styles.navButton} ${activeView === 'random' ? styles.active : ''}`}
              onClick={() => handleViewChange('random')}
            >
              Random
            </button>
          </nav>
        </div>
      </div>

      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}
    </>
  )
}