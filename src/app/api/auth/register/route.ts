import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 });
  }
}
