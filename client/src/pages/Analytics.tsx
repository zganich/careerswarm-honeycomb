import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Analytics() {
  const { data: analytics, isLoading } = trpc.analytics.getOverview.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Mock data for charts (replace with real data from analytics API)
  const responseRateData = [
    { week: "Week 1", rate: 45 },
    { week: "Week 2", rate: 52 },
    { week: "Week 3", rate: 48 },
    { week: "Week 4", rate: 61 },
  ];

  const applicationsByStatusData = [
    { name: "Applied", value: analytics?.totalApplications || 0, color: "#3b82f6" },
    { name: "Interviewing", value: analytics?.interviewingCount || 0, color: "#10b981" },
    { name: "Offer", value: analytics?.offerCount || 0, color: "#f59e0b" },
    { name: "Rejected", value: analytics?.rejectedCount || 0, color: "#ef4444" },
  ];

  const topAchievementsData = analytics?.topAchievements?.map((a: any) => ({
    name: a.title?.substring(0, 30) + "..." || "Achievement",
    successRate: a.successRate || 0,
    timesUsed: a.timesUsed || 0,
  })) || [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your application performance and optimize your strategy
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.thisWeekApplications || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.responseRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.responseRateChange || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgResponseTime || 0} days</div>
            <p className="text-xs text-muted-foreground">
              Median time to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.interviewRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.interviewingCount || 0} active interviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Rate Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Response Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Response Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationsByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applicationsByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Achievements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Performing Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topAchievementsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
              <Bar dataKey="timesUsed" fill="#3b82f6" name="Times Used" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.insights?.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="text-sm">{insight}</p>
                </div>
              </div>
            )) || (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Strong Performance</p>
                    <p className="text-sm text-muted-foreground">
                      Your response rate is 15% above average. Keep highlighting quantifiable achievements in your applications.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Applications to Series B companies show 2x higher response rates. Consider targeting more mid-stage startups.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Top Achievement</p>
                    <p className="text-sm text-muted-foreground">
                      "425% pipeline growth" has a 92% success rate across 8 applications. Use this achievement prominently.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
