import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/portfolio-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path");
        if (!path || !/^[a-zA-Z0-9._-]{1,180}$/.test(path)) return new Response("Fichier invalide", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("portfolio-media").download(path);
        if (error || !data) return new Response("Introuvable", { status: 404 });
        return new Response(data, { headers: { "Content-Type": data.type || "application/octet-stream", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});