import { jwtSign } from "../_jwt";
import { hashPassword } from "../_crypto";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { email, password, fullName } = await request.json() as any;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email y contraseña son obligatorios" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "El email ya existe" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const hashedPassword = await hashPassword(password);
    const result = await env.DB.prepare(
      "INSERT INTO users (email, password, full_name) VALUES (?, ?, ?) RETURNING id"
    ).bind(email, hashedPassword, fullName || "").first() as any;

    const token = await jwtSign({ id: result.id, email }, env.JWT_SECRET || "fotomap-secret-2026");

    return new Response(JSON.stringify({ token, user: { id: result.id, email, fullName } }), {
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500, headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
