import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-5xl font-semibold text-zinc-300">404</p>
      <h1 className="mt-4 text-xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Такой заявки или страницы нет. Возможно, запись уже удалена.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        К списку заявок
      </Link>
    </div>
  );
}
