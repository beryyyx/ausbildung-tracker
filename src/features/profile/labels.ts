import type {
  LanguageLevel,
  SchoolDegree,
  ZeugnisScale,
  ZeugnisSlot,
} from "@/db/schema";

export const PROFILE_FIELD_LABELS = {
  firstName: "Имя",
  lastName: "Фамилия",
  birthDate: "Дата рождения",
  street: "Улица и дом",
  postalCode: "Индекс (PLZ)",
  city: "Город",
  phone: "Телефон",
  email: "Email",
  schoolName: "Школа",
  schoolDegree: "Schulabschluss",
  graduationYear: "Год окончания",
} as const;

export const SCHOOL_DEGREE_LABELS: Record<SchoolDegree, string> = {
  hauptschulabschluss: "Hauptschulabschluss",
  mittlerer_schulabschluss: "Mittlerer Schulabschluss (FOR)",
  for_mit_qualifikation: "FOR mit Qualifikation (FORQ)",
  fachhochschulreife: "Fachhochschulreife",
  abitur: "Abitur",
};

export const ZEUGNIS_SLOT_LABELS: Record<ZeugnisSlot, string> = {
  latest: "Последний Zeugnis",
  previous: "Предпоследний Zeugnis",
};

export const ZEUGNIS_SCALE_LABELS: Record<ZeugnisScale, string> = {
  sek1: "оценки 1–6",
};

export const ZEUGNIS_FIELD_LABELS = {
  title: "Название Zeugnis",
} as const;

export const GRADE_FIELD_LABELS = {
  subject: "Предмет",
  grade: "Оценка",
} as const;

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
  c2: "C2",
  native: "Родной",
};

export const LANGUAGE_FIELD_LABELS = {
  language: "Язык",
  level: "Уровень",
} as const;

export const INTERNSHIP_FIELD_LABELS = {
  company: "Компания",
  field: "Сфера",
  startDate: "Начало",
  endDate: "Окончание",
  description: "Описание",
} as const;

export const FILE_FIELD_LABELS = {
  file: "PDF-файл",
} as const;

export const SECTION_TITLES = {
  personal: "Личные данные",
  school: "Школа",
  grades: "Оценки",
  languages: "Языки",
  internships: "Praktika",
  files: "Файлы",
} as const;

export const PROFILE_TEXTS = {
  pageTitle: "Профиль",
  pageHint:
    "Данные для будущей генерации Anschreiben. Всё хранится локально, на этом компьютере.",
  personalHint: "Контакты и школа попадут в шапку Anschreiben.",
  gradesHint: "Два последних Zeugnis: название и оценки по предметам.",
  addLanguage: "Добавить язык",
  addInternship: "Добавить практику",
  addGrade: "Добавить оценку",
  count: {
    languages: ["язык", "языка", "языков"],
    internships: ["практика", "практики", "практик"],
    files: ["файл", "файла", "файлов"],
  },
  save: "Сохранить",
  saving: "Сохраняем…",
  saved: "Сохранено",
  add: "Добавить",
  adding: "Добавляем…",
  delete: "Удалить",
  deleting: "Удаляем…",
  upload: "Загрузить",
  uploading: "Загружаем…",
  open: "Открыть",
  emptyGrades: "Оценок пока нет",
  emptyGradesHint: "Добавьте предметы из этого Zeugnis ниже.",
  emptyLanguages: "Языков пока нет",
  emptyLanguagesHint: "Немецкий, английский, родной: с уровнем по шкале A1–C2.",
  emptyInternships: "Практик пока нет",
  emptyInternshipsHint: "Schülerpraktikum и другой опыт пригодятся в Anschreiben.",
  emptyFiles: "Файлов пока нет",
  emptyFilesHint: "Свидетельства и сертификаты в PDF, чтобы прикладывать к заявкам.",
  filesHint: "Только PDF, до 10 МБ на файл. Файлы лежат в папке uploads/ рядом с проектом.",
  confirmDeleteFile: "Удалить файл? Он будет стёрт с диска.",
  zeugnisTitlePlaceholder: "например, Klasse 10, Abschlusszeugnis 2026",
  internshipOngoing: "по настоящее время",
  internshipNoDates: "даты не указаны",
} as const;
