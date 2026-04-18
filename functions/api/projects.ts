import { jwtVerifyLocal } from "./_jwt";

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

async function getUser(request: Request, env: Env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    return await jwtVerifyLocal(token, env.JWT_SECRET || "fotomap-secret-2026");
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = await getUser(context.request, context.env);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const { results } = await context.env.DB.prepare(
    "SELECT id, name, created_at FROM projects WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  return new Response(JSON.stringify(results), { headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const user = await getUser(context.request, context.env);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const { name, data } = await context.request.json() as any;
  if (!name) return new Response(JSON.stringify({ error: "Nombre requerido" }), { status: 400, headers: corsHeaders });

  const result = await context.env.DB.prepare(
    "INSERT INTO projects (user_id, name, data) VALUES (?, ?, ?) RETURNING id, name, created_at"
  ).bind(user.id, name, JSON.stringify(data)).first();

  return new Response(JSON.stringify(result), { status: 201, headers: corsHeaders });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const user = await getUser(context.request, context.env);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "ID requerido" }), { status: 400, headers: corsHeaders });

  await context.env.DB.prepare(
    "DELETE FROM projects WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).run();

  return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
