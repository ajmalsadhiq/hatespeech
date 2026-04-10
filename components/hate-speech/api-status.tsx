"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface ApiStatusProps {
  apiUrl: string
}

interface HealthStatus {
  status: string
  ml_available: boolean
  english_model_loaded: boolean
  multilingual_model_loaded: boolean
  translation_available: boolean
  language_detection_available: boolean
}

export function ApiStatus({ apiUrl }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [health, setHealth] = useState<HealthStatus | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        })
        
        if (response.ok) {
          const data = await response.json()
          setHealth(data)
          setStatus("connected")
        } else {
          setStatus("disconnected")
        }
      } catch {
        setStatus("disconnected")
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [apiUrl])

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {status === "checking" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Checking API...</span>
            </>
          )}
          {status === "connected" && (
            <>
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-success">API Connected</span>
            </>
          )}
          {status === "disconnected" && (
            <>
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">API Disconnected</span>
            </>
          )}
        </div>

        {status === "connected" && health && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={health.english_model_loaded ? "default" : "secondary"} className="text-xs">
              English Model: {health.english_model_loaded ? "Loaded" : "Not Loaded"}
            </Badge>
            <Badge variant={health.multilingual_model_loaded ? "default" : "secondary"} className="text-xs">
              Multilingual: {health.multilingual_model_loaded ? "Loaded" : "Not Loaded"}
            </Badge>
            <Badge variant={health.translation_available ? "default" : "secondary"} className="text-xs">
              Translation: {health.translation_available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        )}

        {status === "disconnected" && (
          <p className="text-xs text-muted-foreground">
            Start the Flask backend: <code className="bg-secondary px-1 rounded">python backend/app.py</code>
          </p>
        )}
      </div>
    </div>
  )
}
