"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  DollarSign,
  Plane,
  TrendingUp,
  Users,
  MapPin,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { analyticsAPI } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { hasServiceRoleAccess } from "@/lib/supabase"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeReservations: 0,
    totalTrips: 0,
    totalUsers: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Check if we have proper database access
      if (!hasServiceRoleAccess()) {
        console.warn("Service role key not available, some features may be limited")
      }

      // Load stats and transactions
      const statsData = await analyticsAPI.getDashboardStats()
      setStats(statsData)

      const transactionsData = await analyticsAPI.getRecentTransactions()
      setRecentTransactions(transactionsData)

      // Check if we're using mock data
      if (statsData.totalRevenue === 4250000 && statsData.activeReservations === 239) {
        setUsingMockData(true)
        toast({
          title: "Using Sample Data",
          description: "Database connection limited. Showing sample data for demonstration.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setUsingMockData(true)
      toast({
        title: "Connection Issue",
        description: "Unable to connect to database. Showing sample data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()} DZD`,
      change: "+18.5%",
      trend: "up",
      icon: DollarSign,
      href: "/dashboard/analytics",
    },
    {
      title: "Active Reservations",
      value: stats.activeReservations.toString(),
      change: "+12.3%",
      trend: "up",
      icon: Calendar,
      href: "/dashboard/reservations",
    },
    {
      title: "Total Trips",
      value: stats.totalTrips.toString(),
      change: "+4.2%",
      trend: "up",
      icon: Plane,
      href: "/dashboard/trips",
    },
    {
      title: "Registered Users",
      value: stats.totalUsers.toString(),
      change: "+22.1%",
      trend: "up",
      icon: Users,
      href: "/dashboard/users",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your travel agency.</p>
          {usingMockData && (
            <div className="flex items-center gap-2 mt-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Currently showing sample data</span>
            </div>
          )}
        </div>
        <Link href="/dashboard/trips">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MapPin className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center text-xs text-gray-600">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">{stat.change}</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Recent Reservations</CardTitle>
              <CardDescription>Latest bookings and reservations</CardDescription>
            </div>
            <Link href="/dashboard/reservations">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.full_name}</TableCell>
                    <TableCell>{transaction.trip?.name || "Unknown Trip"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "CONFIRMED"
                            ? "default"
                            : transaction.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          transaction.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : transaction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent reservations found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/reservations">
          <Card className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Calendar className="h-5 w-5" />
                Manage Reservations
              </CardTitle>
              <CardDescription>View and manage all customer bookings</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/trips">
          <Card className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Plane className="h-5 w-5" />
                Create New Trip
              </CardTitle>
              <CardDescription>Add new travel packages and destinations</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
                View Analytics
              </CardTitle>
              <CardDescription>Analyze performance and revenue trends</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
