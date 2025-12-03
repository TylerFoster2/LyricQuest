'use client'

import { useState } from 'react'
import styles from './browse.module.css'

const MOODS = [
  { name: 'Happy', color: '#FFD700', bg: '#fdf3d2ff'},
  { name: 'Sad', color: '#ac67b5ff', bg: '#beacdeff'},
  { name: 'Energetic', color: '#FF4500', bg: '#FFE6E0'},
  { name: 'Chill', color: '#87CEEB', bg: '#F0F8FF'}
]

export default function MoodBrowse() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTrack, setSelectedTrack] = useState(null)

  const handleMoodSelect = async (mood) => {
    console.log('Selected mood:', mood.name)
    setSelectedMood(mood)
    setLoading(true)
    setError('')
    setTracks([])
    setSelectedTrack(null)

    try {
      console.log('Calling /api/gemini-mood...')
      
      const geminiResponse = await fetch('/api/gemini-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood.name })
      })

      console.log('Gemini response status:', geminiResponse.status)

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error('Gemini error:', errorText)
        throw new Error('Failed to get mood suggestions')
      }

      const geminiData = await geminiResponse.json()
      console.log('Gemini response:', geminiData)
      
      const songs = geminiData.songs
      
      if (!songs || songs.length === 0) {
        throw new Error('No songs returned from Gemini')
      }

      console.log(`Got ${songs.length} song suggestions from Gemini`)

      const allTracks = []
      for (const song of songs.slice(0, 10)) { s
        try {
          const searchQuery = `${song.title} ${song.artist}`
          console.log('Searching Deezer for:', searchQuery)
          
          const deezerResponse = await fetch(`/api/deezer?type=track&q=${encodeURIComponent(searchQuery)}`)
          const deezerData = await deezerResponse.json()
          
          if (deezerData.data && deezerData.data.length > 0) {
            allTracks.push(deezerData.data[0]) 
            console.log('Found track:', deezerData.data[0].title)
          }
        } catch (err) {
          console.error('Error fetching song:', song, err)
        }
      }

      console.log(`Found ${allTracks.length} tracks on Deezer`)
      setTracks(allTracks)
      
      if (allTracks.length === 0) {
        setError('Could not find songs for this mood. Try another!')
      }
    } catch (err) {
      console.error('Mood search error:', err)
      setError(`Error: ${err.message}`)
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
      setSelectedMood(null)
    }
  }

  return (
    <div className={styles.container}>
      <h1>Browse by Mood</h1>
      <p>Select a mood and discover songs that match your vibe!</p>

      {!selectedMood && !loading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          {MOODS.map((mood) => (
            <div
              key={mood.name}
              onClick={() => handleMoodSelect(mood)}
              style={{
                background: mood.bg,
                border: '3px solid #000',
                borderRadius: '15px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3 style={{ color: '#000', margin: '0 0 10px 0', fontSize: '24px' }}>
                {mood.name}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {mood.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '18px' }}>Finding {selectedMood?.name.toLowerCase()} songs...</p>
        </div>
      )}

      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>}

      {tracks.length > 0 && (
        <>
          <div style={{ 
            background: selectedMood?.bg, 
            borderLeft: `5px solid ${selectedMood?.color}`,
            padding: '15px 20px',
            marginBottom: '20px',
            marginTop: '20px',
            borderRadius: '8px'
          }}>
            <h2 style={{ margin: '0 0 5px 0', color: selectedMood?.color }}>
              {selectedMood?.name} Playlist
            </h2>
            <p style={{ margin: 0, color: '#666' }}>
              {tracks.length} songs to match your mood
            </p>
          </div>
          
          <button 
            onClick={handleBack} 
            style={{
              padding: '10px 20px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← {selectedTrack ? 'Back to Playlist' : 'Choose Another Mood'}
          </button>
        </>
      )}

      {!selectedTrack && tracks.length > 0 && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {tracks.map((track) => (
            <div 
              key={track.id} 
              onClick={() => handleTrackClick(track)}
              style={{
                display: 'flex',
                gap: '15px',
                padding: '15px',
                background: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {track.album?.cover_medium && (
                <img 
                  src={track.album.cover_medium} 
                  alt={track.title}
                  style={{ width: '80px', height: '80px', borderRadius: '8px' }}
                />
              )}
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{track.title}</h3>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}>{track.artist.name}</p>
                {track.album?.title && (
                  <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                    {track.album.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTrack && (
        <div style={{ 
          background: 'white', 
          borderRadius: '15px', 
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {selectedTrack.album?.cover_big && (
              <img 
                src={selectedTrack.album.cover_big} 
                alt={selectedTrack.title}
                style={{ width: '250px', height: '250px', borderRadius: '15px' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 10px 0' }}>{selectedTrack.title}</h2>
              <h3 style={{ margin: '0 0 20px 0', color: '#666' }}>{selectedTrack.artist.name}</h3>
              
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
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: selectedMood?.color || '#1db954',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  marginTop: '16px'
                }}
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