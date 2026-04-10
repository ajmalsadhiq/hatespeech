"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, X, Mic, MicOff, Copy, Check } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClear: () => void
  isLoading: boolean
}

export function TextInput({ value, onChange, onSubmit, onClear, isLoading }: TextInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [copied, setCopied] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        let transcript = ""
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        onChange(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onChange])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  const charCount = value.length
  const maxChars = 5000

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste text in English, Hindi, Tamil, or Malayalam..."
          className="min-h-[150px] pr-12 resize-none text-base bg-background/50 border-border/50 focus:border-primary/50 transition-smooth"
          maxLength={maxChars}
          disabled={isLoading}
        />
        
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              <span className="sr-only">Copy text</span>
            </Button>
          )}
          
          {speechSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleListening}
              className={`h-8 w-8 ${isListening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="sr-only">{isListening ? "Stop listening" : "Start voice input"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs ${charCount > maxChars * 0.9 ? "text-warning" : "text-muted-foreground"}`}>
          {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
        </span>
        
        <div className="flex items-center gap-2">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={isLoading}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Analyze Text
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isListening && (
        <p className="text-sm text-primary animate-pulse">
          Listening... Speak now
        </p>
      )}
    </div>
  )
}
