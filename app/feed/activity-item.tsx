import { Activity } from "./server-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { formatRelativeTime } from "@/lib/date-utils";

const activityIcons = {
  project: "material-symbols:folder-outline",
  task: "material-symbols:task-alt-outline",
  sprint: "material-symbols:sprint-outline",
  doc: "material-symbols:description-outline",
};

const activityColors = {
  project: "text-blue-500",
  task: "text-green-500",
  sprint: "text-purple-500",
  doc: "text-orange-500",
};

function getActivityDescription(activity: Activity) {
  const action = activity.action === "created" ? "criou" : "atualizou";
  const entityType = {
    project: "o projeto",
    task: "a tarefa",
    sprint: "a sprint",
    doc: "o documento",
  }[activity.type];

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm">
        <span className="font-semibold">{activity.user.name}</span>{" "}
        <span className="text-muted-foreground">{action}</span>{" "}
        <span className="font-medium">{entityType}</span>{" "}
        {activity.entityName && (
          <span className="font-semibold text-foreground">
            {activity.entityName}
          </span>
        )}
      </div>
      {activity.metadata && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {activity.metadata.projectName && (
            <Badge variant="outline" className="text-xs">
              <Icon
                icon="material-symbols:folder-outline"
                className="mr-1"
              />
              {activity.metadata.projectName}
            </Badge>
          )}
          {activity.metadata.sprintName && (
            <Badge variant="outline" className="text-xs">
              <Icon
                icon="material-symbols:sprint-outline"
                className="mr-1"
              />
              {activity.metadata.sprintName}
            </Badge>
          )}
          {activity.metadata.tags && activity.metadata.tags.length > 0 && (
            <>
              {activity.metadata.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </>
          )}
          {activity.metadata.status && (
            <Badge variant="outline" className="text-xs">
              {activity.metadata.status}
            </Badge>
          )}
          {activity.metadata.docType && (
            <Badge variant="outline" className="text-xs capitalize">
              {activity.metadata.docType}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const userInitials = activity.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const relativeTime = formatRelativeTime(activity.timestamp);

  return (
    <div className="flex gap-4 group">
      {/* Timeline line and icon */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={`size-10 rounded-full bg-background border-2 border-border flex items-center justify-center ${
              activityColors[activity.type]
            }`}
          >
            <Icon icon={activityIcons[activity.type]} className="text-xl" />
          </div>
        </div>
        <div className="w-0.5 flex-1 bg-border mt-2 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start gap-3 bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <Avatar className="size-9">
            <AvatarImage src={activity.user.image || undefined} />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {getActivityDescription(activity)}
            <div className="text-xs text-muted-foreground mt-2">
              {relativeTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

