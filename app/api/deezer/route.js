import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const query = searchParams.get('q')
  const artistId = searchParams.get('artistId')
  const albumId = searchParams.get('albumId')
  const genreId = searchParams.get('genreId')

  try {
    let endpoint = ''

    // Search for artists or tracks
    if (query && type) {
      if (type === 'artist') {
        endpoint = `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}`
      } else if (type === 'track') {
        endpoint = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`
      }
    }
    // Get albums for an artist
    else if (artistId && type === 'albums') {
      endpoint = `https://api.deezer.com/artist/${artistId}/albums`
    }
    // Get tracks for an album
    else if (albumId && type === 'tracks') {
      endpoint = `https://api.deezer.com/album/${albumId}/tracks`
    }
    // Get all genres
    else if (type === 'genres') {
      endpoint = `https://api.deezer.com/genre`
    }
    // Get artists by genre
    else if (genreId && type === 'genreArtists') {
      endpoint = `https://api.deezer.com/genre/${genreId}/artists`
    }
    else {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const response = await fetch(endpoint)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Deezer API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}