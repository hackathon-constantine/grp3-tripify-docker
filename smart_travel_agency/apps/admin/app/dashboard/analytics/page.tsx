"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Calendar } from "lucide-react"

const monthlyData = [
  { month: "Jan", revenue: 385000, bookings: 28, users: 15 },
  { month: "Feb", revenue: 442000, bookings: 35, users: 22 },
  { month: "Mar", revenue: 398000, bookings: 31, users: 18 },
  { month: "Apr", revenue: 567000, bookings: 42, users: 28 },
  { month: "May", revenue: 634000, bookings: 48, users: 35 },
  { month: "Jun", revenue: 721000, bookings: 55, users: 31 },
]

const topTrips = [
  { name: "Tassili N'Ajjer Rock Art Tour", bookings: 28, revenue: "2,380,000 DZD", growth: "+22%" },
  { name: "Hoggar Mountains Expedition", bookings: 18, revenue: "2,160,000 DZD", growth: "+15%" },
  { name: "Casbah of Algiers Walking Tour", bookings: 45, revenue: "1,575,000 DZD", growth: "+8%" },
  { name: "Timgad Roman Ruins Discovery", bookings: 22, revenue: "1,430,000 DZD", growth: "+12%" },
  { name: "M'zab Valley Cultural Journey", bookings: 15, revenue: "1,125,000 DZD", growth: "+18%" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Track your travel agency's performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4,250,000 DZD</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+18.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">239</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">67,850 DZD</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">28.4%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              <span>-1.2% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                    <div className="flex-1">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${(data.revenue / Math.max(...monthlyData.map((d) => d.revenue))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{data.revenue.toLocaleString()} DZD</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Booking Trend</CardTitle>
            <CardDescription>Monthly bookings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                    <div className="flex-1">
                      <div
                        className="h-2 bg-green-600 rounded-full"
                        style={{
                          width: `${(data.bookings / Math.max(...monthlyData.map((d) => d.bookings))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{data.bookings} bookings</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Trips */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Top Performing Trips</CardTitle>
          <CardDescription>Best performing travel packages by revenue and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTrips.map((trip, index) => (
              <div key={trip.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{trip.name}</div>
                    <div className="text-sm text-gray-500">{trip.bookings} bookings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{trip.revenue}</div>
                  <Badge
                    className={trip.growth.startsWith("+") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {trip.growth}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
