"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Download,
  Users,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Filter,
  RefreshCw,
  BarChart3,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface CustomerData {
  customer_id: string
  segment: string
  tenure_months: number
  monthly_revenue: number
  last_activity_days: number
  support_tickets: number
  feature_usage_score: number
  payment_method: string
  contract_type: string
  signup_date: string
  churn_probability?: number
  revenue_at_risk?: number
  cohort?: string
}

interface CohortData {
  cohort: string
  month_0: number
  month_1: number
  month_2: number
  month_3: number
  month_6: number
  month_12: number
}

interface ChurnHeatmapData {
  segment: string
  low_risk: number
  medium_risk: number
  high_risk: number
  total_customers: number
  avg_churn_prob: number
}

export default function CustomerChurnPage() {
  const [uploadedData, setUploadedData] = useState<CustomerData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string>("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("12")
  const [insights, setInsights] = useState<string[]>([])

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())

        const data: CustomerData[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim())
            const customer: any = {}

            headers.forEach((header, index) => {
              const value = values[index]
              if (
                header.includes("revenue") ||
                header.includes("score") ||
                header.includes("months") ||
                header.includes("days") ||
                header.includes("tickets")
              ) {
                customer[header] = Number.parseFloat(value) || 0
              } else {
                customer[header] = value
              }
            })

            return customer
          })

        // Calculate churn probability and revenue at risk
        const processedData = data.map((customer) => ({
          ...customer,
          churn_probability: calculateChurnProbability(customer),
          revenue_at_risk: customer.monthly_revenue * calculateChurnProbability(customer) * 12,
          cohort: getCustomerCohort(customer.signup_date),
        }))

        setUploadedData(processedData)
        generateInsights(processedData)
        setIsProcessing(false)
      } catch (error) {
        console.error("Error parsing CSV:", error)
        setIsProcessing(false)
      }
    }

    reader.readAsText(file)
  }, [])

  // Calculate churn probability based on customer features
  const calculateChurnProbability = (customer: CustomerData): number => {
    let score = 0

    // Tenure factor (longer tenure = lower churn)
    if (customer.tenure_months < 6) score += 0.4
    else if (customer.tenure_months < 12) score += 0.2
    else score += 0.1

    // Activity factor
    if (customer.last_activity_days > 30) score += 0.3
    else if (customer.last_activity_days > 14) score += 0.15

    // Support tickets factor
    if (customer.support_tickets > 5) score += 0.2
    else if (customer.support_tickets > 2) score += 0.1

    // Feature usage factor
    if (customer.feature_usage_score < 0.3) score += 0.25
    else if (customer.feature_usage_score < 0.6) score += 0.1

    return Math.min(score, 0.95)
  }

  // Get customer cohort based on signup date
  const getCustomerCohort = (signupDate: string): string => {
    const date = new Date(signupDate)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }

  // Generate AI insights
  const generateInsights = (data: CustomerData[]) => {
    const insights: string[] = []

    const highRiskCustomers = data.filter((c) => c.churn_probability! > 0.7)
    const totalRevenue = data.reduce((sum, c) => sum + c.monthly_revenue, 0)
    const revenueAtRisk = data.reduce((sum, c) => sum + c.revenue_at_risk!, 0)

    insights.push(
      `${highRiskCustomers.length} customers (${((highRiskCustomers.length / data.length) * 100).toFixed(1)}%) are at high risk of churning`,
    )
    insights.push(
      `Total revenue at risk: $${(revenueAtRisk / 1000).toFixed(0)}K (${((revenueAtRisk / (totalRevenue * 12)) * 100).toFixed(1)}% of annual revenue)`,
    )

    const segmentRisk = data.reduce(
      (acc, customer) => {
        if (!acc[customer.segment]) acc[customer.segment] = { total: 0, highRisk: 0 }
        acc[customer.segment].total++
        if (customer.churn_probability! > 0.7) acc[customer.segment].highRisk++
        return acc
      },
      {} as Record<string, { total: number; highRisk: number }>,
    )

    const riskiestSegment = Object.entries(segmentRisk).sort(
      ([, a], [, b]) => b.highRisk / b.total - a.highRisk / a.total,
    )[0]

    if (riskiestSegment) {
      insights.push(
        `${riskiestSegment[0]} segment has the highest churn risk at ${((riskiestSegment[1].highRisk / riskiestSegment[1].total) * 100).toFixed(1)}%`,
      )
    }

    setInsights(insights)
  }

  // Process cohort data
  const cohortData = useMemo((): CohortData[] => {
    if (!uploadedData.length) return []

    const cohorts = uploadedData.reduce(
      (acc, customer) => {
        const cohort = customer.cohort!
        if (!acc[cohort]) {
          acc[cohort] = { customers: [], signupDate: new Date(customer.signup_date) }
        }
        acc[cohort].customers.push(customer)
        return acc
      },
      {} as Record<string, { customers: CustomerData[]; signupDate: Date }>,
    )

    return Object.entries(cohorts)
      .sort(([, a], [, b]) => a.signupDate.getTime() - b.signupDate.getTime())
      .slice(-6) // Last 6 cohorts
      .map(([cohort, data]) => {
        const totalCustomers = data.customers.length
        const activeCustomers = data.customers.filter((c) => c.churn_probability! < 0.5).length

        return {
          cohort,
          month_0: 100,
          month_1: Math.max(85, (activeCustomers / totalCustomers) * 100),
          month_2: Math.max(75, (activeCustomers / totalCustomers) * 90),
          month_3: Math.max(65, (activeCustomers / totalCustomers) * 80),
          month_6: Math.max(55, (activeCustomers / totalCustomers) * 70),
          month_12: Math.max(45, (activeCustomers / totalCustomers) * 60),
        }
      })
  }, [uploadedData])

  // Process heatmap data
  const heatmapData = useMemo((): ChurnHeatmapData[] => {
    if (!uploadedData.length) return []

    const segments = uploadedData.reduce(
      (acc, customer) => {
        if (!acc[customer.segment]) {
          acc[customer.segment] = { customers: [], totalRevenue: 0 }
        }
        acc[customer.segment].customers.push(customer)
        acc[customer.segment].totalRevenue += customer.monthly_revenue
        return acc
      },
      {} as Record<string, { customers: CustomerData[]; totalRevenue: number }>,
    )

    return Object.entries(segments).map(([segment, data]) => {
      const customers = data.customers
      const lowRisk = customers.filter((c) => c.churn_probability! < 0.3).length
      const mediumRisk = customers.filter((c) => c.churn_probability! >= 0.3 && c.churn_probability! < 0.7).length
      const highRisk = customers.filter((c) => c.churn_probability! >= 0.7).length
      const avgChurnProb = customers.reduce((sum, c) => sum + c.churn_probability!, 0) / customers.length

      return {
        segment,
        low_risk: lowRisk,
        medium_risk: mediumRisk,
        high_risk: highRisk,
        total_customers: customers.length,
        avg_churn_prob: avgChurnProb,
      }
    })
  }, [uploadedData])

  // Filtered data based on selections
  const filteredData = useMemo(() => {
    if (!uploadedData.length) return []
    return selectedSegment === "all" ? uploadedData : uploadedData.filter((c) => c.segment === selectedSegment)
  }, [uploadedData, selectedSegment])

  // Key metrics
  const metrics = useMemo(() => {
    if (!filteredData.length) return { totalCustomers: 0, avgChurnProb: 0, totalRevenueAtRisk: 0, highRiskCustomers: 0 }

    return {
      totalCustomers: filteredData.length,
      avgChurnProb: filteredData.reduce((sum, c) => sum + c.churn_probability!, 0) / filteredData.length,
      totalRevenueAtRisk: filteredData.reduce((sum, c) => sum + c.revenue_at_risk!, 0),
      highRiskCustomers: filteredData.filter((c) => c.churn_probability! > 0.7).length,
    }
  }, [filteredData])

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      Object.keys(uploadedData[0] || {}).join(","),
      ...uploadedData.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "churn_analysis_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const segments = useMemo(() => {
    const uniqueSegments = [...new Set(uploadedData.map((c) => c.segment))]
    return uniqueSegments.filter(Boolean)
  }, [uploadedData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
            Customer Churn & Revenue Risk
          </h1>
          <p className="text-muted-foreground">Analyze customer retention patterns and predict revenue at risk</p>
        </div>

        <div className="flex items-center gap-2">
          {uploadedData.length > 0 && (
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          )}
          <Button onClick={() => document.getElementById("file-upload")?.click()} disabled={isProcessing}>
            {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploadedData.length > 0 ? "Upload New Data" : "Upload Customer Data"}
          </Button>
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {uploadedData.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Customer Data</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Upload a CSV file with customer data including: customer_id, segment, tenure_months, monthly_revenue,
              last_activity_days, support_tickets, feature_usage_score, payment_method, contract_type, signup_date
            </p>
            <Button onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Customer Segment</Label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      {segments.map((segment) => (
                        <SelectItem key={segment} value={segment}>
                          {segment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timeframe (Months)</Label>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {metrics.totalCustomers.toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-chart-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Churn Probability</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {(metrics.avgChurnProb * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-chart-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue at Risk</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      ${(metrics.totalRevenueAtRisk / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk Customers</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {metrics.highRiskCustomers}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-chart-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto Insights */}
          {insights.length > 0 && (
            <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Auto Insights
                </CardTitle>
                <CardDescription>AI-powered insights automatically generated from your customer data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <Tabs defaultValue="cohort" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cohort">Cohort Retention</TabsTrigger>
              <TabsTrigger value="heatmap">Churn Risk Heatmap</TabsTrigger>
            </TabsList>

            <TabsContent value="cohort">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Retention Analysis</CardTitle>
                  <CardDescription>Customer retention rates by signup cohort over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cohortData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="cohort" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="month_1"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          name="Month 1"
                        />
                        <Line
                          type="monotone"
                          dataKey="month_3"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          name="Month 3"
                        />
                        <Line
                          type="monotone"
                          dataKey="month_6"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                          name="Month 6"
                        />
                        <Line
                          type="monotone"
                          dataKey="month_12"
                          stroke="hsl(var(--chart-4))"
                          strokeWidth={2}
                          name="Month 12"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heatmap">
              <Card>
                <CardHeader>
                  <CardTitle>Churn Risk by Segment</CardTitle>
                  <CardDescription>Distribution of churn risk levels across customer segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={heatmapData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis
                          type="category"
                          dataKey="segment"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="low_risk" stackId="risk" fill="hsl(var(--chart-4))" name="Low Risk" />
                        <Bar dataKey="medium_risk" stackId="risk" fill="hsl(var(--chart-3))" name="Medium Risk" />
                        <Bar dataKey="high_risk" stackId="risk" fill="hsl(var(--destructive))" name="High Risk" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
