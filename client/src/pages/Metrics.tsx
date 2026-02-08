import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function Metrics() {
  // Fetch agent metrics
  const { data: agentMetrics, isLoading: metricsLoading } =
    trpc.analytics.getAgentMetrics.useQuery({
      hours: 24,
    });

  // Fetch package success rate
  const { data: packageStats, isLoading: packageLoading } =
    trpc.analytics.getPackageSuccessRate.useQuery({
      hours: 24,
    });

  const isLoading = metricsLoading || packageLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Production Metrics
        </h1>
        <p className="text-slate-600 mt-1">
          Monitor agent performance and package generation success rates
        </p>
      </div>

      {/* Package Success Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Package Generation Success Rate
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          {packageLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : packageStats ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">
                  {packageStats.successRate}%
                </span>
                <span className="text-slate-600">success rate</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-slate-600">Total Attempts</div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {packageStats.totalAttempts}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Successful</div>
                  <div className="text-2xl font-semibold text-green-600">
                    {packageStats.successful}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Failed</div>
                  <div className="text-2xl font-semibold text-red-600">
                    {packageStats.failed}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-600">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Agent Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricsLoading ? (
          <>
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : agentMetrics &&
          Array.isArray(agentMetrics) &&
          agentMetrics.length > 0 ? (
          agentMetrics.map((agent: any) => {
            const successRate = parseFloat(agent.successRate || "0");
            const avgDuration = parseFloat(agent.avgDuration || "0");
            const totalExecutions = parseInt(agent.totalExecutions || "0", 10);
            const successfulExecutions = parseInt(
              agent.successfulExecutions || "0",
              10
            );

            return (
              <Card key={agent.agentType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Activity className="w-5 h-5 text-orange-600" />
                    {agent.agentType} Agent
                  </CardTitle>
                  <CardDescription>Last 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Success Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">
                        Success Rate
                      </span>
                      <span className="text-lg font-semibold text-slate-900">
                        {successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(successRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Avg Duration */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Avg Duration
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {(avgDuration / 1000).toFixed(1)}s
                    </span>
                  </div>

                  {/* Executions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {successfulExecutions} successful
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <XCircle className="w-4 h-4 text-red-600" />
                      {totalExecutions - successfulExecutions} failed
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-3">
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No agent metrics available yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Metrics will appear after you generate your first application
                package
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Real-time Performance Monitoring
              </p>
              <p className="text-sm text-blue-700 mt-1">
                These metrics track the performance of Tailor (resume
                generation), Scribe (outreach writing), and Assembler (package
                creation) agents. Use this data to identify bottlenecks and
                optimize your application workflow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Metrics;
