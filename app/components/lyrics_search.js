'use client'

import { useState } from 'react'
import styles from './search.module.css'

export default function LyricsSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tracks, setTracks] = useState([])
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter some lyrics')
      return
    }

    setLoading(true)
    setError('')
    setTracks([])
    setSelectedTrack(null)
    setAiSuggestion(null)

    try {
      const aiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: searchQuery })
      })
      
      if (!aiResponse.ok) {
        setError('Error identifying song. Please try again.')
        setLoading(false)
        return
      }

      const aiData = await aiResponse.json()
      
      if (aiData.error) {
        setError(aiData.error)
        setLoading(false)
        return
      }
      
      if (aiData.title && aiData.title !== 'Unknown') {
        setAiSuggestion(aiData)
        
        const searchTerm = `${aiData.title} ${aiData.artist}`
        const deezerResponse = await fetch(`/api/deezer?type=track&q=${encodeURIComponent(searchTerm)}`)
        const deezerData = await deezerResponse.json()

        if (deezerData.data && deezerData.data.length > 0) {
          setTracks(deezerData.data)
        } else {
          setError('AI identified the song but couldn\'t find it on Deezer. Try different lyrics.')
        }
      } else {
        setError('Could not identify the song from those lyrics. Try entering more specific lyrics.')
      }
    } catch (err) {
      setError('Error searching. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackClick = (track) => {
    setSelectedTrack(track)
  }

  const handleBack = () => {
    if (selectedTrack) {
      setSelectedTrack(null)
    } else {
      setTracks([])
      setAiSuggestion(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={styles.container}>
      <h1>Search by Lyrics</h1>
      <p>Enter a line or phrase from a song, AI will help identify it!</p>
      
      <div className={styles.searchBox}>
        <input 
          type="text"
          placeholder="Enter lyrics"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.searchInput}
          disabled={loading}
        />
        <button 
          onClick={handleSearch} 
          className={styles.searchButton}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {aiSuggestion && (
        <div className={styles.aiSuggestion}>
          <p>AI identified: <strong>{aiSuggestion.title}</strong> by <strong>{aiSuggestion.artist}</strong></p>
        </div>
      )}

      {(tracks.length > 0 || selectedTrack) && (
        <button onClick={handleBack} className={styles.backButton}>
          ← Back
        </button>
      )}

      {!selectedTrack && tracks.length > 0 && (
        <div className={styles.results}>
          <h2>Matching Songs:</h2>
          {tracks.map((track) => (
            <div 
              key={track.id} 
              className={styles.resultCard}
              onClick={() => handleTrackClick(track)}
              style={{ cursor: 'pointer' }}
            >
              {track.album?.cover_medium && (
                <img 
                  src={track.album.cover_medium} 
                  alt={track.title}
                  className={styles.albumImage}
                />
              )}
              <div className={styles.artistInfo}>
                <h3>{track.title}</h3>
                <p>{track.artist.name}</p>
                {track.album?.title && (
                  <p style={{ fontSize: '14px', color: '#999' }}>
                    {track.album.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTrack && (
        <div className={styles.results}>
          <div className={styles.songDetails}>
            {selectedTrack.album?.cover_big && (
              <img 
                src={selectedTrack.album.cover_big} 
                alt={selectedTrack.title}
                className={styles.songArtLarge}
              />
            )}
            <div className={styles.songInfo}>
              <h2>{selectedTrack.title}</h2>
              <h3>{selectedTrack.artist.name}</h3>
              
              {selectedTrack.album?.title && (
                <p><strong>Album:</strong> {selectedTrack.album.title}</p>
              )}
              
              {selectedTrack.release_date && (
                <p><strong>Released:</strong> {selectedTrack.release_date}</p>
              )}

              <p><strong>Duration:</strong> {Math.floor(selectedTrack.duration / 60)}:{String(selectedTrack.duration % 60).padStart(2, '0')}</p>

              {selectedTrack.preview && (
                <audio controls style={{ width: "100%", marginTop: "1rem", marginBottom: "1rem" }}>
                  <source src={selectedTrack.preview} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}

              <a 
                href={selectedTrack.link} 
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