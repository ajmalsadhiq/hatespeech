"use client"

import { useState, useCallback } from "react"
import { TextInput } from "./text-input"
import { ResultsComparison } from "./results-comparison"
import { ExampleButtons } from "./example-buttons"
import { ApiStatus } from "./api-status"

export interface DetectionResult {
  original_text: string
  detected_language: string
  language_code: string
  translated_text?: string
  was_translated?: boolean
  method: string
  score: number
  confidence: number
  label: string
  processing_time: number
  matched_keywords?: string[]
  fallback_reason?: string
}

export interface ComparisonData {
  score_difference: number
  methods_agree: boolean
  reliability_note: string
}

export interface FullResult {
  input_text: string
  method1: DetectionResult
  method2: DetectionResult
  comparison: ComparisonData
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export function HateSpeechDetector() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FullResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detectHateSpeech = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError("Please enter some text to analyze")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Detection error:", err)
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to the API server. Make sure the Flask backend is running on port 5000.")
      } else {
        setError(err instanceof Error ? err.message : "An error occurred during detection")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleExampleSelect = useCallback((text: string) => {
    setInputText(text)
    detectHateSpeech(text)
  }, [detectHateSpeech])

  const handleClear = useCallback(() => {
    setInputText("")
    setResult(null)
    setError(null)
  }, [])

  return (
    <div className="space-y-6">
      <ApiStatus apiUrl={API_BASE_URL} />
      
      <div className="glass rounded-2xl p-6 transition-smooth">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Enter text to analyze
        </h2>
        <TextInput
          value={inputText}
          onChange={setInputText}
          onSubmit={() => detectHateSpeech(inputText)}
          onClear={handleClear}
          isLoading={isLoading}
        />
        
        <ExampleButtons onSelect={handleExampleSelect} />
      </div>

      {error && (
        <div className="glass rounded-2xl p-6 border-destructive/50 bg-destructive/5">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {result && (
        <ResultsComparison result={result} />
      )}
    </div>
  )
}
