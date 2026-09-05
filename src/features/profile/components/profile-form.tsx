"use client";

import { useActionState, type ComponentProps } from "react";

import { Field, inputClass } from "@/components/form/field";
import { FormMessage } from "@/components/form/form-message";

import {
  PROFILE_FIELD_LABELS,
  PROFILE_TEXTS,
  SCHOOL_DEGREE_LABELS,
  SECTION_TITLES,
} from "../labels";
import type {
  ProfileField,
  ProfileFormState,
  ProfileFormValues,
} from "../validation";

type Props = {
  action: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  initialValues?: Partial<ProfileFormValues>;
};

const EMPTY_VALUES: ProfileFormValues = {
  firstName: "",
  lastName: "",
  birthDate: "",
  street: "",
  postalCode: "",
  city: "",
  phone: "",
  email: "",
  schoolName: "",
  schoolDegree: "",
  graduationYear: "",
};

/** Личные данные и школа: одна форма, один Server Action. После сохранения остаёмся на странице. */
export function ProfileForm({ action, initialValues }: Props) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    action,
    {},
  );

  const values: ProfileFormValues = {
    ...EMPTY_VALUES,
    ...initialValues,
    ...state.values,
  };

  const errorOf = (field: ProfileField) => state.errors?.[field]?.[0];

  const textInput = (
    field: ProfileField,
    extra?: Partial<ComponentProps<"input">>,
  ) => (
    <input
      id={field}
      name={field}
      type="text"
      defaultValue={values[field]}
      aria-invalid={Boolean(errorOf(field))}
      className={inputClass}
      {...extra}
    />
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && <FormMessage kind="error">{state.message}</FormMessage>}
      {state.saved && !state.message && (
        <FormMessage kind="success">{PROFILE_TEXTS.saved}</FormMessage>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{SECTION_TITLES.personal}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="firstName"
            label={PROFILE_FIELD_LABELS.firstName}
            error={errorOf("firstName")}
            required
          >
            {textInput("firstName", { required: true, autoComplete: "given-name" })}
          </Field>
          <Field
            name="lastName"
            label={PROFILE_FIELD_LABELS.lastName}
            error={errorOf("lastName")}
            required
          >
            {textInput("lastName", { required: true, autoComplete: "family-name" })}
          </Field>
          <Field
            name="birthDate"
            label={PROFILE_FIELD_LABELS.birthDate}
            error={errorOf("birthDate")}
          >
            {textInput("birthDate", { type: "date" })}
          </Field>
          <Field
            name="phone"
            label={PROFILE_FIELD_LABELS.phone}
            error={errorOf("phone")}
          >
            {textInput("phone", { type: "tel", autoComplete: "tel" })}
          </Field>
          <Field
            name="street"
            label={PROFILE_FIELD_LABELS.street}
            error={errorOf("street")}
            className="sm:col-span-2"
          >
            {textInput("street", { autoComplete: "street-address" })}
          </Field>
          <Field
            name="postalCode"
            label={PROFILE_FIELD_LABELS.postalCode}
            error={errorOf("postalCode")}
          >
            {textInput("postalCode", { inputMode: "numeric", autoComplete: "postal-code" })}
          </Field>
          <Field
            name="city"
            label={PROFILE_FIELD_LABELS.city}
            error={errorOf("city")}
          >
            {textInput("city", { autoComplete: "address-level2" })}
          </Field>
          <Field
            name="email"
            label={PROFILE_FIELD_LABELS.email}
            error={errorOf("email")}
            className="sm:col-span-2"
          >
            {textInput("email", { type: "email", autoComplete: "email" })}
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{SECTION_TITLES.school}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="schoolName"
            label={PROFILE_FIELD_LABELS.schoolName}
            error={errorOf("schoolName")}
            className="sm:col-span-2"
          >
            {textInput("schoolName")}
          </Field>
          <Field
            name="schoolDegree"
            label={PROFILE_FIELD_LABELS.schoolDegree}
            error={errorOf("schoolDegree")}
          >
            <select
              id="schoolDegree"
              name="schoolDegree"
              defaultValue={values.schoolDegree}
              aria-invalid={Boolean(errorOf("schoolDegree"))}
              className={inputClass}
            >
              <option value="">—</option>
              {Object.entries(SCHOOL_DEGREE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            name="graduationYear"
            label={PROFILE_FIELD_LABELS.graduationYear}
            error={errorOf("graduationYear")}
          >
            {textInput("graduationYear", {
              type: "number",
              inputMode: "numeric",
              min: 1990,
              max: 2100,
              placeholder: "например, 2027",
            })}
          </Field>
        </div>
      </section>

      <div className="border-t border-zinc-200 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? PROFILE_TEXTS.saving : PROFILE_TEXTS.save}
        </button>
      </div>
    </form>
  );
}
