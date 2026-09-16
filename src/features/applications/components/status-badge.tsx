import { Badge } from "@/components/badge";
import type { ApplicationStatus } from "@/db/schema";

import { STATUS_LABELS, STATUS_STYLES } from "../labels";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge dot className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
