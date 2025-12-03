'use client'

import { useState } from 'react'
import styles from './search.module.css'

export default function RandomSong() {
  const [track, setTrack] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRandomSong = async () => {
    setLoading(true)
    setError('')
    setTrack(null)

    try {
      console.log('Getting random song from Gemini...')
      
      const geminiResponse = await fetch('/api/gemini-random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!geminiResponse.ok) {
        throw new Error('Failed to get random song suggestion')
      }

      const { title, artist } = await geminiResponse.json()
      console.log('Gemini picked:', title, 'by', artist)

      const searchQuery = `${title} ${artist}`
      console.log('Searching Deezer for:', searchQuery)
      
      const deezerResponse = await fetch(`/api/deezer?type=track&q=${encodeURIComponent(searchQuery)}`)
      const deezerData = await deezerResponse.json()

      if (deezerData.data && deezerData.data.length > 0) {
        setTrack(deezerData.data[0])
        console.log('Found track:', deezerData.data[0].title)
      } else {
        setError('Could not find that song on Deezer. Try again!')
      }
    } catch (err) {
      console.error('Random song error:', err)
      setError('Error getting random song. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1>Random Song Discovery</h1>
      <p>Let AI surprise you with a random song recommendation!</p>

      <button 
        onClick={getRandomSong}
        disabled={loading}
        style={{
          padding: '15px 40px',
          fontSize: '18px',
          background: loading ? '#666' : '#000',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '30px',
          fontWeight: 'bold',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {loading ? 'Finding a song...' : 'Get Random'}
      </button>

      {error && <p className={styles.error} style={{ marginTop: '20px' }}>{error}</p>}

      {track && (
        <div className={styles.results} style={{ marginTop: '40px' }}>
          <div className={styles.songDetails}>
            {track.album?.cover_big && (
              <img 
                src={track.album.cover_big} 
                alt={track.title}
                className={styles.songArtLarge}
              />
            )}
            <div className={styles.songInfo}>
              <h2>{track.title}</h2>
              <h3>{track.artist.name}</h3>
              
              {track.album?.title && (
                <p><strong>Album:</strong> {track.album.title}</p>
              )}
              
              {track.release_date && (
                <p><strong>Released:</strong> {track.release_date}</p>
              )}

              <p><strong>Duration:</strong> {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>

              {track.preview && (
                <audio controls style={{ width: "100%", marginTop: "1rem", marginBottom: "1rem" }}>
                  <source src={track.preview} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}

              <a 
                href={track.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.playButton}
                style={{ marginTop: '16px', display: 'inline-block' }}
              >
                Play Full Song →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}