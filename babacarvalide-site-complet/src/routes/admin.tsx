import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ImageUp, LogOut, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminLogin, adminLogout, deleteProject, getAdminProjects, saveProject, uploadProjectImage } from "@/lib/portfolio.functions";

type Project = Awaited<ReturnType<typeof getAdminProjects>>[number];
type ProjectDraft = { id?: string; title: string; slug: string; category: string; description: string; mediaPath: string; accent: "blue" | "yellow" | "red"; sortOrder: number; published: boolean };
const emptyProject: ProjectDraft = { title: "", slug: "", category: "", description: "", mediaPath: "", accent: "blue", sortOrder: 0, published: true };

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Studio privé — Babacarvalide" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const login = useServerFn(adminLogin);
  const save = useServerFn(saveProject);
  const remove = useServerFn(deleteProject);
  const logout = useServerFn(adminLogout);
  const uploadImage = useServerFn(uploadProjectImage);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [draft, setDraft] = useState<ProjectDraft>({ ...emptyProject });
  const [logoPath, setLogoPath] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await login({ data: { code } });
      if (!result.ok) { setError("Code incorrect."); return; }
      setProjects(result.projects); setLogoPath(result.logoPath); setAdminCode(code); setCode("");
    } catch { setError("Connexion impossible pour le moment."); } finally { setBusy(false); }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await save({ data: { ...draft, adminCode } });
      setProjects(result.projects); setDraft({ ...emptyProject, id: undefined });
      await queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Vérifie les champs avant de sauvegarder."); } finally { setBusy(false); }
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8_000_000) { setError("Utilise une image JPG, PNG ou WebP de moins de 8 Mo."); return; }
    setBusy(true); setError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await uploadImage({ data: { dataUrl, filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "-"), kind: "project", adminCode } });
      setDraft((current) => ({ ...current, mediaPath: result.url }));
    } catch { setError("L’image n’a pas pu être envoyée."); } finally { setBusy(false); }
  }

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8_000_000) { setError("Utilise un logo JPG, PNG ou WebP de moins de 8 Mo."); return; }
    setBusy(true); setError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const uploaded = await uploadImage({ data: { dataUrl, filename: `logo-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, kind: "logo", adminCode } });
      setLogoPath(uploaded.url);
      await queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] });
    } catch { setError("Le logo n’a pas pu être mis à jour."); } finally { setBusy(false); }
  }

  function editProject(project: Project) {
    setDraft({ id: project.id, title: project.title, slug: project.slug, category: project.category, description: project.description, mediaPath: project.media_paths[0] ?? "", accent: project.accent as "blue" | "yellow" | "red", sortOrder: project.sort_order, published: project.published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!projects) return (
    <main className="grid min-h-screen place-items-center bg-foreground p-5 text-background">
      <form onSubmit={handleLogin} className="w-full max-w-md border border-background/20 p-7 md:p-10">
        <a href="/" className="mb-16 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-background/60"><ArrowLeft className="h-4 w-4"/> Retour au portfolio</a>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">Studio privé</p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-none">Accès<br/><span className="text-electric">admin</span></h1>
        <label htmlFor="admin-code" className="mt-12 block font-mono text-[9px] uppercase tracking-widest">Code confidentiel</label>
        <Input id="admin-code" type="password" inputMode="numeric" autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} maxLength={32} className="mt-3 h-12 rounded-none border-background/30 text-background" required />
        {error && <p className="mt-3 text-sm text-signal">{error}</p>}
        <Button type="submit" variant="electric" className="mt-6 h-12 w-full" disabled={busy}>{busy ? "Vérification…" : "Entrer dans le studio"}</Button>
      </form>
    </main>
  );

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-12 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border-b border-foreground/15 pb-6 sm:flex sm:flex-wrap sm:justify-between">
        <div><p className="font-mono text-[9px] uppercase tracking-widest text-electric">Portfolio CMS</p><h1 className="font-display text-5xl uppercase md:text-7xl">Studio privé</h1></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => navigate({ to: "/" })}><ArrowLeft/> Voir le site</Button><Button variant="editorial" onClick={async () => { await logout(); setAdminCode(""); setProjects(null); }}><LogOut/> Sortir</Button></div>
      </header>
      <section className="mb-8 grid gap-6 border border-foreground/15 bg-foreground p-5 text-background md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7">
        <div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-widest text-sun">Identité du site</p><h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-[-0.06em]">Logo principal</h2><p className="mt-2 text-sm text-background/60">Envoie une nouvelle version : elle remplacera instantanément la signature B/CREATIVE dans la navigation.</p></div>
        <div className="flex shrink-0 items-center gap-4">{logoPath ? <img src={logoPath} alt="Logo actuel" className="h-14 w-28 bg-background object-contain p-2"/> : <span className="font-display text-lg font-bold">B<span className="text-electric">/</span>CREATIVE</span>}<label className="cursor-pointer"><Input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleLogo(e.target.files?.[0])} disabled={busy}/><span className="inline-flex h-10 items-center gap-2 bg-sun px-4 font-mono text-[9px] uppercase tracking-widest text-foreground"><ImageUp className="h-4 w-4"/> Changer</span></label></div>
      </section>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form onSubmit={handleSave} className="border border-foreground/15 p-5 md:p-7">
          <h2 className="flex items-center gap-2 font-display text-3xl uppercase">{draft.id ? <Pencil/> : <Plus/>}{draft.id ? "Modifier" : "Nouveau projet"}</h2>
          <div className="mt-7 space-y-5">
            <Field label="Nom"><Input value={draft.title} maxLength={140} onChange={(e) => { const title = e.target.value; setDraft((current) => ({ ...current, title, slug: current.id || current.slug ? current.slug : slugify(title) })); }} required /></Field>
            <Field label="Slug (minuscules et tirets)"><Input value={draft.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} required /></Field>
            <Field label="Catégorie"><Input value={draft.category} maxLength={80} onChange={(e) => setDraft({ ...draft, category: e.target.value })} required /></Field>
            <Field label="Description"><Textarea value={draft.description} maxLength={3000} rows={5} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
            <Field label="Image du projet"><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImage(e.target.files?.[0])} disabled={busy} />{draft.mediaPath && <img src={draft.mediaPath} alt="Aperçu du projet" className="mt-3 aspect-video w-full bg-muted object-cover"/>}<Input className="mt-2" value={draft.mediaPath} onChange={(e) => setDraft({ ...draft, mediaPath: e.target.value })} placeholder="L’image envoyée apparaîtra ici" /></Field>
            <div className="grid grid-cols-2 gap-4"><Field label="Couleur"><select className="h-9 w-full border border-input bg-background px-3 text-sm" value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value as typeof draft.accent })}><option value="blue">Bleu</option><option value="yellow">Jaune</option><option value="red">Rouge</option></select></Field><Field label="Ordre"><Input type="number" min={0} max={999} value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} /></Field></div>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Visible sur le site</label>
            {error && <p className="text-sm text-signal">{error}</p>}
            <div className="flex gap-2"><Button type="submit" variant="electric" disabled={busy}><Save/> Enregistrer</Button>{draft.id && <Button type="button" variant="outline" onClick={() => setDraft({ ...emptyProject, id: undefined })}>Annuler</Button>}</div>
          </div>
        </form>
        <section><p className="mb-5 font-mono text-[10px] uppercase tracking-widest">{projects.length} projets</p><div className="divide-y divide-foreground/15 border-y border-foreground/15">{projects.map((project) => <article key={project.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4"><div className="h-16 overflow-hidden bg-muted">{project.media_paths[0] && <img src={project.media_paths[0]} alt={`Aperçu de ${project.title}`} className="h-full w-full object-cover"/>}</div><div><h3 className="font-display text-xl uppercase">{project.title}</h3><p className="text-xs text-muted-foreground">{project.category} · {project.published ? "Publié" : "Brouillon"}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => editProject(project)} aria-label={`Modifier ${project.title}`}><Pencil/></Button><Button variant="ghost" size="icon" onClick={async () => { if (!confirm(`Supprimer ${project.title} ?`)) return; setBusy(true); setError(""); try { const result = await remove({ data: { id: project.id, adminCode } }); setProjects(result.projects); await queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] }); } catch (caught) { setError(caught instanceof Error ? caught.message : "La suppression a échoué."); } finally { setBusy(false); } }} aria-label={`Supprimer ${project.title}`} disabled={busy}><Trash2/></Button></div></article>)}</div></section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block font-mono text-[9px] uppercase tracking-widest">{label}</span>{children}</label>; }

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}