import { NextResponse } from 'next/server'

export async function GET(request) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 })
  }

  try {
    // List all available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    const data = await response.json()
    
    console.log('Available models:', JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}