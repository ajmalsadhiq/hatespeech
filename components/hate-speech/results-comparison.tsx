"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Globe,
  Languages,
  Clock,
  Zap
} from "lucide-react"
import type { FullResult } from "./detector"
import { jsPDF } from "jspdf"

interface ResultsComparisonProps {
  result: FullResult
}

export function ResultsComparison({ result }: ResultsComparisonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const getScoreColor = (score: number) => {
    if (score < 0.3) return "text-success"
    if (score < 0.6) return "text-warning"
    return "text-destructive"
  }

  const getScoreBarColor = (score: number) => {
    if (score < 0.3) return "bg-success"
    if (score < 0.6) return "bg-warning"
    return "bg-destructive"
  }

  const getLabelBadge = (label: string) => {
    if (label === "HATE") {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Hate Speech Detected
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1 bg-success text-success-foreground hover:bg-success/90">
        <CheckCircle2 className="w-3 h-3" />
        Safe Content
      </Badge>
    )
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Title
      doc.setFontSize(20)
      doc.setTextColor(60, 60, 60)
      doc.text("Hate Speech Detection Report", pageWidth / 2, 20, { align: "center" })
      
      // Date
      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" })
      
      // Input text
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Input Text:", 20, 45)
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      const inputLines = doc.splitTextToSize(result.input_text, pageWidth - 40)
      doc.text(inputLines, 20, 52)
      
      let yPos = 52 + (inputLines.length * 5) + 15
      
      // Method 1 Results
      doc.setFontSize(14)
      doc.setTextColor(60, 60, 60)
      doc.text("Method 1: Translation + BERT", 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.text(`Language: ${result.method1.detected_language}`, 25, yPos)
      yPos += 6
      doc.text(`Score: ${(result.method1.score * 100).toFixed(1)}%`, 25, yPos)
      yPos += 6
      doc.text(`Confidence: ${(result.method1.confidence * 100).toFixed(1)}%`, 25, yPos)
      yPos += 6
      doc.text(`Label: ${result.method1.label}`, 25, yPos)
      yPos += 6
      doc.text(`Processing Time: ${result.method1.processing_time}s`, 25, yPos)
      yPos += 15
      
      // Method 2 Results
      doc.setFontSize(14)
      doc.text("Method 2: True Multilingual (XLM-RoBERTa)", 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.text(`Language: ${result.method2.detected_language}`, 25, yPos)
      yPos += 6
      doc.text(`Score: ${(result.method2.score * 100).toFixed(1)}%`, 25, yPos)
      yPos += 6
      doc.text(`Confidence: ${(result.method2.confidence * 100).toFixed(1)}%`, 25, yPos)
      yPos += 6
      doc.text(`Label: ${result.method2.label}`, 25, yPos)
      yPos += 6
      doc.text(`Processing Time: ${result.method2.processing_time}s`, 25, yPos)
      yPos += 15
      
      // Comparison
      doc.setFontSize(14)
      doc.text("Comparison Summary", 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.text(`Methods Agree: ${result.comparison.methods_agree ? "Yes" : "No"}`, 25, yPos)
      yPos += 6
      doc.text(`Score Difference: ${(result.comparison.score_difference * 100).toFixed(1)}%`, 25, yPos)
      yPos += 6
      doc.text(`Reliability: ${result.comparison.reliability_note}`, 25, yPos)
      
      // Save
      doc.save("hate-speech-report.pdf")
    } catch (err) {
      console.error("PDF export error:", err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Comparison Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              {result.comparison.methods_agree ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-warning" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Agreement</p>
                <p className="font-semibold">
                  {result.comparison.methods_agree ? "Methods Agree" : "Methods Disagree"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {(result.comparison.score_difference * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Difference</p>
                <p className="font-semibold">{result.comparison.reliability_note}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <Globe className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Detected Language</p>
                <p className="font-semibold capitalize">{result.method1.detected_language}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side by Side Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1 */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              Method 1: Translation + BERT
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Translates to English, then analyzes with dehatebert-mono-english
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hate Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(result.method1.score)}`}>
                  {(result.method1.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getScoreBarColor(result.method1.score)}`}
                  style={{ width: `${result.method1.score * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <Progress value={result.method1.confidence * 100} className="w-24 h-2" />
                <span className="text-sm font-medium">{(result.method1.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Result</span>
              {getLabelBadge(result.method1.label)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.method1.processing_time}s
              </span>
            </div>

            {result.method1.was_translated && result.method1.translated_text && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Translated Text:</p>
                <p className="text-sm italic text-foreground/80 bg-background/50 p-2 rounded">
                  {result.method1.translated_text}
                </p>
              </div>
            )}

            {result.method1.matched_keywords && result.method1.matched_keywords.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Matched Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {result.method1.matched_keywords.map((word, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.method1.fallback_reason && (
              <p className="text-xs text-warning">
                Note: Using rule-based detection ({result.method1.fallback_reason})
              </p>
            )}
          </CardContent>
        </Card>

        {/* Method 2 */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Method 2: True Multilingual
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Direct analysis using XLM-RoBERTa multilingual model
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hate Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(result.method2.score)}`}>
                  {(result.method2.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getScoreBarColor(result.method2.score)}`}
                  style={{ width: `${result.method2.score * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <Progress value={result.method2.confidence * 100} className="w-24 h-2" />
                <span className="text-sm font-medium">{(result.method2.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Result</span>
              {getLabelBadge(result.method2.label)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.method2.processing_time}s
              </span>
            </div>

            {result.method2.matched_keywords && result.method2.matched_keywords.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Matched Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {result.method2.matched_keywords.map((word, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.method2.fallback_reason && (
              <p className="text-xs text-warning">
                Note: Using rule-based detection ({result.method2.fallback_reason})
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Original Input */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Original Input</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{result.input_text}</p>
        </CardContent>
      </Card>
    </div>
  )
}
