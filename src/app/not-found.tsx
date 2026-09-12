import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-5xl font-semibold text-edge">404</p>
      <h1 className="mt-4 text-xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Такой заявки или страницы нет. Возможно, запись уже удалена.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-accent px-4 py-control text-sm font-medium text-accent-on hover:bg-accent-hover"
      >
        К списку заявок
      </Link>
    </div>
  );
}
