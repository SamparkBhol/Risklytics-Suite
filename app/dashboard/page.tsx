"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Upload, BarChart3, Shield, Network, Eye, TrendingUp, FileText, Activity, Zap } from "lucide-react"
import Link from "next/link"

const modules = [
  {
    title: "Customer Churn & Revenue Risk",
    description:
      "Upload customer data to analyze retention patterns, predict churn probability, and calculate revenue at risk across different customer segments.",
    href: "/dashboard/churn",
    icon: BarChart3,
    features: ["Cohort Retention Analysis", "Churn Probability Heatmap", "Revenue-at-Risk Metrics"],
    status: "Ready",
    color: "from-chart-1/20 to-chart-1/5",
  },
  {
    title: "Credit & Regulatory Risk",
    description:
      "Assess credit portfolios with advanced PD/LGD modeling, stress testing capabilities, and regulatory compliance monitoring.",
    href: "/dashboard/credit",
    icon: Shield,
    features: ["PD/LGD Computation", "Portfolio Expected Loss", "Stress Testing Scenarios"],
    status: "Ready",
    color: "from-chart-2/20 to-chart-2/5",
  },
  {
    title: "Fraud & AML Monitoring",
    description:
      "Detect suspicious activities through network analysis, behavioral patterns, and real-time transaction monitoring.",
    href: "/dashboard/fraud",
    icon: Network,
    features: ["Network Graph Analysis", "Suspicious Cluster Detection", "Anomaly Alerts"],
    status: "Ready",
    color: "from-chart-3/20 to-chart-3/5",
  },
  {
    title: "Cybersecurity Threat Intelligence",
    description:
      "Monitor security logs for anomalies, visualize threat patterns, and identify suspicious sessions with ML-powered detection.",
    href: "/dashboard/cyber",
    icon: Eye,
    features: ["Time-series Anomaly Detection", "Embedding Projections", "Threat Session Flagging"],
    status: "Ready",
    color: "from-chart-4/20 to-chart-4/5",
  },
  {
    title: "Forecasting & Promo ROI",
    description: "Optimize promotional strategies with advanced forecasting models and ROI simulation capabilities.",
    href: "/dashboard/forecasting",
    icon: TrendingUp,
    features: ["Baseline vs Promo Forecasting", "ROI Simulation", "Profit/Loss Impact Analysis"],
    status: "Ready",
    color: "from-chart-5/20 to-chart-5/5",
  },
  {
    title: "ESG & Adverse News Screener",
    description:
      "Monitor ESG compliance and adverse news with sentiment analysis, risk scoring, and automated screening.",
    href: "/dashboard/esg",
    icon: FileText,
    features: ["Sentiment Trend Analysis", "Risk Topic Word Clouds", "Company Risk Scoring"],
    status: "Ready",
    color: "from-primary/20 to-primary/5",
  },
]

const insights = [
  {
    title: "High-Risk Customer Segment Identified",
    description: "Enterprise customers in the technology sector show 23% higher churn probability this quarter.",
    type: "warning",
    module: "Customer Churn",
  },
  {
    title: "Credit Portfolio Stress Test Alert",
    description: "Under 15% unemployment scenario, expected losses could increase by $1.2M.",
    type: "critical",
    module: "Credit Risk",
  },
  {
    title: "Fraud Network Detected",
    description: "Suspicious transaction cluster involving 47 accounts flagged for investigation.",
    type: "critical",
    module: "Fraud Detection",
  },
  {
    title: "Promotional Campaign Optimization",
    description: "Q4 holiday campaign shows 34% higher ROI potential with adjusted targeting.",
    type: "success",
    module: "Forecasting",
  },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-balance">
            Enterprise Risk & Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced analytics platform for comprehensive risk assessment and business intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-accent border-accent/50">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Badge variant="outline">
            <Zap className="w-3 h-3 mr-1" />
            Real-time Processing Active
          </Badge>
        </div>
      </div>

      {/* Auto Insights */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-space-grotesk)]">
            <Activity className="h-5 w-5 text-accent" />
            Auto Insights Summary
          </CardTitle>
          <CardDescription>
            AI-powered insights automatically generated from your latest data uploads and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === "critical"
                    ? "border-destructive/20 bg-destructive/5"
                    : insight.type === "warning"
                      ? "border-chart-2/20 bg-chart-2/5"
                      : "border-accent/20 bg-accent/5"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {insight.module}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">Risk Analysis Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.href}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-accent/50"
              >
                <CardHeader className={`bg-gradient-to-br ${module.color} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-background/80 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="bg-background/80">
                      {module.status}
                    </Badge>
                  </div>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">{module.title}</CardTitle>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {module.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-accent rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1 group-hover:bg-accent group-hover:text-accent-foreground">
                        <Link href={module.href}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Data
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={module.href}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
