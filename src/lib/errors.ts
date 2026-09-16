/**
 * Ошибка внешнего сервиса с кодом kind: по нему интерфейс подбирает понятное
 * сообщение, сами тексты живут в labels.ts модуля. status — HTTP-статус, если был.
 */
export class KindError<Kind extends string> extends Error {
  constructor(
    readonly kind: Kind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
