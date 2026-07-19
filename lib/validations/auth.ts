import { z } from "zod";
import { isValidPesel } from "@/lib/pesel";

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  // 9 cyfr PL lub 11 z prefiksem 48
  if (digits.length === 9) return true;
  if (digits.length === 11 && digits.startsWith("48")) return true;
  return false;
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Podaj adres e-mail")
    .email("Nieprawidłowy adres e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});

export const registerSchema = z
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
    email: z
      .string()
      .min(1, "Podaj adres e-mail")
      .email("Nieprawidłowy adres e-mail"),
    phone: z
      .string()
      .min(1, "Podaj numer telefonu")
      .refine(
        isValidPhone,
        "Nieprawidłowy numer telefonu (np. 500600700 lub +48 500 600 700)"
      ),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Za-z]/, "Hasło musi zawierać literę")
      .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
    confirmPassword: z.string().min(1, "Powtórz hasło"),
    rodConsent: z.boolean().refine((v) => v === true, {
      message: "Wymagana jest zgoda na przetwarzanie danych osobowych (RODO)",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
