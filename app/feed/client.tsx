"use client";

import { Activity } from "./server-actions";
import { ActivityItem } from "./activity-item";
import { Icon } from "@iconify/react";

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      {activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon
            icon="material-symbols:timeline-outline"
            className="text-6xl mx-auto mb-4 opacity-50"
          />
          <p className="text-lg">Nenhuma atividade encontrada</p>
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
