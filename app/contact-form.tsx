"use client";

import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { useEffect, useRef, useState, type RefObject } from "react";
import { contactSchema, type ContactValues } from "./contact-schema";

const emptyContact: ContactValues = { name: "", email: "", message: "" };
const fieldOrder = ["name", "email", "message"] as const;
type FieldName = (typeof fieldOrder)[number];

function firstMessage(errors: readonly unknown[]): string | undefined {
  for (const error of errors) {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  }
  return undefined;
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const controls: Record<FieldName, RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Without JavaScript the browser's own required/email checks guard the form.
  useEffect(() => {
    if (formRef.current) formRef.current.noValidate = true;
  }, []);

  const form = useForm({
    defaultValues: emptyContact,
    // Check on submit, then re-check while the person corrects each field.
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    validators: { onDynamic: contactSchema },
    onSubmit: ({ value, formApi }) => {
      // Honest demo: nothing is sent or stored anywhere.
      setSentTo(value.name.trim());
      formApi.reset();
    },
    onSubmitInvalid: ({ formApi }) => {
      const firstInvalid = fieldOrder.find((name) => formApi.getFieldMeta(name)?.errors.length);
      if (firstInvalid) controls[firstInvalid].current?.focus();
    },
  });
  const attempted = useStore(form.store, (state) => state.submissionAttempts > 0);

  return (
    <form
      ref={formRef}
      className="contact-form"
      action="?#contact-demo-note"
      aria-label="Contact Adam"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {fieldOrder.map((name) => (
        <form.Field
          key={name}
          name={name}
          listeners={{ onChange: () => setSentTo(null) }}
        >
          {(field) => {
            const error = attempted ? firstMessage(field.state.meta.errors) : undefined;
            const errorId = `contact-${name}-error`;
            const shared = {
              id: `contact-${name}`,
              value: field.state.value,
              required: true,
              placeholder: labels[name],
              "aria-invalid": error ? true : undefined,
              "aria-describedby": error ? errorId : undefined,
              onBlur: field.handleBlur,
            } as const;
            return (
              <div className="field" data-invalid={error ? "" : undefined}>
                <label className="sr-only" htmlFor={shared.id}>{labels[name]}</label>
                {name === "message" ? (
                  <textarea
                    {...shared}
                    ref={controls.message as RefObject<HTMLTextAreaElement>}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                ) : (
                  <input
                    {...shared}
                    ref={controls[name] as RefObject<HTMLInputElement>}
                    type={name === "email" ? "email" : "text"}
                    autoComplete={name}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
                {error ? <ErrorIcon /> : null}
                <p className="field-error" id={errorId}>{error}</p>
              </div>
            );
          }}
        </form.Field>
      ))}
      <div className="form-actions">
        <button className="text-button" type="submit">Send message</button>
      </div>
      <p className="form-status" role="status">
        {sentTo === null ? "" : `Thanks, ${sentTo}. This is a demo form, so your message was not sent or stored.`}
      </p>
      <p className="demo-note" id="contact-demo-note">
        This is a demo form, so your message was not sent or stored.
      </p>
    </form>
  );
}

const labels: Record<FieldName, string> = { name: "Name", email: "Email", message: "Message" };

function ErrorIcon() {
  return (
    <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="currentColor" />
      <rect x="11" y="6" width="2" height="9" rx="1" fill="currentColor" />
      <rect x="11" y="17" width="2" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
