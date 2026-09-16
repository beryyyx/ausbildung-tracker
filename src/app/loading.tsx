/** Скелет на время перехода между страницами. Один файл покрывает все маршруты. */
export default function Loading() {
  return (
    <div aria-busy aria-label="Загрузка" className="animate-pulse space-y-stack">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-surface-muted" />
        <div className="h-4 w-72 max-w-full rounded-md bg-surface-muted" />
      </div>
      <div className="h-12 rounded-lg border border-edge bg-surface" />
      <div className="space-y-px overflow-hidden rounded-lg border border-edge bg-surface">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-row">
            <div className="h-4 w-1/4 rounded bg-surface-muted" />
            <div className="h-4 w-1/3 rounded bg-surface-muted" />
            <div className="h-4 w-1/6 rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
