import { NextResponse } from "next/server";
import {
  createUser,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/users";
import { isSanityConfigured } from "@/lib/sanity";

export async function POST(request: Request) {
  if (!isSanityConfigured) {
    return NextResponse.json(
      { error: "El servicio no está disponible" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name : "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresá un correo válido" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        },
        { status: 400 }
      );
    }

    const user = await createUser({
      email: normalizeEmail(email),
      password,
      name: name.trim() || undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo" },
        { status: 409 }
      );
    }
    console.error("Error al registrar:", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta" },
      { status: 500 }
    );
  }
}
