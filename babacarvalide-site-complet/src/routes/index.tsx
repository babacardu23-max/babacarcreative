import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowDownRight, Asterisk, MoveRight } from "lucide-react";
import { getPortfolioProjects } from "@/lib/portfolio.functions";
import portrait from "@/assets/portrait-babacar-original.jpg.asset.json";

const projectsQuery = queryOptions({
  queryKey: ["portfolio-projects"],
  queryFn: () => getPortfolioProjects(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  head: () => ({
    meta: [
      { title: "Babacarvalide — Portfolio créatif Dakar" },
      { name: "description", content: "Découvrez le portfolio de Babacar NDIAYE : branding, direction artistique, motion design, illustration et UI/UX." },
      { property: "og:title", content: "Babacarvalide — Portfolio créatif Dakar" },
      { property: "og:description", content: "Une sélection de campagnes, identités, interfaces et expériences visuelles par Babacar NDIAYE." },
      { property: "og:image", content: portrait.url },
      { name: "twitter:image", content: portrait.url },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(projectsQuery);
  const { projects, logoPath } = data;
  return (
    <main className="min-h-screen bg-foreground text-background">
      <nav className="fixed inset-x-0 top-0 z-50 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-background/15 bg-foreground/80 px-4 py-4 backdrop-blur-md md:px-8">
        <a href="#top" className="min-w-0 font-display text-sm font-bold uppercase tracking-[-0.08em] md:text-xl">{logoPath ? <img src={logoPath} alt="B Creative" className="h-8 max-w-[9rem] object-contain object-left md:h-10"/> : <>B<span className="text-electric">/</span>CREATIVE</>}</a>
        <div className="flex shrink-0 items-center gap-4 font-mono text-[8px] uppercase tracking-[0.16em] text-background/60 md:gap-8 md:text-[10px]">
          <a href="#work">Projets</a><a href="#about">À propos</a><a href="#contact">Contact</a>
        </div>
      </nav>

      <header id="top" className="relative min-h-[100svh] overflow-hidden px-4 pb-16 pt-28 md:px-8 md:pt-36">
        <div className="absolute -right-24 top-24 h-[72%] w-[78%] rotate-3 bg-electric md:right-[3%] md:w-[48%]" />
        <img src={portrait.url} alt="Portrait de Babacar NDIAYE, directeur artistique" className="absolute bottom-0 right-0 h-[72%] w-[76%] object-cover object-center grayscale contrast-125 mix-blend-luminosity md:h-[88%] md:w-[49%]" />
        <div className="animate-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-sun/70"/>
        <div className="relative z-30 flex min-h-[calc(100svh-8rem)] flex-col justify-between">
          <p className="animate-rise font-mono text-[9px] uppercase tracking-[0.3em] text-electric md:text-xs">Creative Art Director · Dakar, Sénégal</p>
          <div>
            <h1 className="font-display text-[19vw] font-bold uppercase leading-[0.79] tracking-[-0.1em] md:text-[10vw]">
              Babacar<br/><span className="outlined-title">Ndiaye</span>
            </h1>
            <div className="mt-8 flex max-w-lg items-start gap-4 md:ml-[8vw]">
              <span className="mt-1 block h-3 w-3 shrink-0 bg-signal" />
              <p className="text-base leading-tight text-background/70 md:text-xl">Je transforme les idées en expériences visuelles marquantes, entre stratégie, culture et émotion.</p>
            </div>
          </div>
          <a href="#work" className="group flex w-fit items-center gap-4 font-mono text-[9px] uppercase tracking-widest"><span className="grid h-12 w-12 place-items-center border border-background/30 transition-colors group-hover:bg-sun group-hover:text-foreground"><ArrowDownRight/></span> Découvrir les projets</a>
        </div>
      </header>

      <div className="overflow-hidden border-y border-background/15 bg-sun py-5 text-foreground"><div className="animate-ticker flex w-max gap-12 whitespace-nowrap font-display text-xl font-bold uppercase md:text-3xl">{Array.from({length:2}).map((_,i)=><div key={i} className="flex gap-12"><span>Brand Strategy</span><span>Motion Design</span><span>Visual Culture</span><span>Digital Experience</span><span>Art Direction</span></div>)}</div></div>

      <section id="about" className="border-b border-background/15 px-4 py-24 md:px-8 md:py-36">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-3"><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric">01 / Qui suis-je ?</p></div>
          <div className="md:col-span-9">
            <h2 className="max-w-5xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-[-0.07em] md:text-7xl">Une vision à 360°.<br/><span className="text-sun">Des idées sans filtre.</span></h2>
            <div className="mt-12 grid gap-8 text-base leading-relaxed text-background/65 md:grid-cols-2 md:text-lg">
              <p>Graphiste pluridisciplinaire, Motion Designer, Illustrateur, Creative Art Director et Brand Strategist, je donne vie aux idées grâce à une approche visuelle stratégique et une sensibilité artistique pointue.</p>
              <p>Je comprends les besoins d’une marque et les traduis en concepts percutants, de la conception au déploiement social. Mon objectif : dépasser chaque limite créative avec succès.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="bg-background px-4 py-24 text-foreground md:px-8 md:py-36">
        <div className="mb-20 flex items-end justify-between border-b border-foreground/20 pb-6">
          <h2 className="font-display text-5xl font-bold uppercase leading-[.85] tracking-[-0.08em] md:text-8xl">Selected<br/><span className="text-electric">work</span></h2>
          <ArrowDownRight className="mb-2 h-10 w-10 md:h-16 md:w-16" />
        </div>
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {projects.map((project, index) => (
            <article key={project.id} className={`group mb-5 inline-block w-full break-inside-avoid border border-foreground/20 p-2 ${index % 3 === 1 ? "md:mt-16" : ""}`}>
              <div className="relative overflow-hidden bg-muted">
                {project.media_paths[0] && <img src={project.media_paths[0]} alt={`${project.title} — ${project.category}`} loading="lazy" className={`image-noise w-full object-cover transition duration-700 group-hover:scale-105 ${index % 4 === 0 ? "aspect-[3/4]" : index % 4 === 1 ? "aspect-square" : "aspect-[4/3]"}`} />}
                <div className={`absolute inset-0 opacity-0 mix-blend-multiply transition-opacity group-hover:opacity-30 ${project.accent === "red" ? "bg-signal" : project.accent === "yellow" ? "bg-sun" : "bg-electric"}`}/>
                <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center bg-foreground font-mono text-[9px] text-background">{String(index+1).padStart(2,"0")}</span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-2 pb-3 pt-5">
                <div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-electric">{project.category}</p><h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-[-0.06em] md:text-3xl">{project.title}</h3><p className="mt-3 line-clamp-5 text-sm leading-relaxed text-muted-foreground">{project.description}</p></div>
                <MoveRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="overflow-hidden bg-electric py-7 text-electric-foreground">
        <div className="animate-ticker flex w-max gap-16 whitespace-nowrap font-display text-4xl uppercase md:text-6xl">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="flex gap-16"><span>Art Direction</span><span className="text-sun">Brand Strategy</span><span>Motion Design</span><span className="text-sun">Illustration</span><span>UI / UX</span><span className="text-sun">Community</span></div>)}
        </div>
      </div>

      <section className="grid border-b border-background/15 md:grid-cols-2">
        <div className="border-b border-background/15 p-8 md:border-b-0 md:border-r md:p-16"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Softwares used</p><p className="mt-8 text-xl leading-relaxed text-background/65 md:text-3xl">Adobe Illustrator · Photoshop · After Effects · Affinity · Procreate · DaVinci Resolve · Linearity</p></div>
        <div className="p-8 md:p-16"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">Valeurs</p><p className="mt-8 font-display text-4xl font-bold uppercase leading-[0.95] tracking-[-0.07em] md:text-6xl">Authentique.<br/>Créatif.<br/>Fiable.</p></div>
      </section>

      <footer id="contact" className="bg-sun px-4 pb-8 pt-24 text-foreground md:px-8 md:pt-36">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Un projet ? Une idée ?</p>
        <h2 className="mt-5 font-display text-[15vw] font-bold uppercase leading-[0.82] tracking-[-0.1em] md:text-[10vw]">Créons<br/><span className="text-signal">ensemble.</span></h2>
        <div className="mt-20 grid gap-10 border-t border-foreground/20 pt-8 md:grid-cols-3">
          <div><p className="font-mono text-[9px] uppercase tracking-widest">E-mail</p><a href="mailto:Babacardu23@gmail.com" className="mt-2 block text-lg font-semibold">Babacardu23@gmail.com</a></div>
          <div><p className="font-mono text-[9px] uppercase tracking-widest">Téléphone</p><a href="tel:+221781729926" className="mt-2 block text-lg font-semibold">+221 78 172 99 26</a></div>
          <div><p className="font-mono text-[9px] uppercase tracking-widest">Instagram</p><a href="https://instagram.com/babacarvalide" rel="noreferrer" target="_blank" className="mt-2 block text-lg font-semibold">@babacarvalide</a></div>
        </div>
        <div className="mt-24 flex items-end justify-between border-t border-foreground/20 pt-6 font-mono text-[8px] uppercase tracking-widest md:text-[10px]"><span>© 2026 Babacarvalide.pro</span><a href="/admin" className="flex items-center gap-2 text-foreground/60 transition-colors hover:text-signal"><span className="inline-block h-2 w-2 bg-signal"/> Studio privé</a></div>
      </footer>
    </main>
  );
}
