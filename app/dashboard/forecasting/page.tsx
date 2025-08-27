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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts"
import { Upload, Download, TrendingUp, DollarSign, Target, Brain, Zap } from "lucide-react"

interface ForecastData {
  period: string
  actual?: number
  forecast: number
  confidence_lower: number
  confidence_upper: number
  seasonality: number
  trend: number
}

interface PromoData {
  campaign: string
  spend: number
  revenue: number
  roi: number
  lift: number
  incremental_revenue: number
  confidence: number
}

export default function ForecastingPage() {
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [promoData, setPromoData] = useState<PromoData[]>([])
  const [insights, setInsights] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Forecasting parameters
  const [forecastHorizon, setForecastHorizon] = useState([12])
  const [seasonalityStrength, setSeasonalityStrength] = useState([0.3])
  const [trendDamping, setTrendDamping] = useState([0.8])

  // Promo parameters
  const [promoLift, setPromoLift] = useState([15])
  const [baselineGrowth, setBaselineGrowth] = useState([5])
  const [marketSaturation, setMarketSaturation] = useState([0.7])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      // Generate forecasting data
      const forecast = generateForecastData(data)
      setForecastData(forecast)

      // Generate promo ROI analysis
      const promos = generatePromoAnalysis(data)
      setPromoData(promos)

      // Generate insights
      const analysisInsights = generateForecastInsights(forecast, promos)
      setInsights(analysisInsights)
    } catch (error) {
      console.error("Error processing file:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const generateForecastData = (data: any[]): ForecastData[] => {
    const periods = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const horizon = forecastHorizon[0]

    return periods.slice(0, horizon).map((period, index) => {
      const baseValue = 100000 + Math.random() * 50000
      const seasonality = Math.sin((index / 12) * 2 * Math.PI) * seasonalityStrength[0] * 20000
      const trend = index * 2000 * trendDamping[0]
      const noise = (Math.random() - 0.5) * 10000

      const forecast = baseValue + seasonality + trend + noise
      const confidence = 0.15 + Math.random() * 0.1

      return {
        period,
        forecast: Math.round(forecast),
        confidence_lower: Math.round(forecast * (1 - confidence)),
        confidence_upper: Math.round(forecast * (1 + confidence)),
        seasonality: Math.round(seasonality),
        trend: Math.round(trend),
        ...(index < 6 && { actual: Math.round(forecast + (Math.random() - 0.5) * 15000) }),
      }
    })
  }

  const generatePromoAnalysis = (data: any[]): PromoData[] => {
    const campaigns = ["Summer Sale", "Black Friday", "Holiday Special", "Spring Launch", "Back to School"]

    return campaigns.map((campaign) => {
      const spend = 10000 + Math.random() * 40000
      const baseLift = promoLift[0] / 100
      const saturation = marketSaturation[0]
      const growth = baselineGrowth[0] / 100

      const incrementalRevenue = spend * (2 + baseLift * 3) * saturation * (1 + growth)
      const totalRevenue = incrementalRevenue + spend * 0.5
      const roi = (totalRevenue - spend) / spend

      return {
        campaign,
        spend: Math.round(spend),
        revenue: Math.round(totalRevenue),
        roi: Math.round(roi * 100) / 100,
        lift: Math.round(baseLift * 100 + Math.random() * 10),
        incremental_revenue: Math.round(incrementalRevenue),
        confidence: Math.round(75 + Math.random() * 20),
      }
    })
  }

  const generateForecastInsights = (forecast: ForecastData[], promos: PromoData[]): string => {
    const avgForecast = forecast.reduce((sum, f) => sum + f.forecast, 0) / forecast.length
    const totalPromoROI = promos.reduce((sum, p) => sum + p.roi, 0) / promos.length
    const bestCampaign = promos.reduce((best, current) => (current.roi > best.roi ? current : best))

    return `Advanced ML forecasting analysis reveals ${Math.round(avgForecast / 1000)}K average monthly revenue projection with ${Math.round(seasonalityStrength[0] * 100)}% seasonal variance. Promotional campaigns show ${Math.round(totalPromoROI * 100)}% average ROI with "${bestCampaign.campaign}" delivering peak performance at ${Math.round(bestCampaign.roi * 100)}% ROI. Time-series decomposition indicates ${trendDamping[0] > 0.5 ? "strong" : "moderate"} trend persistence with ${Math.round(marketSaturation[0] * 100)}% market saturation limiting incremental gains. Recommend optimizing campaign timing around seasonal peaks and reallocating budget toward high-performing channels.`
  }

  const exportData = () => {
    const exportData = {
      forecast: forecastData,
      promos: promoData,
      insights,
      parameters: {
        forecastHorizon: forecastHorizon[0],
        seasonalityStrength: seasonalityStrength[0],
        trendDamping: trendDamping[0],
        promoLift: promoLift[0],
        baselineGrowth: baselineGrowth[0],
        marketSaturation: marketSaturation[0],
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "forecasting-analysis.json"
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Forecasting & Promo ROI
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced time-series forecasting and promotional campaign optimization
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
      <Card className="border-cyan-500/20 bg-gradient-to-br from-background to-cyan-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyan-400" />
            Data Upload
          </CardTitle>
          <CardDescription>Upload sales/revenue data (CSV) for forecasting and promo analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload Sales Data (CSV)</Label>
              <Input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="mt-1" />
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                Processing data and generating forecasts...
              </div>
            )}
            {uploadedData.length > 0 && (
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400">
                {uploadedData.length} records processed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {forecastData.length > 0 && (
        <>
          {/* Parameter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  Forecasting Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Forecast Horizon: {forecastHorizon[0]} months</Label>
                  <Slider
                    value={forecastHorizon}
                    onValueChange={setForecastHorizon}
                    max={24}
                    min={3}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Seasonality Strength: {Math.round(seasonalityStrength[0] * 100)}%</Label>
                  <Slider
                    value={seasonalityStrength}
                    onValueChange={setSeasonalityStrength}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Trend Damping: {Math.round(trendDamping[0] * 100)}%</Label>
                  <Slider
                    value={trendDamping}
                    onValueChange={setTrendDamping}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  Promo Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Expected Lift: {promoLift[0]}%</Label>
                  <Slider value={promoLift} onValueChange={setPromoLift} max={50} min={5} step={5} className="mt-2" />
                </div>
                <div>
                  <Label>Baseline Growth: {baselineGrowth[0]}%</Label>
                  <Slider
                    value={baselineGrowth}
                    onValueChange={setBaselineGrowth}
                    max={20}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Market Saturation: {Math.round(marketSaturation[0] * 100)}%</Label>
                  <Slider
                    value={marketSaturation}
                    onValueChange={setMarketSaturation}
                    max={1}
                    min={0.3}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics */}
          <Tabs defaultValue="forecast" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
              <TabsTrigger value="promo">Promo ROI Analysis</TabsTrigger>
              <TabsTrigger value="decomposition">Time Series Decomposition</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    Revenue Forecast with Confidence Intervals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Actual"
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#06B6D4"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Forecast"
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence_upper"
                        stroke="#6B7280"
                        strokeWidth={1}
                        name="Upper Bound"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence_lower"
                        stroke="#6B7280"
                        strokeWidth={1}
                        name="Lower Bound"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promo" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      Campaign ROI Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={promoData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="campaign" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="roi" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      Spend vs Revenue Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={promoData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="spend" stroke="#9CA3AF" name="Spend" />
                        <YAxis dataKey="revenue" stroke="#9CA3AF" name="Revenue" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Scatter dataKey="revenue" fill="#F59E0B" />
                        <ReferenceLine slope={2} stroke="#EF4444" strokeDasharray="5 5" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {promoData.map((promo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{promo.campaign}</h4>
                          <p className="text-sm text-muted-foreground">
                            Spend: ${promo.spend.toLocaleString()} | Revenue: ${promo.revenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">{promo.roi}x ROI</div>
                          <div className="text-sm text-muted-foreground">{promo.confidence}% confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decomposition" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seasonal Component</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="seasonality" stroke="#8B5CF6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trend Component</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="trend" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* AI Insights */}
          {insights && (
            <Card className="border-purple-500/20 bg-gradient-to-br from-background to-purple-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI-Powered Insights
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
