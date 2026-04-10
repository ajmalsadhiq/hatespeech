"use client"

import { HateSpeechDetector } from "@/components/hate-speech/detector"
import { Header } from "@/components/hate-speech/header"

export default function HateSpeechPage() {
  return (
    <div className="min-h-screen gradient-bg animate-gradient">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HateSpeechDetector />
      </main>
    </div>
  )
}
