import { z } from "zod";
import { isValidPesel } from "@/lib/pesel";

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return true;
  if (digits.length === 11 && digits.startsWith("48")) return true;
  return false;
}

const patientGroupSchema = z.enum([
  "VIP",
  "NFZ",
  "Prywatny",
  "Sport",
  "Pooperacyjny",
  "Nowy",
]);

export const patientFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Imię musi mieć co najmniej 2 znaki")
      .max(50, "Imię jest zbyt długie"),
    lastName: z
      .string()
      .min(2, "Nazwisko musi mieć co najmniej 2 znaki")
      .max(50, "Nazwisko jest zbyt długie"),
    pesel: z
      .string()
      .regex(/^\d{11}$/, "PESEL musi składać się z 11 cyfr")
      .refine(isValidPesel, "Nieprawidłowy numer PESEL (suma kontrolna)"),
    birthDate: z
      .string()
      .min(1, "Podaj datę urodzenia")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowa data"),
    sex: z.enum(["K", "M"]),
    phone: z
      .string()
      .min(1, "Podaj numer telefonu")
      .refine(isValidPhone, "Nieprawidłowy numer telefonu (np. 500600700)"),
    email: z.string(),
    street: z.string().max(100),
    buildingNo: z.string().max(20),
    apartmentNo: z.string().max(20),
    postalCode: z.string(),
    city: z.string().max(80),
    cardNumber: z.string().max(30),
    groups: z.array(patientGroupSchema),
    notes: z.string().max(2000),
    rodConsent: z.boolean(),
    status: z.enum(["active", "inactive", "archived"]),
  })
  .superRefine((data, ctx) => {
    if (data.email.length > 0) {
      const ok = z.string().email().safeParse(data.email).success;
      if (!ok) {
        ctx.addIssue({
          code: "custom",
          message: "Nieprawidłowy adres e-mail",
          path: ["email"],
        });
      }
    }
    if (data.postalCode.length > 0 && !/^\d{2}-\d{3}$/.test(data.postalCode)) {
      ctx.addIssue({
        code: "custom",
        message: "Kod pocztowy: XX-XXX",
        path: ["postalCode"],
      });
    }
  });

export type PatientFormValues = z.infer<typeof patientFormSchema>;
