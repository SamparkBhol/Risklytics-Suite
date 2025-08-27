"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import { Upload, Download, Leaf, AlertTriangle, Shield, Globe, TrendingDown, Eye } from "lucide-react"

interface ESGData {
  company: string
  environmental_score: number
  social_score: number
  governance_score: number
  overall_esg: number
  carbon_footprint: number
  diversity_index: number
  board_independence: number
  risk_level: "Low" | "Medium" | "High" | "Critical"
}

interface NewsAlert {
  id: string
  company: string
  headline: string
  sentiment: "Positive" | "Negative" | "Neutral"
  severity: number
  category: string
  date: string
  source: string
  impact_score: number
}

export default function ESGPage() {
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [esgData, setEsgData] = useState<ESGData[]>([])
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([])
  const [insights, setInsights] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  // ESG parameters
  const [environmentalWeight, setEnvironmentalWeight] = useState([0.4])
  const [socialWeight, setSocialWeight] = useState([0.3])
  const [governanceWeight, setGovernanceWeight] = useState([0.3])
  const [riskThreshold, setRiskThreshold] = useState([70])

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsProcessing(true)

      try {
        const text = await file.text()
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())

        const data = lines.slice(1).map((line) => {
          const values = line.split(",")
          const row: any = {}
          headers.forEach((header, index) => {
            const value = values[index]?.trim()
            row[header] = isNaN(Number(value)) ? value : Number(value)
          })
          return row
        })

        setUploadedData(data)

        // Generate ESG analysis
        const esgAnalysis = generateESGAnalysis(data)
        setEsgData(esgAnalysis)

        // Generate news alerts
        const alerts = generateNewsAlerts(esgAnalysis)
        setNewsAlerts(alerts)

        // Generate insights
        const analysisInsights = generateESGInsights(esgAnalysis, alerts)
        setInsights(analysisInsights)
      } catch (error) {
        console.error("Error processing file:", error)
      } finally {
        setIsProcessing(false)
      }
    },
    [environmentalWeight, socialWeight, governanceWeight],
  )

  const generateESGAnalysis = (data: any[]): ESGData[] => {
    const companies = ["TechCorp", "GreenEnergy Inc", "Global Manufacturing", "FinanceFirst", "RetailGiant"]

    return companies.map((company) => {
      const envScore = 20 + Math.random() * 80
      const socScore = 30 + Math.random() * 70
      const govScore = 40 + Math.random() * 60

      const overallESG = envScore * environmentalWeight[0] + socScore * socialWeight[0] + govScore * governanceWeight[0]

      let riskLevel: "Low" | "Medium" | "High" | "Critical"
      if (overallESG >= riskThreshold[0]) riskLevel = "Low"
      else if (overallESG >= riskThreshold[0] - 20) riskLevel = "Medium"
      else if (overallESG >= riskThreshold[0] - 40) riskLevel = "High"
      else riskLevel = "Critical"

      return {
        company,
        environmental_score: Math.round(envScore),
        social_score: Math.round(socScore),
        governance_score: Math.round(govScore),
        overall_esg: Math.round(overallESG),
        carbon_footprint: Math.round(50 + Math.random() * 200),
        diversity_index: Math.round(30 + Math.random() * 70),
        board_independence: Math.round(40 + Math.random() * 60),
        risk_level: riskLevel,
      }
    })
  }

  const generateNewsAlerts = (esgData: ESGData[]): NewsAlert[] => {
    const headlines = [
      "Environmental compliance violation reported",
      "New sustainability initiative launched",
      "Board diversity targets achieved",
      "Carbon emission reduction milestone reached",
      "Workplace safety incident under investigation",
      "ESG rating upgraded by major agency",
      "Supply chain transparency concerns raised",
      "Renewable energy investment announced",
    ]

    const categories = ["Environmental", "Social", "Governance", "Regulatory"]
    const sources = ["Reuters", "Bloomberg", "Financial Times", "WSJ", "ESG Today"]

    return esgData.flatMap((company) =>
      Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
        id: `${company.company}-${index}`,
        company: company.company,
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        sentiment: (["Positive", "Negative", "Neutral"] as const)[Math.floor(Math.random() * 3)],
        severity: Math.floor(Math.random() * 10) + 1,
        category: categories[Math.floor(Math.random() * categories.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        source: sources[Math.floor(Math.random() * sources.length)],
        impact_score: Math.floor(Math.random() * 100),
      })),
    )
  }

  const generateESGInsights = (esgData: ESGData[], alerts: NewsAlert[]): string => {
    const avgESG = esgData.reduce((sum, company) => sum + company.overall_esg, 0) / esgData.length
    const highRiskCompanies = esgData.filter((c) => c.risk_level === "High" || c.risk_level === "Critical").length
    const negativeAlerts = alerts.filter((a) => a.sentiment === "Negative").length
    const topPerformer = esgData.reduce((best, current) => (current.overall_esg > best.overall_esg ? current : best))

    return `ESG portfolio analysis reveals ${Math.round(avgESG)} average ESG score with ${highRiskCompanies} companies flagged as high-risk requiring immediate attention. Adverse news screening identified ${negativeAlerts} negative sentiment alerts across environmental, social, and governance categories. ${topPerformer.company} leads portfolio performance with ${topPerformer.overall_esg} ESG score, while companies with governance scores below 50 show correlation with increased regulatory scrutiny. Recommend implementing enhanced due diligence protocols for high-risk entities and establishing quarterly ESG monitoring cadence to maintain compliance standards.`
  }

  const exportData = () => {
    const exportData = {
      esg_analysis: esgData,
      news_alerts: newsAlerts,
      insights,
      parameters: {
        environmental_weight: environmentalWeight[0],
        social_weight: socialWeight[0],
        governance_weight: governanceWeight[0],
        risk_threshold: riskThreshold[0],
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "esg-analysis.json"
    a.click()
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "#10B981"
      case "Medium":
        return "#F59E0B"
      case "High":
        return "#EF4444"
      case "Critical":
        return "#DC2626"
      default:
        return "#6B7280"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "#10B981"
      case "Negative":
        return "#EF4444"
      case "Neutral":
        return "#6B7280"
      default:
        return "#6B7280"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ESG & Adverse News Screener
          </h1>
          <p className="text-muted-foreground mt-1">
            Environmental, Social, and Governance risk assessment with real-time news monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-green-500/20 bg-gradient-to-br from-background to-green-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-400" />
            Data Upload
          </CardTitle>
          <CardDescription>Upload company data (CSV) for ESG analysis and news screening</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload Company Data (CSV)</Label>
              <Input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="mt-1" />
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                Processing ESG data and screening news...
              </div>
            )}
            {uploadedData.length > 0 && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                {uploadedData.length} companies analyzed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {esgData.length > 0 && (
        <>
          {/* Parameter Controls */}
          <Card className="border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-400" />
                ESG Weighting Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Environmental: {Math.round(environmentalWeight[0] * 100)}%</Label>
                  <Slider
                    value={environmentalWeight}
                    onValueChange={setEnvironmentalWeight}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Social: {Math.round(socialWeight[0] * 100)}%</Label>
                  <Slider
                    value={socialWeight}
                    onValueChange={setSocialWeight}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Governance: {Math.round(governanceWeight[0] * 100)}%</Label>
                  <Slider
                    value={governanceWeight}
                    onValueChange={setGovernanceWeight}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Risk Threshold: {riskThreshold[0]}</Label>
                  <Slider
                    value={riskThreshold}
                    onValueChange={setRiskThreshold}
                    max={100}
                    min={30}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Analytics */}
          <Tabs defaultValue="esg-scores" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="esg-scores">ESG Scores</TabsTrigger>
              <TabsTrigger value="risk-matrix">Risk Matrix</TabsTrigger>
              <TabsTrigger value="news-alerts">News Alerts</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio View</TabsTrigger>
            </TabsList>

            <TabsContent value="esg-scores" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-400" />
                      ESG Score Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={esgData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="company" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                        <Radar
                          name="Environmental"
                          dataKey="environmental_score"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Social"
                          dataKey="social_score"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Governance"
                          dataKey="governance_score"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-blue-400" />
                      Overall ESG Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={esgData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9CA3AF" />
                        <YAxis dataKey="company" type="category" stroke="#9CA3AF" width={120} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="overall_esg" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risk-matrix" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-yellow-400" />
                      Risk Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            esgData.reduce(
                              (acc, company) => {
                                acc[company.risk_level] = (acc[company.risk_level] || 0) + 1
                                return acc
                              },
                              {} as Record<string, number>,
                            ),
                          ).map(([risk, count]) => ({ risk, count }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="count"
                          label={({ risk, count }) => `${risk}: ${count}`}
                        >
                          {Object.entries(
                            esgData.reduce(
                              (acc, company) => {
                                acc[company.risk_level] = (acc[company.risk_level] || 0) + 1
                                return acc
                              },
                              {} as Record<string, number>,
                            ),
                          ).map(([risk], index) => (
                            <Cell key={`cell-${index}`} fill={getRiskColor(risk)} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      ESG vs Carbon Footprint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={esgData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="overall_esg" stroke="#9CA3AF" name="ESG Score" />
                        <YAxis dataKey="carbon_footprint" stroke="#9CA3AF" name="Carbon Footprint" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Scatter dataKey="carbon_footprint" fill="#EF4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Company Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {esgData.map((company, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{company.company}</h4>
                          <p className="text-sm text-muted-foreground">
                            ESG: {company.overall_esg} | Carbon: {company.carbon_footprint}t CO2
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${getRiskColor(company.risk_level)}20`,
                              color: getRiskColor(company.risk_level),
                            }}
                          >
                            {company.risk_level} Risk
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            Board Independence: {company.board_independence}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news-alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-orange-400" />
                    Adverse News Monitoring
                  </CardTitle>
                  <CardDescription>Real-time screening of ESG-related news and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newsAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{alert.company}</Badge>
                            <Badge variant="secondary">{alert.category}</Badge>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: `${getSentimentColor(alert.sentiment)}20`,
                                color: getSentimentColor(alert.sentiment),
                              }}
                            >
                              {alert.sentiment}
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">{alert.headline}</h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.source} • {alert.date} • Impact Score: {alert.impact_score}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-400">Severity: {alert.severity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environmental Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={esgData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="company" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="environmental_score" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Social Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={esgData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="company" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="social_score" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Governance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={esgData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="company" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="governance_score" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* AI Insights */}
          {insights && (
            <Card className="border-emerald-500/20 bg-gradient-to-br from-background to-emerald-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                  ESG Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{insights}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
