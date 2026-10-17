import * as z from "zod/mini";
import en from "zod/v4/locales/en.js";

// Zod Mini ships no messages; load the English ones classic Zod uses so built-in issues read the same.
z.config(en());

export const requiredMessage = "Sorry, this field is required";
export const invalidEmailMessage = "Sorry, invalid format here";

const required = z.string().check(z.trim(), z.minLength(1, requiredMessage));

export const contactSchema = z.object({
  name: required,
  // An empty email reports "required"; only a filled one is checked for format.
  email: z.pipe(required, z.email(invalidEmailMessage)),
  message: required,
});

export type ContactValues = z.input<typeof contactSchema>;
