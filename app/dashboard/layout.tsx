"use client"

import type React from "react"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Network,
  Eye,
  TrendingUp,
  FileText,
  Activity,
  DollarSign,
  Users,
  AlertTriangle,
  Home,
  Terminal,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    title: "Customer Churn & Revenue Risk",
    href: "/dashboard/churn",
    icon: Users,
    description: "Cohort retention & revenue-at-risk analysis",
  },
  {
    title: "Credit & Regulatory Risk",
    href: "/dashboard/credit",
    icon: Shield,
    description: "PD/LGD modeling & stress testing",
  },
  {
    title: "Fraud & AML Monitoring",
    href: "/dashboard/fraud",
    icon: Network,
    description: "Network analysis & suspicious activity detection",
  },
  {
    title: "Cybersecurity Threat Intelligence",
    href: "/dashboard/cyber",
    icon: Eye,
    description: "Anomaly detection & threat analysis",
  },
  {
    title: "Forecasting & Promo ROI",
    href: "/dashboard/forecasting",
    icon: TrendingUp,
    description: "Sales forecasting & promotional impact analysis",
  },
  {
    title: "ESG & Adverse News Screener",
    href: "/dashboard/esg",
    icon: FileText,
    description: "Sentiment analysis & risk scoring",
  },
]

const kpiMetrics = [
  {
    title: "Total Risk Score",
    value: "7.2",
    change: "+0.3",
    trend: "up",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    title: "Revenue at Risk",
    value: "$2.4M",
    change: "-$180K",
    trend: "down",
    icon: DollarSign,
    color: "text-chart-1",
  },
  {
    title: "Active Threats",
    value: "23",
    change: "+5",
    trend: "up",
    icon: Shield,
    color: "text-chart-2",
  },
  {
    title: "Model Accuracy",
    value: "94.7%",
    change: "+1.2%",
    trend: "up",
    icon: Activity,
    color: "text-accent",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#1e1e1e]">
        <Sidebar variant="inset" className="border-r border-[#3e3e42] bg-[#252526]">
          <SidebarHeader className="border-b border-[#3e3e42] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#007acc] to-[#4fc1ff] rounded flex items-center justify-center">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold font-mono text-lg text-[#d4d4d4]">Risklytics Suite</h2>
                  <p className="text-xs text-[#858585] font-mono">Enterprise Risk Intelligence</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-[#858585] hover:text-[#d4d4d4] hover:bg-[#3e3e42]">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 bg-[#252526]">
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-auto p-3 flex-col items-start gap-1 font-mono ${
                        isActive
                          ? "bg-[#007acc]/20 text-[#4fc1ff] border-l-2 border-[#007acc]"
                          : "text-[#d4d4d4] hover:bg-[#3e3e42] hover:text-[#4fc1ff]"
                      }`}
                    >
                      <Link href={item.href}>
                        <div className="flex items-center gap-2 w-full">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-[#858585] text-left w-full font-mono">{item.description}</p>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 bg-[#1e1e1e]">
          <header className="sticky top-0 z-10 bg-[#2d2d30]/95 backdrop-blur border-b border-[#3e3e42]">
            <div className="flex items-center gap-4 p-4">
              <SidebarTrigger className="text-[#d4d4d4] hover:text-[#4fc1ff]" />
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpiMetrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                      <Card
                        key={metric.title}
                        className="bg-[#252526] border-[#3e3e42] hover:border-[#007acc]/50 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-[#858585] font-medium font-mono">{metric.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xl font-bold font-mono text-[#d4d4d4]">{metric.value}</span>
                                <Badge
                                  variant={metric.trend === "up" ? "destructive" : "default"}
                                  className={`text-xs font-mono ${
                                    metric.trend === "up"
                                      ? "bg-[#f44747]/20 text-[#f44747] border-[#f44747]/30"
                                      : "bg-[#4ec9b0]/20 text-[#4ec9b0] border-[#4ec9b0]/30"
                                  }`}
                                >
                                  {metric.change}
                                </Badge>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded bg-[#3e3e42] flex items-center justify-center">
                              <Icon className="h-4 w-4 text-[#858585]" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 bg-[#1e1e1e] text-[#d4d4d4]">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
