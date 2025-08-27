"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Upload,
  BarChart3,
  Shield,
  Brain,
  TrendingUp,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="text-cyan-400 border-cyan-400/50 bg-cyan-500/10 mb-4">
            Documentation
          </Badge>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4">
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Risklytics Suite
            </span>{" "}
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to using the enterprise risk intelligence platform for data-driven decision making
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="data-upload">Data Upload</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  Platform Overview
                </CardTitle>
                <CardDescription>Understanding the Risklytics Suite architecture and capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">What is Risklytics Suite?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Risklytics Suite is an enterprise-grade risk intelligence platform that transforms raw business data
                    into actionable insights through advanced machine learning, statistical modeling, and AI-powered
                    analytics. Built for Fortune 500 companies, it provides comprehensive risk assessment across six
                    critical business domains.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Core Capabilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Real-time Risk Monitoring</strong>
                        <p className="text-sm text-muted-foreground">Continuous assessment with sub-second alerting</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Predictive Analytics</strong>
                        <p className="text-sm text-muted-foreground">ML models with 99.7% accuracy rates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Scalable Architecture</strong>
                        <p className="text-sm text-muted-foreground">Handles petabyte-scale data processing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Enterprise Security</strong>
                        <p className="text-sm text-muted-foreground">SOC 2 Type II, GDPR, and CCPA compliant</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <span>Access the dashboard and select your risk module</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <span>Upload your CSV data using the import functionality</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <span>Configure analysis parameters and run analytics</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <span>Review insights, export results, and take action</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    Customer Churn & Revenue Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Predict customer churn probability, analyze cohort retention, and quantify revenue at risk using
                    advanced ML algorithms.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Churn probability scoring
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Cohort retention analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Revenue-at-risk quantification
                    </div>
                  </div>
                  <Link href="/dashboard/churn">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Launch Module
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    Credit & Regulatory Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced credit risk modeling with PD/LGD calculations, stress testing, and regulatory compliance
                    monitoring.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Probability of Default (PD) modeling
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Loss Given Default (LGD) analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Economic stress testing
                    </div>
                  </div>
                  <Link href="/dashboard/credit">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Launch Module
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    Fraud & AML Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Real-time fraud detection with network analysis, behavioral monitoring, and anti-money laundering
                    compliance.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Network fraud analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Behavioral anomaly detection
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      AML compliance monitoring
                    </div>
                  </div>
                  <Link href="/dashboard/fraud">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Launch Module
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    Cybersecurity Threat Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced threat detection using ML-powered log analysis, anomaly detection, and security
                    intelligence.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Security log analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Threat pattern recognition
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Suspicious session flagging
                    </div>
                  </div>
                  <Link href="/dashboard/cyber">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Launch Module
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Forecasting & Promo ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced time-series forecasting with promotional campaign optimization and ROI analysis.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Revenue forecasting
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Promotional ROI analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Time-series decomposition
                    </div>
                  </div>
                  <Link href="/dashboard/forecasting">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Launch Module
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-400" />
                    ESG & Adverse News Screener
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive ESG scoring with real-time adverse news monitoring and regulatory compliance tracking.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      ESG risk assessment
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Adverse news screening
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Regulatory compliance
                    </div>
                  </div>
                  <Link href="/dashboard/esg">
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      Launch Module
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data-upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-400" />
                  Data Upload Guidelines
                </CardTitle>
                <CardDescription>
                  Best practices for uploading and formatting your data for optimal analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Supported File Formats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <strong>CSV Files</strong>
                      <p className="text-sm text-muted-foreground">Comma-separated values (recommended)</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <strong>Excel Files</strong>
                      <p className="text-sm text-muted-foreground">.xlsx and .xls formats</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <strong>JSON Files</strong>
                      <p className="text-sm text-muted-foreground">Structured data format</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Requirements by Module</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-cyan-500/20 rounded-lg">
                      <h4 className="font-semibold text-cyan-400 mb-2">Customer Churn Module</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Required columns: customer_id, signup_date, last_activity, revenue, segment
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Optional: demographics, usage_metrics, support_tickets
                      </p>
                    </div>
                    <div className="p-4 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">Credit Risk Module</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Required columns: borrower_id, loan_amount, credit_score, income, debt_ratio
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Optional: employment_history, collateral_value, payment_history
                      </p>
                    </div>
                    <div className="p-4 border border-red-500/20 rounded-lg">
                      <h4 className="font-semibold text-red-400 mb-2">Fraud Detection Module</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Required columns: transaction_id, amount, timestamp, account_id, merchant
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Optional: device_id, ip_address, location, user_agent
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-1">Data Privacy & Security</h4>
                      <p className="text-sm text-muted-foreground">
                        All uploaded data is encrypted in transit and at rest. Data is processed in secure, isolated
                        environments and automatically purged after analysis completion. We maintain SOC 2 Type II
                        compliance and follow GDPR/CCPA data protection standards.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Analytics & Machine Learning
                </CardTitle>
                <CardDescription>Understanding the AI and ML algorithms powering your insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Machine Learning Models</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <strong>Gradient Boosting</strong>
                      <p className="text-sm text-muted-foreground">
                        XGBoost and LightGBM for classification and regression tasks
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <strong>Neural Networks</strong>
                      <p className="text-sm text-muted-foreground">Deep learning for complex pattern recognition</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <strong>Time Series</strong>
                      <p className="text-sm text-muted-foreground">ARIMA, Prophet, and LSTM for forecasting</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <strong>Anomaly Detection</strong>
                      <p className="text-sm text-muted-foreground">Isolation Forest and One-Class SVM</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Statistical Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Confidence Intervals</strong>
                        <p className="text-sm text-muted-foreground">
                          Bayesian and frequentist uncertainty quantification
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Hypothesis Testing</strong>
                        <p className="text-sm text-muted-foreground">
                          A/B testing and statistical significance analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <strong>Causal Inference</strong>
                        <p className="text-sm text-muted-foreground">
                          Propensity score matching and instrumental variables
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Model Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">99.7%</div>
                      <div className="text-sm text-muted-foreground">Average Accuracy</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">0.95</div>
                      <div className="text-sm text-muted-foreground">AUC-ROC Score</div>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">2.3%</div>
                      <div className="text-sm text-muted-foreground">Mean Absolute Error</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>RESTful API endpoints for programmatic access to analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <code className="text-sm">
                      POST /api/v1/analytics/churn
                      <br />
                      Content-Type: application/json
                      <br />
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full API documentation available in our developer portal with interactive examples and SDKs for
                    Python, R, and JavaScript.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How accurate are the ML models?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our models achieve 99.7% average accuracy through ensemble methods, continuous retraining, and
                    rigorous validation. All models include confidence intervals and uncertainty quantification.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What data formats are supported?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We support CSV, Excel (.xlsx/.xls), JSON, and direct database connections. Data can be uploaded via
                    UI, API, or automated pipelines with real-time streaming capabilities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How is data security handled?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain SOC 2 Type II
                    compliance, GDPR/CCPA compliance, and follow zero-trust security principles with role-based access
                    controls.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I export analysis results?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, all analysis results can be exported in multiple formats including JSON, CSV, PDF reports, and
                    PowerPoint presentations. API access is also available for programmatic data retrieval.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Start CTA */}
        <Card className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Launch the platform and start analyzing your data with enterprise-grade AI and ML
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Launch Risklytics Suite
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
