import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Download,
  Upload,
  Building2,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

// Mock data for demo - will be replaced with real API
const mockStats = {
  totalUsers: 47,
  activeUsers: 32,
  totalApplications: 156,
  avgApplicationsPerUser: 4.9,
  avgTimeToFirstApp: "2.3 days",
  placementRate: "18%",
};

const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    joinedAt: "2026-01-15",
    applications: 8,
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    joinedAt: "2026-01-18",
    applications: 12,
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "e.rodriguez@email.com",
    joinedAt: "2026-01-20",
    applications: 5,
    status: "active",
    lastActive: "3 hours ago",
  },
  {
    id: 4,
    name: "David Kim",
    email: "d.kim@email.com",
    joinedAt: "2026-01-22",
    applications: 3,
    status: "inactive",
    lastActive: "5 days ago",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "l.thompson@email.com",
    joinedAt: "2026-01-25",
    applications: 6,
    status: "placed",
    lastActive: "1 week ago",
  },
];

const mockWeeklyData = [
  { week: "Week 1", users: 12, applications: 34 },
  { week: "Week 2", users: 18, applications: 52 },
  { week: "Week 3", users: 28, applications: 78 },
  { week: "Week 4", users: 47, applications: 156 },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "import">(
    "overview"
  );

  // Check if user is admin (for now, allow access - will add auth later)
  const { data: user } = trpc.auth.me.useQuery();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation("/dashboard")}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Workforce Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  Pilot Program Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Job Seekers", icon: Users },
              { id: "import", label: "Import Users", icon: Upload },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-orange-100 text-orange-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {mockStats.totalUsers}
                      </p>
                      <p className="text-xs text-slate-600">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {mockStats.activeUsers}
                      </p>
                      <p className="text-xs text-slate-600">Active (7d)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {mockStats.totalApplications}
                      </p>
                      <p className="text-xs text-slate-600">Applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {mockStats.avgApplicationsPerUser}
                      </p>
                      <p className="text-xs text-slate-600">Avg/User</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {mockStats.avgTimeToFirstApp}
                      </p>
                      <p className="text-xs text-slate-600">Time to 1st App</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {mockStats.placementRate}
                      </p>
                      <p className="text-xs text-slate-600">Placed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>
                  User enrollment and application activity over the pilot period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWeeklyData.map((week) => (
                    <div key={week.week} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-slate-600">
                        {week.week}
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <div
                            className="h-6 bg-blue-500 rounded"
                            style={{
                              width: `${(week.users / 50) * 100}%`,
                              minWidth: "20px",
                            }}
                          />
                          <span className="text-sm text-slate-600">
                            {week.users} users
                          </span>
                        </div>
                        <div className="flex gap-2 items-center mt-1">
                          <div
                            className="h-6 bg-purple-500 rounded"
                            style={{
                              width: `${(week.applications / 200) * 100}%`,
                              minWidth: "20px",
                            }}
                          />
                          <span className="text-sm text-slate-600">
                            {week.applications} apps
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user actions in the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      user: "Sarah Johnson",
                      action: "Generated application package",
                      target: "Senior PM at TechCorp",
                      time: "2 hours ago",
                    },
                    {
                      user: "Michael Chen",
                      action: "Completed Master Profile",
                      target: "",
                      time: "4 hours ago",
                    },
                    {
                      user: "Emily Rodriguez",
                      action: "Generated application package",
                      target: "Data Analyst at FinanceInc",
                      time: "5 hours ago",
                    },
                    {
                      user: "Lisa Thompson",
                      action: "Marked as Placed",
                      target: "Marketing Manager at RetailCo",
                      time: "1 day ago",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {activity.user}
                        </p>
                        <p className="text-sm text-slate-600">
                          {activity.action}
                          {activity.target && (
                            <span className="text-slate-400">
                              {" "}
                              — {activity.target}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Seekers</CardTitle>
                  <CardDescription>
                    All users enrolled in the pilot program
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-slate-600">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.joinedAt}
                      </TableCell>
                      <TableCell>{user.applications}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "placed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.lastActive}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "import" && (
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import Job Seekers</CardTitle>
              <CardDescription>
                Upload a CSV file to add multiple users to the pilot program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Upload CSV File
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  CSV should include: name, email (required), phone (optional)
                </p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-medium text-slate-900 mb-2">
                  CSV Format Example
                </h4>
                <div className="bg-slate-100 rounded-lg p-4 font-mono text-sm">
                  <p>name,email,phone</p>
                  <p>John Smith,john@email.com,555-123-4567</p>
                  <p>Jane Doe,jane@email.com,</p>
                  <p>Bob Wilson,bob@email.com,555-987-6543</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  What happens after import?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Users receive an email invitation to set up their account</li>
                  <li>• They can immediately start building their Master Profile</li>
                  <li>• You'll see them appear in the Job Seekers tab</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
