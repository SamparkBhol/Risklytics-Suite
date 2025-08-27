"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">Analytics Overview</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights across all risk modules</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>This page will contain comprehensive analytics and cross-module insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Analytics functionality will be implemented in the next phase
              </p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
