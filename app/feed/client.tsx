"use client";

import { Activity } from "./server-actions";
import { ActivityItem } from "./activity-item";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  // Extract unique users with their last activity
  const usersWithLastActivity = useMemo(() => {
    const usersMap = new Map<
      string,
      { user: Activity["user"]; lastActivity: Activity | null }
    >();

    activities.forEach((activity) => {
      const existing = usersMap.get(activity.user.id);
      if (!existing) {
        usersMap.set(activity.user.id, {
          user: activity.user,
          lastActivity: activity,
        });
      } else if (
        !existing.lastActivity ||
        activity.timestamp > existing.lastActivity.timestamp
      ) {
        existing.lastActivity = activity;
      }
    });

    return Array.from(usersMap.values()).sort((a, b) =>
      a.user.name.localeCompare(b.user.name)
    );
  }, [activities]);

  // Filter activities based on selected user
  const filteredActivities = useMemo(() => {
    if (selectedUserId === "all") {
      return activities;
    }
    return activities.filter((activity) => activity.user.id === selectedUserId);
  }, [activities, selectedUserId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main Feed - Left Column */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {selectedUserId === "all"
              ? "Todas as atividades"
              : `Atividades de ${
                  usersWithLastActivity.find(
                    (u) => u.user.id === selectedUserId
                  )?.user.name
                }`}
          </h2>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon
              icon="material-symbols:timeline-outline"
              className="text-6xl mx-auto mb-4 opacity-50"
            />
            <p className="text-lg">Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Users Sidebar - Right Column */}
      <div className="space-y-4 pr-8">
        <div className="sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Usuários</h2>

          {/* "All Users" Option */}
          <div
            onClick={() => setSelectedUserId("all")}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
              selectedUserId === "all" && "bg-accent border-primary"
            )}
          >
            <div className="flex-1">
              <p className="font-medium">Todos os usuários</p>
              <p className="text-xs text-muted-foreground">
                {activities.length} atividades
              </p>
            </div>
          </div>

          {/* Individual Users */}
          <div className="space-y-2 mt-2">
            {usersWithLastActivity.map(({ user, lastActivity }) => (
              <div
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
                  selectedUserId === user.id && "bg-accent border-primary"
                )}
              >
                <Avatar className="size-8">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  {lastActivity ? (
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(lastActivity.timestamp)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma atividade
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
