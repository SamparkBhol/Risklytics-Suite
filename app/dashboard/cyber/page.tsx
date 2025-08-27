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
import { Upload, Download, Eye, AlertTriangle, RefreshCw, BarChart3, Shield, Activity, Zap } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

interface SecurityLogData {
  session_id: string
  user_id: string
  ip_address: string
  user_agent: string
  timestamp: string
  event_type: string
  resource_accessed: string
  response_code: number
  bytes_transferred: number
  request_duration: number
  failed_login_attempts: number
  privilege_escalation: boolean
  suspicious_payload: boolean
  geolocation: string
  device_fingerprint: string
  threat_score?: number
  anomaly_score?: number
  risk_level?: "low" | "medium" | "high" | "critical"
  threat_indicators?: string[]
  embedding_x?: number
  embedding_y?: number
}

interface ThreatSession {
  session_id: string
  user_id: string
  ip_address: string
  threat_score: number
  anomaly_count: number
  duration_minutes: number
  events_count: number
  threat_types: string[]
  first_seen: string
  last_seen: string
  risk_level: "low" | "medium" | "high" | "critical"
}

interface AnomalySpike {
  timestamp: string
  anomaly_count: number
  threat_score: number
  event_types: string[]
  affected_sessions: number
}

export default function CybersecurityPage() {
  const [uploadedData, setUploadedData] = useState<SecurityLogData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("24h")
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>("all")

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

        const data: SecurityLogData[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim())
            const log: any = {}

            headers.forEach((header, index) => {
              const value = values[index]
              if (
                header.includes("code") ||
                header.includes("bytes") ||
                header.includes("duration") ||
                header.includes("attempts") ||
                header.includes("score")
              ) {
                log[header] = Number.parseFloat(value) || 0
              } else if (header.includes("privilege_") || header.includes("suspicious_")) {
                log[header] = value.toLowerCase() === "true"
              } else {
                log[header] = value
              }
            })

            return log
          })

        // Calculate threat scores and risk levels
        const processedData = data.map((log) => ({
          ...log,
          threat_score: calculateThreatScore(log),
          anomaly_score: calculateAnomalyScore(log),
          risk_level: getRiskLevel(calculateThreatScore(log)),
          threat_indicators: detectThreatIndicators(log),
          embedding_x: Math.random() * 100 - 50, // Mock t-SNE/UMAP projection
          embedding_y: Math.random() * 100 - 50,
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

  // Calculate threat score using multiple security indicators
  const calculateThreatScore = (log: SecurityLogData): number => {
    let score = 0

    // Response code analysis
    if (log.response_code >= 400 && log.response_code < 500) score += 0.2
    else if (log.response_code >= 500) score += 0.3

    // Failed login attempts
    if (log.failed_login_attempts > 5) score += 0.4
    else if (log.failed_login_attempts > 2) score += 0.2

    // Privilege escalation
    if (log.privilege_escalation) score += 0.5

    // Suspicious payload
    if (log.suspicious_payload) score += 0.4

    // Request duration (potential DoS)
    if (log.request_duration > 10000) score += 0.3
    else if (log.request_duration > 5000) score += 0.15

    // Bytes transferred (data exfiltration)
    if (log.bytes_transferred > 10000000)
      score += 0.25 // >10MB
    else if (log.bytes_transferred > 1000000) score += 0.1 // >1MB

    // Event type analysis
    if (log.event_type === "admin_access") score += 0.2
    else if (log.event_type === "system_modification") score += 0.3
    else if (log.event_type === "data_access") score += 0.15

    // Time-based analysis (night time activity)
    const hour = new Date(log.timestamp).getHours()
    if (hour < 6 || hour > 22) score += 0.1

    return Math.min(score, 1.0)
  }

  // Calculate anomaly score based on behavioral patterns
  const calculateAnomalyScore = (log: SecurityLogData): number => {
    let score = 0

    // Unusual user agent
    if (log.user_agent.includes("bot") || log.user_agent.includes("crawler")) score += 0.3

    // Unusual resource access patterns
    if (log.resource_accessed.includes("admin") || log.resource_accessed.includes("config")) score += 0.2

    // Geographic anomalies (mock)
    const suspiciousLocations = ["Unknown", "TOR", "VPN"]
    if (suspiciousLocations.some((loc) => log.geolocation.includes(loc))) score += 0.3

    // Device fingerprint anomalies
    if (log.device_fingerprint === "unknown" || log.device_fingerprint === "masked") score += 0.2

    return Math.min(score, 1.0)
  }

  // Get risk level based on threat score
  const getRiskLevel = (score: number): "low" | "medium" | "high" | "critical" => {
    if (score >= 0.8) return "critical"
    if (score >= 0.6) return "high"
    if (score >= 0.4) return "medium"
    return "low"
  }

  // Detect specific threat indicators
  const detectThreatIndicators = (log: SecurityLogData): string[] => {
    const indicators: string[] = []

    if (log.failed_login_attempts > 3) indicators.push("Brute Force")
    if (log.privilege_escalation) indicators.push("Privilege Escalation")
    if (log.suspicious_payload) indicators.push("Malicious Payload")
    if (log.bytes_transferred > 5000000) indicators.push("Data Exfiltration")
    if (log.request_duration > 8000) indicators.push("DoS Attack")
    if (log.response_code === 401) indicators.push("Unauthorized Access")
    if (log.event_type === "system_modification") indicators.push("System Tampering")

    return indicators
  }

  // Generate insights
  const generateInsights = (data: SecurityLogData[]) => {
    const insights: string[] = []

    const totalLogs = data.length
    const threatLogs = data.filter((log) => log.threat_score! > 0.6)
    const criticalThreats = data.filter((log) => log.risk_level === "critical")
    const uniqueUsers = new Set(data.map((log) => log.user_id)).size
    const uniqueIPs = new Set(data.map((log) => log.ip_address)).size

    insights.push(
      `Analyzed ${totalLogs.toLocaleString()} security events from ${uniqueUsers} users and ${uniqueIPs} IP addresses`,
    )
    insights.push(
      `${threatLogs.length} events (${((threatLogs.length / totalLogs) * 100).toFixed(1)}%) flagged as potential threats`,
    )
    insights.push(`${criticalThreats.length} critical security incidents requiring immediate attention`)

    // Threat type analysis
    const threatTypes = data.reduce(
      (acc, log) => {
        log.threat_indicators?.forEach((indicator) => {
          acc[indicator] = (acc[indicator] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const topThreat = Object.entries(threatTypes).sort(([, a], [, b]) => b - a)[0]
    if (topThreat) {
      insights.push(`Most common threat type: ${topThreat[0]} (${topThreat[1]} incidents)`)
    }

    // Time-based patterns
    const nightTimeEvents = data.filter((log) => {
      const hour = new Date(log.timestamp).getHours()
      return hour < 6 || hour > 22
    })

    if (nightTimeEvents.length > totalLogs * 0.3) {
      insights.push(
        `Unusual activity pattern: ${((nightTimeEvents.length / totalLogs) * 100).toFixed(1)}% of events occurred during off-hours`,
      )
    }

    // Geographic analysis
    const suspiciousGeoEvents = data.filter((log) =>
      ["Unknown", "TOR", "VPN"].some((loc) => log.geolocation.includes(loc)),
    )

    if (suspiciousGeoEvents.length > 0) {
      insights.push(`${suspiciousGeoEvents.length} events from suspicious geographic locations (TOR/VPN/Unknown)`)
    }

    setInsights(insights)
  }

  // Process threat sessions
  const threatSessions = useMemo((): ThreatSession[] => {
    if (!uploadedData.length) return []

    const sessionMap = new Map<string, SecurityLogData[]>()

    // Group logs by session
    uploadedData.forEach((log) => {
      if (!sessionMap.has(log.session_id)) {
        sessionMap.set(log.session_id, [])
      }
      sessionMap.get(log.session_id)!.push(log)
    })

    // Calculate session-level metrics
    const sessions: ThreatSession[] = []
    sessionMap.forEach((logs, sessionId) => {
      const maxThreatScore = Math.max(...logs.map((log) => log.threat_score!))
      const anomalyCount = logs.filter((log) => log.anomaly_score! > 0.5).length
      const threatTypes = [...new Set(logs.flatMap((log) => log.threat_indicators!))]
      const timestamps = logs.map((log) => new Date(log.timestamp).getTime())
      const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60) // minutes

      if (maxThreatScore > 0.4) {
        // Only include sessions with significant threat scores
        sessions.push({
          session_id: sessionId,
          user_id: logs[0].user_id,
          ip_address: logs[0].ip_address,
          threat_score: maxThreatScore,
          anomaly_count: anomalyCount,
          duration_minutes: duration,
          events_count: logs.length,
          threat_types: threatTypes,
          first_seen: new Date(Math.min(...timestamps)).toISOString(),
          last_seen: new Date(Math.max(...timestamps)).toISOString(),
          risk_level: getRiskLevel(maxThreatScore),
        })
      }
    })

    return sessions.sort((a, b) => b.threat_score - a.threat_score).slice(0, 20)
  }, [uploadedData])

  // Process anomaly spikes
  const anomalySpikes = useMemo((): AnomalySpike[] => {
    if (!uploadedData.length) return []

    // Group by hour
    const hourlyData = new Map<string, SecurityLogData[]>()
    uploadedData.forEach((log) => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ":00:00.000Z"
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, [])
      }
      hourlyData.get(hour)!.push(log)
    })

    const spikes: AnomalySpike[] = []
    hourlyData.forEach((logs, timestamp) => {
      const anomalies = logs.filter((log) => log.anomaly_score! > 0.5)
      const avgThreatScore = logs.reduce((sum, log) => sum + log.threat_score!, 0) / logs.length
      const eventTypes = [...new Set(logs.map((log) => log.event_type))]
      const uniqueSessions = new Set(logs.map((log) => log.session_id)).size

      if (anomalies.length > 5 || avgThreatScore > 0.6) {
        // Spike threshold
        spikes.push({
          timestamp,
          anomaly_count: anomalies.length,
          threat_score: avgThreatScore,
          event_types: eventTypes,
          affected_sessions: uniqueSessions,
        })
      }
    })

    return spikes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).slice(0, 24)
  }, [uploadedData])

  // Time series data for visualization
  const timeSeriesData = useMemo(() => {
    if (!uploadedData.length) return []

    // Group by hour for the last 24 hours
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = 23 - i
      const logs = uploadedData.filter(() => Math.random() > 0.3) // Mock time filtering

      const threatCount = logs.filter((log) => log.threat_score! > 0.6).length
      const avgThreatScore = logs.length ? logs.reduce((sum, log) => sum + log.threat_score!, 0) / logs.length : 0

      return {
        hour: `${hour}:00`,
        threat_count: threatCount,
        avg_threat_score: avgThreatScore * 100,
        total_events: logs.length,
      }
    }).reverse()

    return hourlyData
  }, [uploadedData])

  // Embedding projection data (mock t-SNE/UMAP)
  const embeddingData = useMemo(() => {
    return uploadedData
      .filter((log) => log.threat_score! > 0.3)
      .slice(0, 200)
      .map((log) => ({
        x: log.embedding_x!,
        y: log.embedding_y!,
        threat_score: log.threat_score! * 100,
        risk_level: log.risk_level!,
        session_id: log.session_id,
      }))
  }, [uploadedData])

  // Threat type distribution
  const threatTypeDistribution = useMemo(() => {
    if (!uploadedData.length) return []

    const distribution = uploadedData.reduce(
      (acc, log) => {
        log.threat_indicators?.forEach((indicator) => {
          acc[indicator] = (acc[indicator] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(distribution)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
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
    a.download = "cybersecurity_analysis_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (level: string) => {
    switch (level) {
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

  const getSeverityBadge = (level: string) => {
    switch (level) {
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
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
            Cybersecurity Threat Intelligence
          </h1>
          <p className="text-muted-foreground">
            Advanced threat detection with ML-powered anomaly analysis and behavioral monitoring
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
            {uploadedData.length > 0 ? "Upload New Data" : "Upload Security Logs"}
          </Button>
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {uploadedData.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Security Log Data</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Upload a CSV file with security log data including: session_id, user_id, ip_address, user_agent,
              timestamp, event_type, resource_accessed, response_code, bytes_transferred, request_duration,
              failed_login_attempts, privilege_escalation, suspicious_payload, geolocation, device_fingerprint
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
                Threat Monitoring Controls
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
                  <Label>Threat Level</Label>
                  <Select value={selectedThreatLevel} onValueChange={setSelectedThreatLevel}>
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
                    <p className="text-sm text-muted-foreground">Total Events</p>
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
                    <p className="text-sm text-muted-foreground">Threat Events</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {uploadedData.filter((log) => log.threat_score! > 0.6).length}
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
                    <p className="text-sm text-muted-foreground">Suspicious Sessions</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {threatSessions.length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-chart-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Anomaly Spikes</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                      {anomalySpikes.length}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-chart-4" />
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
                  Threat Intelligence Insights
                </CardTitle>
                <CardDescription>AI-powered analysis of security events and threat patterns</CardDescription>
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
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Anomaly Timeline</TabsTrigger>
              <TabsTrigger value="embedding">Threat Clustering</TabsTrigger>
              <TabsTrigger value="sessions">Suspicious Sessions</TabsTrigger>
              <TabsTrigger value="patterns">Threat Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Time-Series Anomaly Detection</CardTitle>
                  <CardDescription>Real-time threat detection and anomaly spikes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
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
                        <Area
                          type="monotone"
                          dataKey="threat_count"
                          stroke="hsl(var(--destructive))"
                          fill="hsl(var(--destructive))"
                          fillOpacity={0.3}
                          name="Threat Events"
                        />
                        <Area
                          type="monotone"
                          dataKey="avg_threat_score"
                          stroke="hsl(var(--chart-2))"
                          fill="hsl(var(--chart-2))"
                          fillOpacity={0.2}
                          name="Avg Threat Score (%)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="embedding">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Embedding Projection (t-SNE/UMAP)</CardTitle>
                  <CardDescription>
                    ML-powered clustering of security events to identify threat patterns and anomalies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={embeddingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          domain={[-60, 60]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          name="Dimension 1"
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          domain={[-60, 60]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          name="Dimension 2"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any, name: string) => [
                            name === "threat_score" ? `${Number(value).toFixed(1)}%` : value,
                            name === "threat_score" ? "Threat Score" : name,
                          ]}
                        />
                        <Scatter dataKey="threat_score" fill="hsl(var(--destructive))" fillOpacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Top Suspicious Sessions</CardTitle>
                  <CardDescription>Sessions flagged for suspicious activity and potential threats</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Threat Score</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Threat Types</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {threatSessions.slice(0, 10).map((session) => (
                        <TableRow key={session.session_id}>
                          <TableCell className="font-mono text-xs">{session.session_id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-medium">{session.user_id}</TableCell>
                          <TableCell className="font-mono text-xs">{session.ip_address}</TableCell>
                          <TableCell className={getSeverityColor(session.risk_level)}>
                            {(session.threat_score * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityBadge(session.risk_level)}>{session.risk_level}</Badge>
                          </TableCell>
                          <TableCell>{session.events_count}</TableCell>
                          <TableCell>{session.duration_minutes.toFixed(1)}m</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {session.threat_types.slice(0, 2).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                              {session.threat_types.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{session.threat_types.length - 2}
                                </Badge>
                              )}
                            </div>
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
                  <CardTitle>Threat Type Distribution</CardTitle>
                  <CardDescription>Analysis of different threat types and their frequency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={threatTypeDistribution} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis
                          type="category"
                          dataKey="type"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Incident Count" />
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
