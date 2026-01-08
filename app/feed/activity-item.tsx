import { Activity } from "./server-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { formatRelativeTime } from "@/lib/date-utils";
import { getProjectStatusLabel } from "@/enums/project-statuses";
import { getDocTypeLabel } from "@/enums/doc-types";
import Link from "next/link";

const activityIcons = {
  project: "material-symbols:folder-outline",
  task: "material-symbols:task-alt-rounded",
  sprint: "fluent:arrow-sprint-16-filled",
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

  // Special handling for tasks
  if (activity.type === "task") {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm">
          <span className="font-semibold">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">{action}</span>{" "}
          <span className="font-medium">uma tarefa</span>
        </div>
        {activity.entityName && (
          <p className="text-sm font-semibold text-foreground">
            {activity.entityName}
          </p>
        )}
        {activity.metadata?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {activity.metadata.description}
          </p>
        )}
      </div>
    );
  }

  // Special handling for sprints
  if (activity.type === "sprint") {
    const startDate = activity.metadata?.sprintStartDate
      ? new Date(activity.metadata.sprintStartDate).toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        )
      : "";
    const finishDate = activity.metadata?.sprintFinishDate
      ? new Date(activity.metadata.sprintFinishDate).toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        )
      : "";

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm">
          <span className="font-semibold">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">{action}</span>{" "}
          <span className="font-medium">uma sprint</span>
        </div>
        {activity.entityName && (
          <p className="text-sm font-semibold text-foreground">
            {activity.entityName}
          </p>
        )}
        {startDate && finishDate && (
          <p className="text-xs text-muted-foreground">
            {startDate} - {finishDate}
          </p>
        )}
        {activity.metadata?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {activity.metadata.description}
          </p>
        )}
      </div>
    );
  }

  // Special handling for documents
  if (activity.type === "doc" && activity.metadata?.docType) {
    const docTypeLabel = getDocTypeLabel(activity.metadata.docType);
    const formattedDate = activity.metadata.docDate
      ? new Date(activity.metadata.docDate).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm">
          <span className="font-semibold">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">{action}</span>{" "}
          <span className="font-medium">um documento</span>
        </div>
        <p className="text-sm font-semibold text-foreground">{docTypeLabel}</p>
        {formattedDate && (
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        )}
      </div>
    );
  }

  // Special handling for projects
  if (activity.type === "project") {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm">
          <span className="font-semibold">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">{action}</span>{" "}
          <span className="font-medium">um projeto</span>
        </div>
        {activity.entityName && (
          <p className="text-sm font-semibold text-foreground">
            {activity.entityName}
          </p>
        )}
        {activity.metadata?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {activity.metadata.description}
          </p>
        )}
      </div>
    );
  }

  // Default handling for other types (should not happen)
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
            <>
              {activity.metadata.projectId ? (
                <Link
                  href={`/projects/${activity.metadata.projectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-accent"
                  >
                    <Icon
                      icon="material-symbols:folder-outline"
                      className="mr-1"
                    />
                    {activity.metadata.projectName}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Icon
                    icon="material-symbols:folder-outline"
                    className="mr-1"
                  />
                  {activity.metadata.projectName}
                </Badge>
              )}
            </>
          )}
          {activity.metadata.sprintName && (
            <Badge variant="outline" className="text-xs">
              <Icon icon="material-symbols:sprint-outline" className="mr-1" />
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
              {getProjectStatusLabel(activity.metadata.status)}
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

  // Check if document is finished and has sprint/project info for linking
  const isDocFinished =
    activity.type === "doc" &&
    activity.metadata?.docFinishedAt &&
    activity.metadata?.docProjectId &&
    activity.metadata?.docSprintId;

  const docLink = isDocFinished
    ? `/projects/${activity.metadata?.docProjectId}/sprints/${activity.metadata?.docSprintId}/review`
    : null;

  const cardContent = (
    <div className="flex items-start gap-3 bg-card border rounded-lg p-4">
      <Avatar className="size-9">
        <AvatarImage src={activity.user.image || undefined} />
        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {getActivityDescription(activity)}
        <div className="text-xs text-muted-foreground mt-2">{relativeTime}</div>
      </div>

      {docLink && (
        <Icon
          icon="material-symbols:arrow-forward"
          className="text-xl text-muted-foreground group-hover:text-foreground transition-colors"
        />
      )}
    </div>
  );

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
        {docLink ? (
          <Link href={docLink} className="block">
            {cardContent}
          </Link>
        ) : (
          cardContent
        )}
      </div>
    </div>
  );
}
