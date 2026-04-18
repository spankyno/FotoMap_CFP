import { jwtSign } from "../_jwt";
import { verifyPassword } from "../_crypto";

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
    const { email, password } = await request.json() as any;

    const user = await env.DB.prepare(
      "SELECT id, email, password, full_name FROM users WHERE email = ?"
    ).bind(email).first() as any;

    if (!user || !(await verifyPassword(password, user.password))) {
      return new Response(JSON.stringify({ error: "Credenciales inválidas" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const token = await jwtSign({ id: user.id, email: user.email }, env.JWT_SECRET || "fotomap-secret-2026");

    return new Response(JSON.stringify({
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    }), { headers: corsHeaders });
  } catch (err) {
    console.error("Login error:", err);
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
