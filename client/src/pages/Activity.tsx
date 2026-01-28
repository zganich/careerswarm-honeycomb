import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  Bell,
  Calendar,
  CheckCircle,
  Mail,
  Star,
  MessageSquare,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function Activity() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery({ unreadOnly: false });
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow_up_due":
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case "response_received":
        return <Mail className="h-5 w-5 text-green-500" />;
      case "new_match":
        return <Star className="h-5 w-5 text-blue-500" />;
      case "note_added":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "follow_up_due":
        return "border-l-4 border-l-orange-500";
      case "response_received":
        return "border-l-4 border-l-green-500";
      case "new_match":
        return "border-l-4 border-l-blue-500";
      case "note_added":
        return "border-l-4 border-l-purple-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  const filteredNotifications = notifications?.filter((notif: any) => {
    if (filter === "all") return true;
    return notif.type === filter;
  });

  const handleMarkAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerSwarm</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => setLocation("/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={() => setLocation("/jobs")}>
              Jobs
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
          <p className="text-muted-foreground">
            All your notifications and updates in one place
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium">Filter:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="follow_up_due">Follow-ups Due</SelectItem>
              <SelectItem value="response_received">Responses</SelectItem>
              <SelectItem value="new_match">New Matches</SelectItem>
              <SelectItem value="note_added">Notes</SelectItem>
            </SelectContent>
          </Select>
          {filteredNotifications && (
            <span className="text-sm text-muted-foreground">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {filteredNotifications && filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif: any) => (
              <Card
                key={notif.id}
                className={`${getNotificationColor(notif.type)} ${
                  !notif.isRead ? "bg-blue-50/50" : ""
                } hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => {
                  if (!notif.isRead) {
                    handleMarkAsRead(notif.id);
                  }
                  if (notif.actionUrl) {
                    setLocation(notif.actionUrl);
                  }
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{notif.title}</h3>
                        <div className="flex items-center gap-2">
                          {!notif.isRead && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                      {notif.actionLabel && notif.actionUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(notif.actionUrl);
                          }}
                        >
                          {notif.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No activity yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your notifications and updates will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination (placeholder for future) */}
        {filteredNotifications && filteredNotifications.length > 20 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
