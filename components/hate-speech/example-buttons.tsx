"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface ExampleButtonsProps {
  onSelect: (text: string) => void
}

const EXAMPLES = [
  {
    language: "English",
    flag: "EN",
    examples: [
      { label: "Hate Example", text: "I hate those people, they should all die and disappear" },
      { label: "Safe Example", text: "I love spending time with my friends and family on weekends" },
    ],
  },
  {
    language: "Hindi",
    flag: "HI",
    examples: [
      { label: "Hate Example", text: "वो सब बेवकूफ और गंदे लोग हैं, उन्हें यहाँ से भगाओ" },
      { label: "Safe Example", text: "आज का दिन बहुत अच्छा है, मैं बहुत खुश हूं" },
    ],
  },
  {
    language: "Tamil",
    flag: "TA",
    examples: [
      { label: "Hate Example", text: "அவர்கள் எல்லாரும் முட்டாள்கள், அவர்களை கொன்று விட வேண்டும்" },
      { label: "Safe Example", text: "இன்று மிகவும் நல்ல நாள், நான் மிகவும் மகிழ்ச்சியாக இருக்கிறேன்" },
    ],
  },
  {
    language: "Malayalam",
    flag: "ML",
    examples: [
      { label: "Hate Example", text: "അവർ എല്ലാവരും വിഡ്ഢികളാണ്, അവരെ ഇല്ലാതാക്കണം" },
      { label: "Safe Example", text: "ഇന്ന് നല്ല ദിവസമാണ്, ഞാൻ വളരെ സന്തോഷവാനാണ്" },
    ],
  },
]

export function ExampleButtons({ onSelect }: ExampleButtonsProps) {
  return (
    <div className="mt-6 pt-6 border-t border-border/50">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
        <Copy className="w-4 h-4" />
        Quick Examples (click to test)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXAMPLES.map((lang) => (
          <div key={lang.language} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                {lang.flag}
              </span>
              <span className="text-sm font-medium text-foreground">{lang.language}</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {lang.examples.map((example) => (
                <Button
                  key={example.label}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelect(example.text)}
                  className={`justify-start text-xs h-auto py-2 px-3 text-left whitespace-normal ${
                    example.label.includes("Hate") 
                      ? "border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5" 
                      : "border-success/30 hover:border-success/50 hover:bg-success/5"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                    example.label.includes("Hate") ? "bg-destructive" : "bg-success"
                  }`} />
                  {example.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
