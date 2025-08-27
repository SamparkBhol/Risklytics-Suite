"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  Download,
  Network,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Shield,
  Eye,
  Activity,
  Users,
  Smartphone,
  Globe,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts"

interface TransactionData {
  transaction_id: string
  account_id: string
  device_id: string
  ip_address: string
  amount: number
  transaction_type: string
  merchant_category: string
  location: string
  timestamp: string
  is_weekend: boolean
  is_night_time: boolean
  days_since_last_transaction: number
  velocity_1h: number
  velocity_24h: number
  cross_border: boolean
  high_risk_merchant: boolean
  fraud_score?: number
  risk_level?: "low" | "medium" | "high" | "critical"
  anomaly_flags?: string[]
}

interface NetworkNode {
  id: string
  type: "account" | "device" | "ip"
  label: string
  fraud_score: number
  transaction_count: number
  total_amount: number
  risk_level: "low" | "medium" | "high" | "critical"
  x?: number
  y?: number
}

interface NetworkEdge {
  source: string
  target: string
  weight: number
  transaction_count: number
}

interface AnomalyAlert {
  id: string
  timestamp: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  affected_accounts: string[]
  fraud_score: number
  status: "new" | "investigating" | "resolved"
}

export default function FraudAMLPage() {
  const [uploadedData, setUploadedData] = useState<TransactionData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("24h")
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all")

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

        const data: TransactionData[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim())
            const transaction: any = {}

            headers.forEach((header, index) => {
              const value = values[index]
              if (
                header.includes("amount") ||
                header.includes("days") ||
                header.includes("velocity") ||
                header.includes("score")
              ) {
                transaction[header] = Number.parseFloat(value) || 0
              } else if (header.includes("is_") || header.includes("cross_") || header.includes("high_risk")) {
                transaction[header] = value.toLowerCase() === "true"
              } else {
                transaction[header] = value
              }
            })

            return transaction
          })

        // Calculate fraud scores and risk levels
        const processedData = data.map((transaction) => ({
          ...transaction,
          fraud_score: calculateFraudScore(transaction),
          risk_level: getRiskLevel(calculateFraudScore(transaction)),
          anomaly_flags: detectAnomalies(transaction),
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

  // Calculate fraud score using multiple risk factors
  const calculateFraudScore = (transaction: TransactionData): number => {
    let score = 0

    // Amount-based risk
    if (transaction.amount > 10000) score += 0.3
    else if (transaction.amount > 5000) score += 0.2
    else if (transaction.amount > 1000) score += 0.1

    // Time-based risk
    if (transaction.is_night_time) score += 0.15
    if (transaction.is_weekend) score += 0.1

    // Velocity risk
    if (transaction.velocity_1h > 5) score += 0.25
    else if (transaction.velocity_1h > 3) score += 0.15
    if (transaction.velocity_24h > 20) score += 0.2
    else if (transaction.velocity_24h > 10) score += 0.1

    // Location and merchant risk
    if (transaction.cross_border) score += 0.2
    if (transaction.high_risk_merchant) score += 0.25

    // Behavioral patterns
    if (transaction.days_since_last_transaction > 30) score += 0.1
    else if (transaction.days_since_last_transaction === 0) score += 0.05

    // Transaction type risk
    if (transaction.transaction_type === "cash_advance") score += 0.2
    else if (transaction.transaction_type === "online") score += 0.1

    return Math.min(score, 1.0)
  }

  // Get risk level based on fraud score
  const getRiskLevel = (score: number): "low" | "medium" | "high" | "critical" => {
    if (score >= 0.8) return "critical"
    if (score >= 0.6) return "high"
    if (score >= 0.4) return "medium"
    return "low"
  }

  // Detect specific anomalies
  const detectAnomalies = (transaction: TransactionData): string[] => {
    const flags: string[] = []

    if (transaction.amount > 10000) flags.push("Large Amount")
    if (transaction.velocity_1h > 5) flags.push("High Velocity")
    if (transaction.cross_border) flags.push("Cross Border")
    if (transaction.is_night_time && transaction.amount > 1000) flags.push("Night Large Transaction")
    if (transaction.high_risk_merchant) flags.push("High Risk Merchant")
    if (transaction.days_since_last_transaction > 60) flags.push("Dormant Account Activity")

    return flags
  }

  // Generate insights
  const generateInsights = (data: TransactionData[]) => {
    const insights: string[] = []

    const totalTransactions = data.length
    const suspiciousTransactions = data.filter((t) => t.fraud_score! > 0.6)
    const totalAmount = data.reduce((sum, t) => sum + t.amount, 0)
    const suspiciousAmount = suspiciousTransactions.reduce((sum, t) => sum + t.amount, 0)

    insights.push(
      `Analyzed ${totalTransactions.toLocaleString()} transactions totaling $${(totalAmount / 1000000).toFixed(1)}M`,
    )
    insights.push(
      `${suspiciousTransactions.length} transactions (${((suspiciousTransactions.length / totalTransactions) * 100).toFixed(1)}%) flagged as suspicious`,
    )
    insights.push(
      `Suspicious transactions represent $${(suspiciousAmount / 1000).toFixed(0)}K (${((suspiciousAmount / totalAmount) * 100).toFixed(1)}% of total volume)`,
    )

    // Network analysis
    const uniqueAccounts = new Set(data.map((t) => t.account_id)).size
    const uniqueDevices = new Set(data.map((t) => t.device_id)).size
    const uniqueIPs = new Set(data.map((t) => t.ip_address)).size

    insights.push(
      `Network includes ${uniqueAccounts} accounts, ${uniqueDevices} devices, and ${uniqueIPs} IP addresses`,
    )

    // High-risk patterns
    const crossBorderTransactions = data.filter((t) => t.cross_border).length
    const nightTransactions = data.filter((t) => t.is_night_time).length

    if (crossBorderTransactions > 0) {
      insights.push(
        `${crossBorderTransactions} cross-border transactions detected (${((crossBorderTransactions / totalTransactions) * 100).toFixed(1)}% of total)`,
      )
    }

    if (nightTransactions > totalTransactions * 0.3) {
      insights.push(
        `Unusually high night-time activity: ${((nightTransactions / totalTransactions) * 100).toFixed(1)}% of transactions`,
      )
    }

    setInsights(insights)
  }

  // Process network data
  const networkData = useMemo(() => {
    if (!uploadedData.length) return { nodes: [], edges: [] }

    const nodes: NetworkNode[] = []
    const edges: NetworkEdge[] = []
    const nodeMap = new Map<string, NetworkNode>()
    const edgeMap = new Map<string, NetworkEdge>()

    // Create nodes for accounts, devices, and IPs
    uploadedData.forEach((transaction) => {
      // Account node
      const accountId = `account_${transaction.account_id}`
      if (!nodeMap.has(accountId)) {
        nodeMap.set(accountId, {
          id: accountId,
          type: "account",
          label: transaction.account_id,
          fraud_score: 0,
          transaction_count: 0,
          total_amount: 0,
          risk_level: "low",
        })
      }

      // Device node
      const deviceId = `device_${transaction.device_id}`
      if (!nodeMap.has(deviceId)) {
        nodeMap.set(deviceId, {
          id: deviceId,
          type: "device",
          label: transaction.device_id,
          fraud_score: 0,
          transaction_count: 0,
          total_amount: 0,
          risk_level: "low",
        })
      }

      // IP node
      const ipId = `ip_${transaction.ip_address}`
      if (!nodeMap.has(ipId)) {
        nodeMap.set(ipId, {
          id: ipId,
          type: "ip",
          label: transaction.ip_address,
          fraud_score: 0,
          transaction_count: 0,
          total_amount: 0,
          risk_level: "low",
        })
      }

      // Update node metrics
      const accountNode = nodeMap.get(accountId)!
      const deviceNode = nodeMap.get(deviceId)!
      const ipNode = nodeMap.get(ipId)!
      ;[accountNode, deviceNode, ipNode].forEach((node) => {
        node.transaction_count++
        node.total_amount += transaction.amount
        node.fraud_score = Math.max(node.fraud_score, transaction.fraud_score!)
        node.risk_level = getRiskLevel(node.fraud_score)
      })

      // Create edges
      const accountDeviceEdge = `${accountId}-${deviceId}`
      const deviceIpEdge = `${deviceId}-${ipId}`

      if (!edgeMap.has(accountDeviceEdge)) {
        edgeMap.set(accountDeviceEdge, {
          source: accountId,
          target: deviceId,
          weight: 0,
          transaction_count: 0,
        })
      }

      if (!edgeMap.has(deviceIpEdge)) {
        edgeMap.set(deviceIpEdge, {
          source: deviceId,
          target: ipId,
          weight: 0,
          transaction_count: 0,
        })
      }

      edgeMap.get(accountDeviceEdge)!.transaction_count++
      edgeMap.get(accountDeviceEdge)!.weight += transaction.fraud_score!

      edgeMap.get(deviceIpEdge)!.transaction_count++
      edgeMap.get(deviceIpEdge)!.weight += transaction.fraud_score!
    })

    return {
      nodes: Array.from(nodeMap.values()).slice(0, 50), // Limit for performance
      edges: Array.from(edgeMap.values()).slice(0, 100),
    }
  }, [uploadedData])

  // Generate anomaly alerts
  const anomalyAlerts = useMemo((): AnomalyAlert[] => {
    if (!uploadedData.length) return []

    const alerts: AnomalyAlert[] = []
    let alertId = 1

    // High-value transaction alerts
    const highValueTransactions = uploadedData.filter((t) => t.amount > 10000)
    if (highValueTransactions.length > 0) {
      alerts.push({
        id: `alert_${alertId++}`,
        timestamp: new Date().toISOString(),
        type: "High Value Transaction",
        severity: "high",
        description: `${highValueTransactions.length} transactions over $10,000 detected`,
        affected_accounts: [...new Set(highValueTransactions.map((t) => t.account_id))],
        fraud_score: Math.max(...highValueTransactions.map((t) => t.fraud_score!)),
        status: "new",
      })
    }

    // Velocity alerts
    const highVelocityTransactions = uploadedData.filter((t) => t.velocity_1h > 5)
    if (highVelocityTransactions.length > 0) {
      alerts.push({
        id: `alert_${alertId++}`,
        timestamp: new Date().toISOString(),
        type: "High Transaction Velocity",
        severity: "critical",
        description: `${highVelocityTransactions.length} accounts with >5 transactions per hour`,
        affected_accounts: [...new Set(highVelocityTransactions.map((t) => t.account_id))],
        fraud_score: Math.max(...highVelocityTransactions.map((t) => t.fraud_score!)),
        status: "new",
      })
    }

    // Cross-border alerts
    const crossBorderTransactions = uploadedData.filter((t) => t.cross_border)
    if (crossBorderTransactions.length > 0) {
      alerts.push({
        id: `alert_${alertId++}`,
        timestamp: new Date().toISOString(),
        type: "Cross-Border Activity",
        severity: "medium",
        description: `${crossBorderTransactions.length} cross-border transactions detected`,
        affected_accounts: [...new Set(crossBorderTransactions.map((t) => t.account_id))],
        fraud_score: Math.max(...crossBorderTransactions.map((t) => t.fraud_score!)),
        status: "new",
      })
    }

    // Suspicious cluster alerts
    const suspiciousTransactions = uploadedData.filter((t) => t.fraud_score! > 0.8)
    if (suspiciousTransactions.length > 0) {
      alerts.push({
        id: `alert_${alertId++}`,
        timestamp: new Date().toISOString(),
        type: "Suspicious Transaction Cluster",
        severity: "critical",
        description: `${suspiciousTransactions.length} transactions with fraud score >80%`,
        affected_accounts: [...new Set(suspiciousTransactions.map((t) => t.account_id))],
        fraud_score: Math.max(...suspiciousTransactions.map((t) => t.fraud_score!)),
        status: "new",
      })
    }

    return alerts.sort((a, b) => b.fraud_score - a.fraud_score).slice(0, 10)
  }, [uploadedData])

  // Filtered data
  const filteredData = useMemo(() => {
    if (!uploadedData.length) return []
    let filtered = uploadedData

    if (selectedRiskLevel !== "all") {
      filtered = filtered.filter((t) => t.risk_level === selectedRiskLevel)
    }

    // Apply timeframe filter (mock implementation)
    const now = new Date()
    const timeframHours = selectedTimeframe === "1h" ? 1 : selectedTimeframe === "24h" ? 24 : 168
    // In real implementation, would filter by timestamp

    return filtered.slice(0, 1000) // Limit for performance
  }, [uploadedData, selectedRiskLevel, selectedTimeframe])

  // Risk distribution data
  const riskDistribution = useMemo(() => {
    if (!uploadedData.length) return []

    const distribution = uploadedData.reduce(
      (acc, transaction) => {
        acc[transaction.risk_level!]++
        return acc
      },
      { low: 0, medium: 0, high: 0, critical: 0 } as Record<string, number>,
    )

    return Object.entries(distribution).map(([level, count]) => ({
      risk_level: level,
      count,
      percentage: (count / uploadedData.length) * 100,
    }))
  }, [uploadedData])

  // Time series fraud score data
  const timeSeriesData = useMemo(() => {
    if (!uploadedData.length) return []

    // Group by hour (mock implementation)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const transactions = uploadedData.filter(() => Math.random() > 0.7) // Mock time filtering
      const avgFraudScore = transactions.length
        ? transactions.reduce((sum, t) => sum + t.fraud_score!, 0) / transactions.length
        : 0

      return {
        hour,
        avg_fraud_score: avgFraudScore * 100,
        transaction_count: transactions.length,
      }
    })

    return hourlyData
  }, [uploadedData])

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
    a.download = "fraud_analysis_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-destructive"
      case "high":
        return "text-chart-1"
      case "medium":
        return "text-chart-2"
      default:
        return "text-chart-4"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">Fraud & AML Monitoring</h1>
          <p className="text-muted-foreground">
            Advanced fraud detection with network analysis and behavioral monitoring
          </p>
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
            {uploadedData.length > 0 ? "Upload New Data" : "Upload Transaction Data"}
          </Button>
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {uploadedData.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Transaction Data</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Upload a CSV file with transaction data including: transaction_id, account_id, device_id, ip_address,
              amount, transaction_type, merchant_category, location, timestamp, is_weekend, is_night_time,
              days_since_last_transaction, velocity_1h, velocity_24h, cross_border, high_risk_merchant
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
                <Eye className="w-5 h-5" />
                Monitoring Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
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
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {uploadedData.length.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-chart-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Suspicious Transactions</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {uploadedData.filter((t) => t.fraud_score! > 0.6).length}
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
                    <p className="text-sm text-muted-foreground">Network Entities</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {networkData.nodes.length}
                    </p>
                  </div>
                  <Network className="w-8 h-8 text-chart-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {anomalyAlerts.length}
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
                  Fraud Detection Insights
                </CardTitle>
                <CardDescription>AI-powered analysis of transaction patterns and fraud indicators</CardDescription>
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

          {/* Main Content Tabs */}
          <Tabs defaultValue="network" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="network">Network Analysis</TabsTrigger>
              <TabsTrigger value="alerts">Anomaly Alerts</TabsTrigger>
              <TabsTrigger value="patterns">Risk Patterns</TabsTrigger>
              <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="network">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Graph Visualization</CardTitle>
                    <CardDescription>Accounts, devices, and IP relationships with fraud scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center">
                        <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Interactive network graph would be rendered here
                          <br />
                          Showing {networkData.nodes.length} nodes and {networkData.edges.length} connections
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>High-Risk Network Entities</CardTitle>
                    <CardDescription>Top entities by fraud score and transaction volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {networkData.nodes
                        .sort((a, b) => b.fraud_score - a.fraud_score)
                        .slice(0, 8)
                        .map((node) => (
                          <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {node.type === "account" && <Users className="w-4 h-4 text-chart-1" />}
                              {node.type === "device" && <Smartphone className="w-4 h-4 text-chart-2" />}
                              {node.type === "ip" && <Globe className="w-4 h-4 text-chart-3" />}
                              <div>
                                <p className="font-medium text-sm">{node.label}</p>
                                <p className="text-xs text-muted-foreground">{node.transaction_count} transactions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={getSeverityBadge(node.risk_level)} className="mb-1">
                                {node.risk_level}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {(node.fraud_score * 100).toFixed(1)}% risk
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Alerts</CardTitle>
                  <CardDescription>Real-time fraud and AML alerts requiring investigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Affected Accounts</TableHead>
                        <TableHead>Fraud Score</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anomalyAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="text-xs">{new Date(alert.timestamp).toLocaleString()}</TableCell>
                          <TableCell className="font-medium">{alert.type}</TableCell>
                          <TableCell>
                            <Badge variant={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{alert.description}</TableCell>
                          <TableCell className="text-xs">{alert.affected_accounts.length} accounts</TableCell>
                          <TableCell className={getSeverityColor(alert.severity)}>
                            {(alert.fraud_score * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{alert.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution Analysis</CardTitle>
                  <CardDescription>Distribution of transactions across risk levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="risk_level" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Transaction Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Score Timeline</CardTitle>
                  <CardDescription>Average fraud score and transaction volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="avg_fraud_score"
                          stroke="hsl(var(--destructive))"
                          strokeWidth={2}
                          name="Avg Fraud Score (%)"
                        />
                        <Line
                          type="monotone"
                          dataKey="transaction_count"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          name="Transaction Count"
                        />
                      </LineChart>
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
