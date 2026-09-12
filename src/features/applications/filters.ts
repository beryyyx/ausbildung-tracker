import { z } from "zod";

import { APPLICATION_STATUSES, type ApplicationStatus } from "@/db/schema";

/** Фильтр списка заявок. Живёт в адресе страницы: /?status=draft&status=sent&q=bofrost */
export type ApplicationFilter = {
  statuses: ApplicationStatus[];
  q: string;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const toArray = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const statusSchema = z.enum(APPLICATION_STATUSES);

/** Разбирает параметры адреса. Неизвестные статусы отбрасываются, лишний текст обрезается. */
export function parseApplicationFilter(raw: RawSearchParams): ApplicationFilter {
  const statuses = toArray(raw.status).filter(
    (value): value is ApplicationStatus => statusSchema.safeParse(value).success,
  );
  const first = Array.isArray(raw.q) ? raw.q[0] : raw.q;
  return {
    statuses: [...new Set(statuses)],
    q: (first ?? "").trim().slice(0, 100),
  };
}

export function isFilterActive(filter: ApplicationFilter): boolean {
  return filter.statuses.length > 0 || filter.q !== "";
}
