import { timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(140),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(3000),
  mediaPath: z.string().trim().max(1000).optional(),
  accent: z.enum(["blue", "yellow", "red"]),
  sortOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
});

const adminCodeSchema = z.string().trim().min(1).max(32);

function isValidAdminCode(code: string) {
  const expected = process.env.ADMIN_ACCESS_CODE ?? "";
  const providedBuffer = Buffer.from(code);
  const expectedBuffer = Buffer.from(expected);
  return Boolean(expected) && providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function requireAdmin(code: string) {
  if (!isValidAdminCode(code)) throw new Error("Accès administrateur requis");
}

export const getPortfolioProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [projectsResult, settingsResult] = await Promise.all([
    supabaseAdmin.from("portfolio_projects").select("*").eq("published", true).order("sort_order"),
    supabaseAdmin.from("site_settings").select("logo_path").eq("id", "main").maybeSingle(),
  ]);
  if (projectsResult.error || settingsResult.error) throw new Error("Impossible de charger le portfolio");
  return { projects: projectsResult.data, logoPath: settingsResult.data?.logo_path ?? null };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ code: z.string().trim().max(32) }).parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_ACCESS_CODE ?? "";
    const providedBuffer = Buffer.from(data.code);
    const expectedBuffer = Buffer.from(expected);
    if (!expected || providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { ok: false as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [projectsResult, settingsResult] = await Promise.all([
      supabaseAdmin.from("portfolio_projects").select("*").order("sort_order"),
      supabaseAdmin.from("site_settings").select("logo_path").eq("id", "main").maybeSingle(),
    ]);
    if (projectsResult.error || settingsResult.error) {
      throw new Error("Impossible de charger l’administration");
    }
    return {
      ok: true as const,
      projects: projectsResult.data,
      logoPath: settingsResult.data?.logo_path ?? "",
    };
  });

export const getAdminProjects = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ adminCode: adminCodeSchema }).parse(input))
  .handler(async ({ data: input }) => {
    requireAdmin(input.adminCode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("portfolio_projects").select("*").order("sort_order");
    if (error) throw new Error("Impossible de charger l’administration");
    return data;
  });

async function loadAdminProjects() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("portfolio_projects").select("*").order("sort_order");
  if (error) throw new Error("Impossible de charger les projets");
  return data;
}

export const saveProject = createServerFn({ method: "POST" })
  .inputValidator((input) => projectSchema.extend({ adminCode: adminCodeSchema }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.adminCode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const record = {
      title: data.title,
      slug: data.slug,
      category: data.category,
      description: data.description,
      media_paths: data.mediaPath ? [data.mediaPath] : [],
      accent: data.accent,
      sort_order: data.sortOrder,
      published: data.published,
    };
    const result = data.id
      ? await supabaseAdmin.from("portfolio_projects").update(record).eq("id", data.id)
      : await supabaseAdmin.from("portfolio_projects").insert(record);
    if (result.error) {
      if (result.error.code === "23505") throw new Error("Ce slug est déjà utilisé par un autre projet");
      throw new Error("La sauvegarde a échoué");
    }
    return { ok: true, projects: await loadAdminProjects() };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid(), adminCode: adminCodeSchema }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.adminCode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("portfolio_projects").delete().eq("id", data.id);
    if (error) throw new Error("La suppression a échoué");
    return { ok: true, projects: await loadAdminProjects() };
  });

export const uploadProjectImage = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    dataUrl: z.string().max(12_000_000),
    filename: z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9._-]+$/),
    kind: z.enum(["project", "logo"]).default("project"),
    adminCode: adminCodeSchema,
  }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.adminCode);
    const match = data.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw new Error("Format d’image non accepté");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 8_000_000) throw new Error("Image trop volumineuse");
    const safeName = `${Date.now()}-${data.filename}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from("portfolio-media").upload(safeName, bytes, { contentType: match[1], upsert: false });
    if (error) throw new Error("L’envoi de l’image a échoué");
    const url = `/api/public/portfolio-media?path=${encodeURIComponent(safeName)}`;
    if (data.kind === "logo") {
      const { error: settingsError } = await supabaseAdmin.from("site_settings").upsert({ id: "main", logo_path: url });
      if (settingsError) throw new Error("Le logo n’a pas pu être enregistré");
    }
    return { url };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});