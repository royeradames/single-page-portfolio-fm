import { z } from "zod";

export const requiredMessage = "Sorry, this field is required";
export const invalidEmailMessage = "Sorry, invalid format here";

const required = z.string().trim().min(1, requiredMessage);

export const contactSchema = z.object({
  name: required,
  // An empty email reports "required"; only a filled one is checked for format.
  email: required.pipe(z.email(invalidEmailMessage)),
  message: required,
});

export type ContactValues = z.input<typeof contactSchema>;
