import React from "react";
import { CheckCircle, Clock, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "published" | "pending" | "error" | "draft";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  published: {
    label: "Published",
    icon: CheckCircle,
    className: "status-published",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "status-pending",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "status-error",
  },
  draft: {
    label: "Draft",
    icon: Circle,
    className: "status-draft",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(config.className, "border", className)}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}