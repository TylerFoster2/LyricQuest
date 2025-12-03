import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { lyrics } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: 'Lyrics required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment')
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    console.log('Calling Gemini API...')

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful music search assistant. The user is searching for a song.

User input: "${lyrics}"

Your job:
1. If it looks like a song title or artist name, just return it as-is
2. If it looks like lyrics, identify the song
3. If it's vague or partial, make your best guess
4. Consider all genres, eras, and languages
5. It's okay to guess - we'll show multiple results

Examples:
- Input: "Bohemian Rhapsody" → {"title": "Bohemian Rhapsody", "artist": "Queen"}
- Input: "Taylor Swift Shake it Off" → {"title": "Shake It Off", "artist": "Taylor Swift"}
- Input: "never gonna give you up" → {"title": "Never Gonna Give You Up", "artist": "Rick Astley"}

Respond ONLY with valid JSON (no markdown, no extra text):
{"title": "Song Title", "artist": "Artist Name"}

If you absolutely cannot determine anything, respond with:
{"title": "Unknown", "artist": "Unknown"}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 200,
        }
      })
    })

    const responseText = await response.text()
    console.log('Gemini response status:', response.status)

    if (!response.ok) {
      console.error('Gemini API error:', response.status, responseText)
      return NextResponse.json({ 
        error: `Gemini API error: ${response.status}`,
        details: responseText
      }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    console.log('Full response:', JSON.stringify(data, null, 2))
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text.trim()
        console.log('Raw AI response:', text)
        
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        
        try {
          const result = JSON.parse(cleanText)
          console.log('Parsed result:', result)
          return NextResponse.json(result)
        } catch (parseError) {
          console.error('Failed to parse Gemini response:', cleanText)
          return NextResponse.json({ 
            error: 'Failed to parse AI response',
            rawResponse: cleanText
          }, { status: 500 })
        }
      }
    }
    
    console.error('Unexpected response structure:', data)
    return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 })
  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to identify song',
      details: error.message 
    }, { status: 500 })
  }
}