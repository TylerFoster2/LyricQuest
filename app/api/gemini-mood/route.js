import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { mood } = await request.json()

    if (!mood) {
      return NextResponse.json({ error: 'Mood required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found')
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    console.log('Getting song suggestions for mood:', mood)

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `List 20 popular songs that match this mood: ${mood}

Respond with ONLY this JSON format (no other text):
{"songs": [{"title": "Song Name", "artist": "Artist Name"}]}

Include diverse genres and eras.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    })

    const responseText = await response.text()
    console.log('Gemini HTTP status:', response.status)

    if (!response.ok) {
      console.error('Gemini API error:', response.status, responseText)
      return NextResponse.json({ 
        error: `Gemini API error: ${response.status}`,
        details: responseText
      }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text.trim()
        console.log('Raw AI response:', text.substring(0, 200))
        
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        
        try {
          const result = JSON.parse(cleanText)
          console.log('Successfully parsed! Songs count:', result.songs?.length)
          return NextResponse.json(result)
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message)
          return NextResponse.json({ 
            error: 'Failed to parse AI response',
            rawResponse: cleanText.substring(0, 500)
          }, { status: 500 })
        }
      } else {
        console.error('No content.parts. finishReason:', candidate.finishReason)
        return NextResponse.json({ 
          error: `Gemini stopped early: ${candidate.finishReason}`,
          details: 'Try again or the response was too long'
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 })
  } catch (error) {
    console.error('Gemini Mood API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to get mood suggestions',
      details: error.message 
    }, { status: 500 })
  }
}