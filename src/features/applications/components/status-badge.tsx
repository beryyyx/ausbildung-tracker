import { Badge } from "@/components/badge";
import type { ApplicationStatus } from "@/db/schema";

import { STATUS_ICONS, STATUS_LABELS, STATUS_STYLES } from "../labels";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <Badge className={STATUS_STYLES[status]}>
      <Icon aria-hidden size={12} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
