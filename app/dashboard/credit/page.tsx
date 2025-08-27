"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Download,
  Shield,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  DollarSign,
  Percent,
  Activity,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts"

interface CreditData {
  loan_id: string
  borrower_id: string
  loan_amount: number
  interest_rate: number
  term_months: number
  credit_score: number
  debt_to_income: number
  employment_years: number
  loan_purpose: string
  collateral_value: number
  payment_history_score: number
  current_balance: number
  days_past_due: number
  loan_grade: string
  origination_date: string
  pd?: number // Probability of Default
  lgd?: number // Loss Given Default
  ead?: number // Exposure at Default
  expected_loss?: number
}

interface StressTestScenario {
  unemployment_rate: number
  interest_rate_change: number
  macro_shock: number
}

interface PortfolioMetrics {
  total_exposure: number
  weighted_avg_pd: number
  weighted_avg_lgd: number
  total_expected_loss: number
  capital_requirement: number
  risk_adjusted_return: number
}

export default function CreditRiskPage() {
  const [uploadedData, setUploadedData] = useState<CreditData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [insights, setInsights] = useState<string[]>([])

  // Stress test parameters
  const [unemploymentRate, setUnemploymentRate] = useState([5.0])
  const [interestRateChange, setInterestRateChange] = useState([0.0])
  const [macroShock, setMacroShock] = useState([0.0])

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

        const data: CreditData[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim())
            const loan: any = {}

            headers.forEach((header, index) => {
              const value = values[index]
              if (
                header.includes("amount") ||
                header.includes("rate") ||
                header.includes("score") ||
                header.includes("months") ||
                header.includes("years") ||
                header.includes("value") ||
                header.includes("balance") ||
                header.includes("days")
              ) {
                loan[header] = Number.parseFloat(value) || 0
              } else {
                loan[header] = value
              }
            })

            return loan
          })

        // Calculate risk metrics
        const processedData = data.map((loan) => ({
          ...loan,
          pd: calculatePD(loan),
          lgd: calculateLGD(loan),
          ead: loan.current_balance || loan.loan_amount,
          expected_loss: 0, // Will be calculated after PD and LGD
        }))

        // Calculate expected loss
        processedData.forEach((loan) => {
          loan.expected_loss = loan.pd! * loan.lgd! * loan.ead!
        })

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

  // Calculate Probability of Default using logistic regression approach
  const calculatePD = (loan: CreditData): number => {
    let logOdds = -2.5 // Base intercept

    // Credit score factor (most important)
    if (loan.credit_score < 600) logOdds += 1.5
    else if (loan.credit_score < 650) logOdds += 1.0
    else if (loan.credit_score < 700) logOdds += 0.5
    else if (loan.credit_score < 750) logOdds += 0.2
    else logOdds -= 0.3

    // Debt-to-income ratio
    if (loan.debt_to_income > 0.5) logOdds += 1.2
    else if (loan.debt_to_income > 0.4) logOdds += 0.8
    else if (loan.debt_to_income > 0.3) logOdds += 0.4

    // Employment stability
    if (loan.employment_years < 1) logOdds += 0.8
    else if (loan.employment_years < 2) logOdds += 0.4
    else if (loan.employment_years > 5) logOdds -= 0.2

    // Payment history
    if (loan.payment_history_score < 0.7) logOdds += 1.0
    else if (loan.payment_history_score < 0.8) logOdds += 0.5
    else if (loan.payment_history_score > 0.9) logOdds -= 0.3

    // Days past due
    if (loan.days_past_due > 90) logOdds += 2.0
    else if (loan.days_past_due > 30) logOdds += 1.0
    else if (loan.days_past_due > 0) logOdds += 0.5

    // Convert log odds to probability
    const pd = 1 / (1 + Math.exp(-logOdds))
    return Math.min(Math.max(pd, 0.001), 0.95) // Cap between 0.1% and 95%
  }

  // Calculate Loss Given Default
  const calculateLGD = (loan: CreditData): number => {
    let baseLGD = 0.45 // Base LGD of 45%

    // Collateral factor
    const loanToValue = loan.loan_amount / (loan.collateral_value || loan.loan_amount)
    if (loanToValue > 0.9) baseLGD += 0.2
    else if (loanToValue > 0.8) baseLGD += 0.1
    else if (loanToValue < 0.6) baseLGD -= 0.15

    // Loan purpose adjustment
    if (loan.loan_purpose === "business") baseLGD += 0.1
    else if (loan.loan_purpose === "personal") baseLGD += 0.05
    else if (loan.loan_purpose === "home") baseLGD -= 0.1

    // Loan grade adjustment
    if (loan.loan_grade === "A") baseLGD -= 0.1
    else if (loan.loan_grade === "B") baseLGD -= 0.05
    else if (loan.loan_grade === "D" || loan.loan_grade === "E") baseLGD += 0.1

    return Math.min(Math.max(baseLGD, 0.1), 0.9) // Cap between 10% and 90%
  }

  // Apply stress test scenarios
  const applyStressTest = (data: CreditData[], scenario: StressTestScenario): CreditData[] => {
    return data.map((loan) => {
      let stressedPD = loan.pd!

      // Unemployment impact
      const unemploymentImpact = (scenario.unemployment_rate - 5.0) * 0.15
      stressedPD *= 1 + unemploymentImpact

      // Interest rate impact
      const interestRateImpact = scenario.interest_rate_change * 0.1
      stressedPD *= 1 + interestRateImpact

      // Macro shock impact
      const macroImpact = scenario.macro_shock * 0.2
      stressedPD *= 1 + macroImpact

      stressedPD = Math.min(Math.max(stressedPD, 0.001), 0.95)

      return {
        ...loan,
        pd: stressedPD,
        expected_loss: stressedPD * loan.lgd! * loan.ead!,
      }
    })
  }

  // Generate insights
  const generateInsights = (data: CreditData[]) => {
    const insights: string[] = []

    const totalExposure = data.reduce((sum, loan) => sum + loan.ead!, 0)
    const totalExpectedLoss = data.reduce((sum, loan) => sum + loan.expected_loss!, 0)
    const avgPD = data.reduce((sum, loan) => sum + loan.pd!, 0) / data.length
    const highRiskLoans = data.filter((loan) => loan.pd! > 0.1)

    insights.push(
      `Portfolio contains ${data.length} loans with total exposure of $${(totalExposure / 1000000).toFixed(1)}M`,
    )
    insights.push(
      `Expected loss is $${(totalExpectedLoss / 1000).toFixed(0)}K (${((totalExpectedLoss / totalExposure) * 100).toFixed(2)}% of exposure)`,
    )
    insights.push(`Average PD across portfolio is ${(avgPD * 100).toFixed(2)}%`)
    insights.push(
      `${highRiskLoans.length} loans (${((highRiskLoans.length / data.length) * 100).toFixed(1)}%) have PD > 10%`,
    )

    // Grade analysis
    const gradeAnalysis = data.reduce(
      (acc, loan) => {
        if (!acc[loan.loan_grade]) acc[loan.loan_grade] = { count: 0, totalPD: 0 }
        acc[loan.loan_grade].count++
        acc[loan.loan_grade].totalPD += loan.pd!
        return acc
      },
      {} as Record<string, { count: number; totalPD: number }>,
    )

    const riskiestGrade = Object.entries(gradeAnalysis)
      .map(([grade, data]) => ({ grade, avgPD: data.totalPD / data.count }))
      .sort((a, b) => b.avgPD - a.avgPD)[0]

    if (riskiestGrade) {
      insights.push(
        `Grade ${riskiestGrade.grade} loans have highest average PD at ${(riskiestGrade.avgPD * 100).toFixed(2)}%`,
      )
    }

    setInsights(insights)
  }

  // Calculate stressed portfolio metrics
  const stressedData = useMemo(() => {
    if (!uploadedData.length) return []
    return applyStressTest(uploadedData, {
      unemployment_rate: unemploymentRate[0],
      interest_rate_change: interestRateChange[0],
      macro_shock: macroShock[0],
    })
  }, [uploadedData, unemploymentRate, interestRateChange, macroShock])

  // Portfolio metrics
  const portfolioMetrics = useMemo((): PortfolioMetrics => {
    if (!stressedData.length)
      return {
        total_exposure: 0,
        weighted_avg_pd: 0,
        weighted_avg_lgd: 0,
        total_expected_loss: 0,
        capital_requirement: 0,
        risk_adjusted_return: 0,
      }

    const totalExposure = stressedData.reduce((sum, loan) => sum + loan.ead!, 0)
    const totalExpectedLoss = stressedData.reduce((sum, loan) => sum + loan.expected_loss!, 0)
    const weightedAvgPD = stressedData.reduce((sum, loan) => sum + loan.pd! * loan.ead!, 0) / totalExposure
    const weightedAvgLGD = stressedData.reduce((sum, loan) => sum + loan.lgd! * loan.ead!, 0) / totalExposure

    return {
      total_exposure: totalExposure,
      weighted_avg_pd: weightedAvgPD,
      weighted_avg_lgd: weightedAvgLGD,
      total_expected_loss: totalExpectedLoss,
      capital_requirement: totalExpectedLoss * 12.5, // Basel III multiplier
      risk_adjusted_return: (totalExposure * 0.05 - totalExpectedLoss) / totalExposure, // Assuming 5% gross return
    }
  }, [stressedData])

  // Time series data for expected loss
  const timeSeriesData = useMemo(() => {
    if (!stressedData.length) return []

    const months = Array.from({ length: 24 }, (_, i) => i + 1)
    return months.map((month) => {
      const cumulativeDefault = 1 - Math.exp(-portfolioMetrics.weighted_avg_pd * (month / 12))
      const expectedLoss = portfolioMetrics.total_exposure * cumulativeDefault * portfolioMetrics.weighted_avg_lgd

      return {
        month,
        expected_loss: expectedLoss / 1000, // Convert to thousands
        cumulative_pd: cumulativeDefault * 100,
      }
    })
  }, [stressedData, portfolioMetrics])

  // Risk distribution data
  const riskDistribution = useMemo(() => {
    if (!stressedData.length) return []

    const buckets = [
      { range: "0-1%", min: 0, max: 0.01, count: 0, exposure: 0 },
      { range: "1-5%", min: 0.01, max: 0.05, count: 0, exposure: 0 },
      { range: "5-10%", min: 0.05, max: 0.1, count: 0, exposure: 0 },
      { range: "10-20%", min: 0.1, max: 0.2, count: 0, exposure: 0 },
      { range: "20%+", min: 0.2, max: 1, count: 0, exposure: 0 },
    ]

    stressedData.forEach((loan) => {
      const bucket = buckets.find((b) => loan.pd! >= b.min && loan.pd! < b.max)
      if (bucket) {
        bucket.count++
        bucket.exposure += loan.ead!
      }
    })

    return buckets.map((bucket) => ({
      ...bucket,
      exposure: bucket.exposure / 1000000, // Convert to millions
    }))
  }, [stressedData])

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      Object.keys(stressedData[0] || {}).join(","),
      ...stressedData.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "credit_risk_analysis_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">Credit & Regulatory Risk</h1>
          <p className="text-muted-foreground">Advanced credit risk modeling with PD/LGD analysis and stress testing</p>
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
            {uploadedData.length > 0 ? "Upload New Data" : "Upload Credit Data"}
          </Button>
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {uploadedData.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Credit Portfolio Data</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Upload a CSV file with loan data including: loan_id, borrower_id, loan_amount, interest_rate, term_months,
              credit_score, debt_to_income, employment_years, loan_purpose, collateral_value, payment_history_score,
              current_balance, days_past_due, loan_grade, origination_date
            </p>
            <Button onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stress Test Controls */}
          <Card className="border-chart-2/20 bg-gradient-to-r from-chart-2/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-chart-2" />
                Stress Test Scenarios
              </CardTitle>
              <CardDescription>Adjust economic parameters to simulate stress conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Unemployment Rate</Label>
                    <Badge variant="outline">{unemploymentRate[0].toFixed(1)}%</Badge>
                  </div>
                  <Slider
                    value={unemploymentRate}
                    onValueChange={setUnemploymentRate}
                    min={3}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Interest Rate Change</Label>
                    <Badge variant="outline">
                      {interestRateChange[0] > 0 ? "+" : ""}
                      {interestRateChange[0].toFixed(1)}%
                    </Badge>
                  </div>
                  <Slider
                    value={interestRateChange}
                    onValueChange={setInterestRateChange}
                    min={-3}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-3%</span>
                    <span>+5%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Macro Economic Shock</Label>
                    <Badge variant="outline">
                      {macroShock[0] > 0 ? "+" : ""}
                      {macroShock[0].toFixed(1)}%
                    </Badge>
                  </div>
                  <Slider
                    value={macroShock}
                    onValueChange={setMacroShock}
                    min={-2}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-2%</span>
                    <span>+3%</span>
                  </div>
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
                    <p className="text-sm text-muted-foreground">Total Exposure</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      ${(portfolioMetrics.total_exposure / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-chart-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Weighted Avg PD</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {(portfolioMetrics.weighted_avg_pd * 100).toFixed(2)}%
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-chart-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Loss</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      ${(portfolioMetrics.total_expected_loss / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Capital Requirement</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      ${(portfolioMetrics.capital_requirement / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-chart-4" />
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
                  Portfolio Risk Insights
                </CardTitle>
                <CardDescription>AI-powered analysis of your credit portfolio risk profile</CardDescription>
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
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Expected Loss Timeline</TabsTrigger>
              <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
              <TabsTrigger value="correlation">PD vs LGD Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Expected Loss Over Time</CardTitle>
                  <CardDescription>Projected cumulative expected loss under current stress scenario</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="expected_loss"
                          stroke="hsl(var(--destructive))"
                          fill="hsl(var(--destructive))"
                          fillOpacity={0.3}
                          name="Expected Loss ($K)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution by PD Buckets</CardTitle>
                  <CardDescription>
                    Portfolio exposure and loan count across probability of default ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Loan Count" />
                        <Bar dataKey="exposure" fill="hsl(var(--chart-2))" name="Exposure ($M)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlation">
              <Card>
                <CardHeader>
                  <CardTitle>PD vs LGD Correlation Analysis</CardTitle>
                  <CardDescription>Relationship between probability of default and loss given default</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={stressedData.slice(0, 200)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          dataKey="pd"
                          domain={[0, 1]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          name="PD"
                        />
                        <YAxis
                          type="number"
                          dataKey="lgd"
                          domain={[0, 1]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          name="LGD"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any, name: string) => [
                            `${(Number(value) * 100).toFixed(2)}%`,
                            name === "pd" ? "Probability of Default" : "Loss Given Default",
                          ]}
                        />
                        <Scatter dataKey="lgd" fill="hsl(var(--chart-3))" />
                      </ScatterChart>
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
