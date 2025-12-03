'use client'

import { useState } from 'react'
import styles from './search.module.css'

export default function ArtistSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [artists, setArtists] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter an artist name')
      return
    }

    setLoading(true)
    setError('')
    setArtists([])
    setSelectedArtist(null)
    setAlbums([])
    setSelectedAlbum(null)
    setTracks([])

    try {
      const response = await fetch(`/api/deezer?type=artist&q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.data && data.data.length > 0) {
        setArtists(data.data)
      } else {
        setError('No artists found')
      }
    } catch (err) {
      setError('Error searching for artists. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleArtistClick = async (artist) => {
    setSelectedArtist(artist)
    setAlbums([])
    setSelectedAlbum(null)
    setTracks([])
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/deezer?type=albums&artistId=${artist.id}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.data && data.data.length > 0) {
        setAlbums(data.data)
      } else {
        setError('No albums found')
      }
    } catch (err) {
      setError('Error loading albums. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAlbumClick = async (album) => {
    setSelectedAlbum(album)
    setTracks([])
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/deezer?type=tracks&albumId=${album.id}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.data && data.data.length > 0) {
        setTracks(data.data)
      } else {
        setError('No tracks found')
      }
    } catch (err) {
      setError('Error loading tracks. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (selectedAlbum) {
      setSelectedAlbum(null)
      setTracks([])
    } else if (selectedArtist) {
      setSelectedArtist(null)
      setAlbums([])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }



  return (
    <div className={styles.container}>
      <h1>Search by Artist</h1>
      <p>Find songs by your favorite artists</p>
      
      <div className={styles.searchBox}>
        <input 
          type="text"
          placeholder="Enter artist name"
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

      {(selectedArtist || selectedAlbum) && (
        <button onClick={handleBack} className={styles.backButton}>
          ← Back
        </button>
      )}

      {!selectedArtist && artists.length > 0 && (
        <div className={styles.results}>
          <h2>Artists:</h2>
          {artists.map((artist) => (
            <div 
              key={artist.id} 
              className={styles.resultCard}
              onClick={() => handleArtistClick(artist)}
              style={{ cursor: 'pointer' }}
            >
              {artist.picture_medium && (
                <img 
                  src={artist.picture_medium} 
                  alt={artist.name}
                  className={styles.artistImage}
                />
              )}
              <div className={styles.artistInfo}>
                <h3>{artist.name}</h3>
                <p>{artist.nb_album} albums • {artist.nb_fan.toLocaleString()} fans</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedArtist && !selectedAlbum && albums.length > 0 && (
        <div className={styles.results}>
          <h2>{selectedArtist.name} - Albums:</h2>
          {albums.map((album) => (
            <div 
              key={album.id} 
              className={styles.resultCard}
              onClick={() => handleAlbumClick(album)}
              style={{ cursor: 'pointer' }}
            >
              {album.cover_medium && (
                <img 
                  src={album.cover_medium} 
                  alt={album.title}
                  className={styles.albumImage}
                />
              )}
              <div className={styles.artistInfo}>
                <h3>{album.title}</h3>
                <p>{album.release_date} • {album.nb_tracks} tracks</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAlbum && tracks.length > 0 && (
        <div className={styles.results}>
          <h2>{selectedAlbum.title} - Tracks:</h2>
          {tracks.map((track, index) => (
            <div key={track.id} className={styles.trackCard}>
              <span className={styles.trackNumber}>{index + 1}</span>
              <div className={styles.trackInfo}>
                <h3>{track.title}</h3>
                <p>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>
                {track.preview && (
                  <audio controls style={{ width: "100%", marginTop: "0.5rem" }}>
                    <source src={track.preview} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
              <a 
                href={track.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.playButton}
                onClick={(e) => e.stopPropagation()}
              >
                Full Song →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}