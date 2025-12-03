'use client'

import { useState, useEffect } from 'react'
import styles from './search.module.css'

export default function GenreBrowse() {
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [artists, setArtists] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/deezer?type=genres')
        const data = await response.json()
        if (data.data) {
          // Filter out "All" genre (id: 0)
          const filteredGenres = data.data.filter(genre => genre.id !== "0")
          setGenres(filteredGenres)
        }
      } catch (err) {
        console.error('Error fetching genres:', err)
      }
    }
    fetchGenres()
  }, [])

  const handleGenreChange = async (e) => {
    const genreId = e.target.value
    setSelectedGenre(genreId)
    
    if (!genreId) return

    setArtists([])
    setSelectedArtist(null)
    setAlbums([])
    setSelectedAlbum(null)
    setTracks([])
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/deezer?type=genreArtists&genreId=${genreId}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.data && data.data.length > 0) {
        setArtists(data.data)
      } else {
        setError('No artists found for this genre')
      }
    } catch (err) {
      setError('Error loading artists. Please try again.')
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
    } else if (selectedGenre) {
      setSelectedGenre('')
      setArtists([])
    }
  }

  return (
    <div className={styles.container}>
      <h1>Browse by Genre</h1>
      <p>Explore songs from different genres</p>
      
      <div className={styles.searchBox}>
        <select 
          value={selectedGenre}
          onChange={handleGenreChange}
          className={styles.searchInput}
          disabled={loading}
        >
          <option value="">Select a genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {(selectedArtist || selectedAlbum || selectedGenre) && (
        <button onClick={handleBack} className={styles.backButton}>
          ← Back
        </button>
      )}

      {/* Artist Results */}
      {selectedGenre && !selectedArtist && artists.length > 0 && (
        <div className={styles.results}>
          <h2>Popular Artists:</h2>
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
                <p>
                  {artist.nb_album ? `${artist.nb_album} albums` : 'Albums available'}
                  {artist.nb_fan ? ` • ${artist.nb_fan.toLocaleString()} fans` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album Results */}
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

      {/* Track Results */}
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