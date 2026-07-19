import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { createUser } from "@/lib/users-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? "Nieprawidłowe dane formularza" },
        { status: 400 }
      );
    }

    const { confirmPassword, ...data } = parsed.data;
    void confirmPassword;
    const result = await createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      pesel: data.pesel,
      email: data.email,
      phone: data.phone,
      password: data.password,
      rodConsent: data.rodConsent,
    });

    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error ?? "Nie udało się utworzyć konta" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Wystąpił błąd serwera. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
