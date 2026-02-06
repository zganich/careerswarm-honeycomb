import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, CheckCircle, Sparkles, Calendar, Mail } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const { data: notifications } = trpc.notifications.list.useQuery({
    unreadOnly: false,
  });
  const markAsRead = trpc.notifications.markAsRead.useMutation();
  const utils = trpc.useUtils();

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = async (id: number) => {
    await markAsRead.mutateAsync({ id });
    utils.notifications.list.invalidate();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "follow_up_due":
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case "response_received":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "new_match":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                  onClick={() =>
                    !notification.isRead && handleMarkAsRead(notification.id)
                  }
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type || "")}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.createdAt &&
                          formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                      </p>
                      {notification.applicationId && (
                        <Link
                          href={`/applications/${notification.applicationId}`}
                        >
                          <Button
                            size="sm"
                            variant="link"
                            className="h-auto p-0 mt-1"
                          >
                            View Application →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
