import type { ReactNode } from "react";

/** Сообщение над формой: общая ошибка или подтверждение сохранения. */
export function FormMessage({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: ReactNode;
}) {
  const styles =
    kind === "error"
      ? "border-danger-edge bg-danger-soft text-danger"
      : "border-success-edge bg-success-soft text-success";

  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-md border px-3 py-2 text-sm ${styles}`}
    >
      {children}
    </p>
  );
}
