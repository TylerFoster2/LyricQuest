import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found')
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    console.log('Getting random song suggestion...')

    // Create a unique seed
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 999999)}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${uniqueId}: Random song, any genre/era. JSON: {"title":"x","artist":"y"}`
          }]
        }],
        generationConfig: {
          temperature: 2.0,
          maxOutputTokens: 500,
        }
      })
    })

    const responseText = await response.text()
    console.log('Gemini HTTP status:', response.status)

    if (!response.ok) {
      console.error('Gemini API error:', response.status, responseText)
      
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit reached. Please wait 30 seconds and try again.'
        }, { status: 429 })
      }
      
      return NextResponse.json({ 
        error: `Gemini API error: ${response.status}`
      }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0]
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text.trim()
        console.log('Raw AI response:', text)
        
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        
        try {
          const result = JSON.parse(cleanText)
          console.log('Random song picked:', result)
          return NextResponse.json(result)
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message)
          return NextResponse.json({ 
            error: 'Failed to parse response. Try again.'
          }, { status: 500 })
        }
      } else {
        console.error('No content.parts. finishReason:', candidate.finishReason)
        return NextResponse.json({ 
          error: 'Response incomplete. Try again.'
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 })
  } catch (error) {
    console.error('Gemini Random API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to get random song'
    }, { status: 500 })
  }
}