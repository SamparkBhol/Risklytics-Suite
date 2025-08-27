"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Shield,
  Zap,
  Database,
  Brain,
  Globe,
  BarChart3,
  Terminal,
  Code,
  FileText,
  Play,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [currentLine, setCurrentLine] = useState(0)

  useEffect(() => {
    console.log("[v0] Homepage mounted successfully")
    const interval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const codeLines = [
    "import { RisklyticsEngine } from '@risklytics/core'",
    "const insights = await engine.analyzeRisk(data)",
    "const predictions = model.predict(features)",
    "export const results = insights.optimize()",
  ]

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      {/* VSCode-style Header */}
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Terminal className="h-4 w-4 text-[#007acc]" />
            <span className="text-[#cccccc]">Risklytics Suite - Enterprise Risk Intelligence Platform</span>
          </div>
        </div>
      </div>

      {/* Hero Section with Code Editor Theme */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#007acc]/10 via-[#1e1e1e] to-[#c586c0]/10" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <Badge className="bg-[#007acc]/20 text-[#007acc] border-[#007acc]/30">
                <Code className="h-3 w-3 mr-1" />
                Next-Generation Analytics Platform
              </Badge>

              <h1 className="text-6xl font-bold font-mono">
                <span className="text-[#4fc1ff]">Risklytics</span>
                <span className="text-[#c586c0]">Suite</span>
                <br />
                <span className="text-3xl text-[#9cdcfe]">// Enterprise Risk Intelligence</span>
              </h1>

              <div className="space-y-4 text-lg text-[#d4d4d4]">
                <p className="font-mono">
                  <span className="text-[#569cd6]">/**</span>
                </p>
                <p className="font-mono pl-4">
                  <span className="text-[#569cd6]">* Transform raw enterprise data into predictive intelligence</span>
                </p>
                <p className="font-mono pl-4">
                  <span className="text-[#569cd6]">* Enable Fortune 500 companies to anticipate risks</span>
                </p>
                <p className="font-mono pl-4">
                  <span className="text-[#569cd6]">* Make data-driven decisions at machine speed</span>
                </p>
                <p className="font-mono">
                  <span className="text-[#569cd6]">*/</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 group bg-[#007acc] hover:bg-[#005a9e] text-white font-mono"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Launch Platform
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 bg-transparent border-[#007acc]/50 text-[#007acc] hover:bg-[#007acc]/10 font-mono"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Documentation
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Code Editor Mockup */}
            <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg overflow-hidden">
              <div className="bg-[#2d2d30] px-4 py-2 border-b border-[#3e3e42]">
                <div className="flex items-center gap-2">
                  <div className="bg-[#007acc] text-white px-2 py-1 text-xs rounded">risk-analysis.ts</div>
                  <div className="text-[#cccccc] px-2 py-1 text-xs">dashboard.tsx</div>
                </div>
              </div>
              <div className="p-4 font-mono text-sm space-y-2">
                {codeLines.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 transition-all duration-500 ${
                      index === currentLine ? "bg-[#007acc]/20 -mx-4 px-4 py-1" : ""
                    }`}
                  >
                    <span className="text-[#858585] w-6 text-right">{index + 1}</span>
                    <span className="text-[#d4d4d4]">{line}</span>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <span className="text-[#858585] w-6 text-right">5</span>
                  <span className="text-[#d4d4d4]">
                    <span className="animate-pulse">|</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Science Importance Section */}
      <div className="bg-[#252526] py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-mono mb-6 text-[#4fc1ff]">
              {"> Why Data Analytics & Science Drive Modern Enterprise Success"}
            </h2>
            <div className="max-w-5xl mx-auto space-y-6 text-lg text-[#d4d4d4] font-mono">
              <p>
                <span className="text-[#569cd6]">const</span> <span className="text-[#9cdcfe]">dataAdvantage</span> ={" "}
                {"{"}
              </p>
              <p className="pl-8">
                <span className="text-[#9cdcfe]">customerAcquisition</span>:{" "}
                <span className="text-[#ce9178]">"23x more likely"</span>,
              </p>
              <p className="pl-8">
                <span className="text-[#9cdcfe]">customerRetention</span>:{" "}
                <span className="text-[#ce9178]">"6x more likely"</span>,
              </p>
              <p className="pl-8">
                <span className="text-[#9cdcfe]">profitability</span>:{" "}
                <span className="text-[#ce9178]">"19x more likely"</span>
              </p>
              <p>{"}"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Advanced Risk Modeling",
                desc: "ML-powered fraud detection with 99.7% accuracy",
                color: "#4fc1ff",
              },
              {
                icon: Brain,
                title: "Predictive Intelligence",
                desc: "Deep learning for behavior forecasting",
                color: "#c586c0",
              },
              {
                icon: BarChart3,
                title: "Revenue Optimization",
                desc: "Time-series forecasting & ROI analysis",
                color: "#4ec9b0",
              },
              {
                icon: Zap,
                title: "Real-Time Analytics",
                desc: "Sub-second latency anomaly detection",
                color: "#dcdcaa",
              },
              {
                icon: Database,
                title: "Scalable Architecture",
                desc: "Petabyte-scale cloud-native infrastructure",
                color: "#f44747",
              },
              {
                icon: Globe,
                title: "ESG Intelligence",
                desc: "Comprehensive ESG scoring & compliance",
                color: "#569cd6",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-[#1e1e1e] border-[#3e3e42] hover:border-[#007acc]/50 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <CardTitle className="font-mono text-[#d4d4d4]">{item.title}</CardTitle>
                  </div>
                  <CardDescription className="text-[#858585] font-mono text-sm">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#1e1e1e] py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold font-mono mb-4 text-[#4fc1ff]">{"// Trusted by Industry Leaders"}</h3>
            <p className="text-[#858585] font-mono">Powering data-driven decisions for Fortune 500 companies</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.7%", label: "ML Model Accuracy", color: "#4fc1ff" },
              { value: "2.5PB", label: "Data Processed Daily", color: "#c586c0" },
              { value: "500ms", label: "Average Response Time", color: "#4ec9b0" },
              { value: "750+", label: "Enterprise Clients", color: "#dcdcaa" },
            ].map((stat, index) => (
              <div key={index} className="bg-[#252526] p-6 rounded border border-[#3e3e42]">
                <div className="text-4xl font-bold font-mono mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[#858585] font-mono text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#252526] py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-[#1e1e1e] border-[#007acc]/30 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold font-mono mb-4 text-[#4fc1ff]">
                {"> Transform Your Enterprise with Data Science"}
              </h3>
              <p className="text-xl text-[#d4d4d4] mb-8 font-mono">
                Join the data revolution. Leverage advanced analytics and AI for competitive advantage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6 bg-[#007acc] hover:bg-[#005a9e] text-white font-mono">
                    <Play className="mr-2 h-4 w-4" />
                    Start Analytics Journey
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 bg-transparent border-[#007acc]/50 text-[#007acc] hover:bg-[#007acc]/10 font-mono"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Explore Documentation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
