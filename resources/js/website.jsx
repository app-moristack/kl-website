import React, { useState, useEffect, useRef } from "react";
import {
    ArrowRight,
    ArrowUpRight,
    Landmark,
    MapPin,
    Lightbulb,
    Users,
    Shield,
    BookOpen,
    Gavel,
    Leaf,
    Droplets,
    TrendingUp,
    Calendar,
    Search,
    FileText,
    Play,
    ChevronLeft,
    ChevronRight,
    X,
    Download,
    Mail,
    MessageCircle,
} from "lucide-react";
import { locale, t, href, api, Button } from "./shared";
import { Header, Footer, Contact, Cards, PageHero } from "./public-components";
const icons = {
    landmark: Landmark,
    map: MapPin,
    lightbulb: Lightbulb,
    users: Users,
    shield: Shield,
    book: BookOpen,
    gavel: Gavel,
    leaf: Leaf,
    water: Droplets,
    chart: TrendingUp,
    calendar: Calendar,
};
const words = {
    en: {
        latest: "Latest updates",
        all: "View all",
        featured: "In focus",
        questions: "Recent interventions",
        focus: "Focus areas",
        journey: "A journey of service",
        milestones: "Key milestones",
        work: "Areas of work",
        interviews: "Interviews & press statements",
        gallery: "Photo gallery",
        galleryTitle: "Moments from the journey",
        community: "In the community",
        communityTitle: "Listening. Engaging. Working together.",
        connect: "Stay connected with No. 15",
        concern: "Submit a concern",
        appointment: "Request an appointment",
        search: "Search the archive",
        kind: "Contribution type",
        year: "Year",
        topic: "Topic",
        ministry: "Ministry / committee",
        from: "From date",
        to: "To date",
        sort: "Sort by",
        latestSort: "Newest first",
        oldest: "Oldest first",
        download: "Download PDF",
        video: "Load video",
        videoNotice:
            "Loading this player connects to YouTube or Vimeo. Their privacy terms apply.",
        photos: "photos",
        empty: "No published records match these filters.",
        clear: "Clear filters",
        more: "Read more",
        waiting: "This translation is awaiting review.",
        legal: "This legal page is awaiting owner approval. Please contact the office before submitting sensitive information.",
        previous: "Previous",
        next: "Next",
        close: "Close gallery",
        results: "results",
    },
    fr: {
        latest: "Dernières actualités",
        all: "Tout voir",
        featured: "À la une",
        questions: "Interventions récentes",
        focus: "Domaines prioritaires",
        journey: "Un parcours au service du public",
        milestones: "Étapes clés",
        work: "Domaines d’action",
        interviews: "Entretiens et communiqués",
        gallery: "Galerie photo",
        galleryTitle: "Les moments du parcours",
        community: "Dans la communauté",
        communityTitle: "Écouter. Échanger. Agir ensemble.",
        connect: "Restez en contact avec le n° 15",
        concern: "Signaler une préoccupation",
        appointment: "Demander un rendez-vous",
        search: "Rechercher dans les archives",
        kind: "Type de contribution",
        year: "Année",
        topic: "Sujet",
        ministry: "Ministère / commission",
        from: "Du",
        to: "Au",
        sort: "Trier par",
        latestSort: "Plus récents",
        oldest: "Plus anciens",
        download: "Télécharger le PDF",
        video: "Charger la vidéo",
        videoNotice:
            "Le chargement du lecteur établit une connexion avec YouTube ou Vimeo. Leurs règles de confidentialité s’appliquent.",
        photos: "photos",
        empty: "Aucune publication ne correspond à ces filtres.",
        clear: "Effacer les filtres",
        more: "Lire la suite",
        waiting: "Cette traduction est en cours de révision.",
        legal: "Cette page juridique attend l’approbation du propriétaire. Contactez l’équipe avant de transmettre des informations sensibles.",
        previous: "Précédent",
        next: "Suivant",
        close: "Fermer la galerie",
        results: "résultats",
    },
    km: {
        latest: "Bann dernie piblikasion",
        all: "Get tou",
        featured: "An vedet",
        questions: "Bann dernie intervansion",
        focus: "Bann priorite",
        journey: "Enn parkour dan servis piblik",
        milestones: "Bann letap inportan",
        work: "Bann domenn travay",
        interviews: "Interview ek kominike",
        gallery: "Galri foto",
        galleryTitle: "Bann moman nou parkour",
        community: "Dan kominote",
        communityTitle: "Ekoute. Partaze. Travay ansam.",
        connect: "Res an kontak avek No. 15",
        concern: "Partaz enn konsern",
        appointment: "Demann enn randevou",
        search: "Rod dan bann arsiv",
        kind: "Tip kontribision",
        year: "Lane",
        topic: "Sizet",
        ministry: "Minister / komite",
        from: "Depi",
        to: "Ziska",
        sort: "Triye",
        latestSort: "Pli resan",
        oldest: "Pli ansien",
        download: "Telecharg PDF",
        video: "Sarze video",
        videoNotice:
            "Sa video-la konekte avek YouTube ouswa Vimeo. Zot reg konfidansialite aplike.",
        photos: "foto",
        empty: "Pena piblikasion pou sa bann filt-la.",
        clear: "Efase bann filt",
        more: "Lir plis",
        waiting: "Sa tradiksion-la pe atann revizion.",
        legal: "Sa paz legal-la pe atann laprobasion proprieter. Kontak lekip avan avoy bann linformasion sansib.",
        previous: "Avan",
        next: "Apre",
        close: "Ferm galri",
        results: "rezilta",
    },
};
const w = words[locale] || words.en;
function Heading({ label, title, to }) {
    return (
        <div className="template-heading">
            <div>
                {label && <p className="eyebrow">{label}</p>}
                <h2>{title}</h2>
            </div>
            {to && (
                <a className="text-link" href={to}>
                    {w.all}
                    <ArrowRight size={17} />
                </a>
            )}
        </div>
    );
}
function Hero({ page, home = false }) {
    return (
        <section
            className={`template-hero ${home ? "home-hero" : ""} ${page.design === "editorial" ? "editorial-hero" : ""}`}
            style={
                page.hero_background
                    ? {
                          backgroundImage: `linear-gradient(90deg,rgba(6,24,49,.94),rgba(6,24,49,.35)),url(${page.hero_background})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                      }
                    : undefined
            }
        >
            <div className="hero-orbit" />
            <div className="container template-hero-inner">
                <div className="template-hero-copy">
                    <p className="eyebrow light">{page.eyebrow}</p>
                    <h1>
                        {page.hero_title}
                        <br />
                        <em>{page.hero_accent}</em>
                    </h1>
                    <p>{page.hero_body}</p>
                    <div className="button-row">
                        {page.primary_label && page.primary_url && (
                            <Button to={page.primary_url}>
                                {page.primary_label}
                            </Button>
                        )}
                        {page.secondary_label && page.secondary_url && (
                            <Button secondary to={page.secondary_url}>
                                {page.secondary_label}
                            </Button>
                        )}
                    </div>
                </div>
                {page.hero_image && (
                    <div className="template-portrait">
                        <img
                            src={page.hero_image}
                            alt="Khushal Lobine"
                            fetchPriority="high"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
function Intro({ page, about = false }) {
    if (!page.intro_title && !page.intro_body) return null;
    return (
        <section
            className={`container template-intro ${about ? "about-intro" : ""}`}
        >
            {page.intro_image && (
                <img
                    src={page.intro_image}
                    alt="Khushal Lobine"
                    loading="lazy"
                />
            )}
            <div>
                <p className="eyebrow">{page.eyebrow}</p>
                <h2>{page.intro_title}</h2>
                <p className="article-body">{page.intro_body}</p>
                {page.primary_url && (
                    <a className="text-link" href={page.primary_url}>
                        {page.primary_label || w.more}
                        <ArrowRight size={16} />
                    </a>
                )}
            </div>
            {page.quote && (
                <blockquote>
                    <span>“</span>
                    {page.quote}
                    {page.signature && <cite>{page.signature}</cite>}
                </blockquote>
            )}
        </section>
    );
}
function LinkCards({ cards = [], heading, compact = false }) {
    if (!cards.length) return null;
    return (
        <section
            className={`container template-card-section ${compact ? "compact-cards" : ""}`}
        >
            {heading && <Heading title={heading} />}
            <div
                className={`template-card-grid cols-${Math.min(cards.length, 6)}`}
            >
                {cards.map((card, i) => {
                    const Icon = icons[card.icon] || Landmark;
                    return (
                        <a
                            className="template-card"
                            key={i}
                            href={card.url || href("contact")}
                        >
                            {card.image && (
                                <img src={card.image} alt="" loading="lazy" />
                            )}
                            <span className={`round-icon tone-${i % 3}`}>
                                <Icon size={25} />
                            </span>
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>
                            <span className="text-link">
                                {w.more}
                                <ArrowRight size={15} />
                            </span>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
function Milestones({ page }) {
    return page.milestones?.length ? (
        <section className="milestones-section">
            <div className="container">
                <Heading label={w.journey} title={w.milestones} />
                <ol className="milestones">
                    {page.milestones.map((m, i) => (
                        <li key={i}>
                            <span className="round-icon">
                                <Calendar size={24} />
                            </span>
                            <strong>{m.year}</strong>
                            <h3>{m.title}</h3>
                            <p>{m.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    ) : null;
}
function FocusTiles({ rows = [], title }) {
    return rows.length ? (
        <section className="container section">
            <Heading title={title} />
            <div className={`focus-tiles tiles-${rows.length}`}>
                {rows.map((row, i) => {
                    const Icon = icons[row.icon] || Shield;
                    return (
                        <div key={i}>
                            <span className={"round-icon tone-" + (i % 3)}>
                                <Icon size={23} />
                            </span>
                            <h3>{row.title}</h3>
                            {row.body && <p>{row.body}</p>}
                        </div>
                    );
                })}
            </div>
        </section>
    ) : null;
}
function CTA({ page }) {
    return page.cta_title ? (
        <section className="template-cta">
            <div className="container">
                <div>
                    <p className="eyebrow light">{w.community}</p>
                    <h2>{page.cta_title}</h2>
                    <p>{page.cta_body}</p>
                    {page.cta_url && (
                        <Button to={page.cta_url}>
                            {page.cta_label || w.more}
                        </Button>
                    )}
                </div>
                {page.cta_image && (
                    <img src={page.cta_image} alt="" loading="lazy" />
                )}
            </div>
        </section>
    ) : null;
}
function Focus({ rows = [] }) {
    return rows.length ? (
        <aside className="focus-panel">
            <p className="eyebrow">{w.focus}</p>
            <h2>
                {locale === "fr"
                    ? "Construire une île Maurice plus forte"
                    : locale === "km"
                      ? "Enn Moris pli for"
                      : "Building a stronger Mauritius"}
            </h2>
            {rows.map((f, i) => {
                const Icon = icons[f.icon] || Shield;
                return (
                    <div className="focus-row" key={i}>
                        <span className="round-icon">
                            <Icon size={21} />
                        </span>
                        <div>
                            <h3>{f.title}</h3>
                            <p>{f.body}</p>
                        </div>
                    </div>
                );
            })}
        </aside>
    ) : null;
}
export function VideoPlayer({ item }) {
    const [loaded, setLoaded] = useState(false);
    if (!item.embed_url) return null;
    return (
        <div className="video-player">
            {loaded ? (
                <iframe
                    src={item.embed_url}
                    title={item.title}
                    loading="lazy"
                    allow="fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            ) : (
                <div className="video-gate">
                    {item.image && (
                        <img src={item.image} alt="" loading="lazy" />
                    )}
                    <div>
                        <button
                            type="button"
                            aria-label={w.video}
                            onClick={() => setLoaded(true)}
                        >
                            <Play size={28} />
                        </button>
                        <p>{w.video}</p>
                        <small>{w.videoNotice}</small>
                    </div>
                </div>
            )}
        </div>
    );
}
export function Gallery({ photos = [], title = "" }) {
    const [index, setIndex] = useState(null);
    const trigger = useRef(null);
    useEffect(() => {
        if (index === null) return;
        const before = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const key = (e) => {
            if (e.key === "Escape") setIndex(null);
            if (e.key === "Tab") {
                const buttons = [
                    ...document.querySelectorAll(".lightbox button"),
                ];
                const first = buttons[0],
                    last = buttons[buttons.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
            if (e.key === "ArrowRight")
                setIndex((n) => (n + 1) % photos.length);
            if (e.key === "ArrowLeft")
                setIndex((n) => (n + photos.length - 1) % photos.length);
        };
        document.addEventListener("keydown", key);
        return () => {
            document.body.style.overflow = before;
            document.removeEventListener("keydown", key);
            trigger.current?.focus();
        };
    }, [index === null, photos.length]);
    if (!photos.length) return null;
    return (
        <>
            <div className="photo-grid">
                {photos.map((p, i) => (
                    <button
                        type="button"
                        key={i}
                        onClick={(e) => {
                            trigger.current = e.currentTarget;
                            setIndex(i);
                        }}
                        aria-label={`${title} ${i + 1}: ${p.alt || p.caption || w.gallery}`}
                    >
                        <img
                            src={p.image}
                            alt={p.alt || p.caption || ""}
                            loading="lazy"
                        />
                        {p.caption && <span>{p.caption}</span>}
                    </button>
                ))}
            </div>
            {index !== null && (
                <div
                    className="lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={title || w.gallery}
                >
                    <button
                        className="lightbox-close"
                        autoFocus
                        onClick={() => setIndex(null)}
                        aria-label={w.close}
                    >
                        <X />
                    </button>
                    <button
                        onClick={() =>
                            setIndex(
                                (index + photos.length - 1) % photos.length,
                            )
                        }
                        aria-label={w.previous}
                    >
                        <ChevronLeft />
                    </button>
                    <figure>
                        <img
                            src={photos[index].image}
                            alt={photos[index].alt || ""}
                        />
                        <figcaption>
                            {photos[index].caption}{" "}
                            <span>
                                {index + 1} / {photos.length}
                            </span>
                        </figcaption>
                    </figure>
                    <button
                        onClick={() => setIndex((index + 1) % photos.length)}
                        aria-label={w.next}
                    >
                        <ChevronRight />
                    </button>
                </div>
            )}
        </>
    );
}
function PostList({ items }) {
    return (
        <div className="intervention-list">
            {items.length ? (
                items.map((item) => (
                    <a href={href("articles/" + item.slug)} key={item.id}>
                        <span className="round-icon">
                            <FileText size={21} />
                        </span>
                        <div>
                            <small>
                                {item.parliament_kind ||
                                    item.category ||
                                    item.type}{" "}
                                {item.question_number &&
                                    " · " + item.question_number}
                            </small>
                            <h3>{item.title}</h3>
                        </div>
                        <ChevronRight size={19} />
                    </a>
                ))
            ) : (
                <div className="empty">{t.empty}</div>
            )}
        </div>
    );
}
function HomePage({ page, items }) {
    const parliament = items.filter((i) => i.type === "parliament"),
        community = items.filter((i) => i.type === "community");
    const feature =
        items.find((i) => i.featured && i.embed_url) ||
        items.find((i) => i.featured);
    return (
        <>
            <Hero page={page} home />
            <Intro page={page} />
            <div className={`soft-band home-work ${page.design}`}>
                <LinkCards cards={page.cards} heading={page.section_title} />
            </div>
            <section className="container section">
                <Heading
                    label={w.latest}
                    title={t.latest}
                    to={href("updates")}
                />
                <Cards
                    items={items
                        .filter((x) => !["page", "gallery"].includes(x.type))
                        .slice(0, 3)}
                />
            </section>
            {feature && (
                <section className="container section feature-story">
                    <div>
                        {feature.embed_url ? (
                            <VideoPlayer item={feature} />
                        ) : (
                            feature.image && <img src={feature.image} alt="" />
                        )}
                    </div>
                    <div>
                        <p className="eyebrow">{w.featured}</p>
                        <h2>{feature.title}</h2>
                        <p>{feature.excerpt}</p>
                        <Button to={href("articles/" + feature.slug)}>
                            {w.more}
                        </Button>
                    </div>
                </section>
            )}
            <section className="soft-band">
                <div className="container twin-sections section">
                    <div>
                        <Heading title={w.questions} to={href("parliament")} />
                        <PostList items={parliament.slice(0, 3)} />
                    </div>
                    <div>
                        <Heading
                            title={w.community}
                            to={href("constituency")}
                        />
                        <Cards items={community.slice(0, 1)} />
                    </div>
                </div>
            </section>
            <ConnectCards />
            <CTA page={page} />
        </>
    );
}
function ConnectCards() {
    const rows = [
        [Mail, w.concern, "concern"],
        [Calendar, w.appointment, "appointment"],
        [MessageCircle, t.contact, "general"],
    ];
    return (
        <section className="container connect-cards-section">
            <Heading label={t.contact} title={t.sections.contact[1]} />
            <div className="connect-cards">
                {rows.map(([Icon, label, kind], i) => (
                    <a href={href("contact") + "?kind=" + kind} key={kind}>
                        <span className={"round-icon tone-" + i}>
                            <Icon />
                        </span>
                        <div>
                            <h3>{label}</h3>
                            <span className="text-link">
                                {w.more}
                                <ArrowRight size={15} />
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
export function Archive({ type = "", title = "", parliament = false }) {
    const initial = new URLSearchParams(location.search);
    const [filters, setFilters] = useState({
            q: initial.get("q") || "",
            kind: initial.get("kind") || "",
            year: "",
            topic: initial.get("topic") || "",
            ministry: "",
            from: "",
            to: "",
            sort: "latest",
        }),
        [result, setResult] = useState({
            data: [],
            meta: { page: 1, last_page: 1, total: 0 },
            facets: {},
        }),
        [page, setPage] = useState(1),
        [busy, setBusy] = useState(true),
        [error, setError] = useState("");
    useEffect(() => {
        let alive = true;
        setBusy(true);
        const params = new URLSearchParams({
            per_page: 12,
            page,
            ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
            ...(type ? { type } : {}),
        });
        const timer = setTimeout(
            () =>
                api("/api/content/" + locale + "?" + params)
                    .then((d) => {
                        if (alive) {
                            setResult(d);
                            setError("");
                        }
                    })
                    .catch((e) => {
                        if (alive) setError(e.message);
                    })
                    .finally(() => {
                        if (alive) setBusy(false);
                    }),
            200,
        );
        return () => {
            alive = false;
            clearTimeout(timer);
        };
    }, [JSON.stringify(filters), page, type]);
    const change = (k, v) => {
        setFilters({ ...filters, [k]: v });
        setPage(1);
    };
    return (
        <section className="container section archive-section" id="archive">
            <Heading
                label={parliament ? w.questions : w.latest}
                title={title || w.search}
            />
            <div className="archive-controls">
                <label className="search-box">
                    <Search size={18} />
                    <input
                        placeholder={w.search}
                        aria-label={w.search}
                        value={filters.q}
                        onChange={(e) => change("q", e.target.value)}
                    />
                </label>
                <div className="archive-filter-grid">
                    {parliament && (
                        <>
                            <label>
                                {w.kind}
                                <select
                                    value={filters.kind}
                                    onChange={(e) =>
                                        change("kind", e.target.value)
                                    }
                                >
                                    <option value="">{w.all}</option>
                                    {[
                                        "question",
                                        "speech",
                                        "bill",
                                        "committee",
                                        "intervention",
                                    ].map((x) => (
                                        <option value={x} key={x}>
                                            {
                                                {
                                                    en: {
                                                        question: "Questions",
                                                        speech: "Speeches",
                                                        bill: "Bills",
                                                        committee: "Committees",
                                                        intervention:
                                                            "Interventions",
                                                    },
                                                    fr: {
                                                        question: "Questions",
                                                        speech: "Discours",
                                                        bill: "Projets de loi",
                                                        committee:
                                                            "Commissions",
                                                        intervention:
                                                            "Interventions",
                                                    },
                                                    km: {
                                                        question: "Kestion",
                                                        speech: "Diskour",
                                                        bill: "Proze lalwa",
                                                        committee: "Komite",
                                                        intervention:
                                                            "Intervansion",
                                                    },
                                                }[locale][x]
                                            }
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                {w.year}
                                <select
                                    value={filters.year}
                                    onChange={(e) =>
                                        change("year", e.target.value)
                                    }
                                >
                                    <option value="">{w.all}</option>
                                    {result.facets.years?.map((x) => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                {w.ministry}
                                <select
                                    value={filters.ministry}
                                    onChange={(e) =>
                                        change("ministry", e.target.value)
                                    }
                                >
                                    <option value="">{w.all}</option>
                                    {result.facets.ministries?.map((x) => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                            </label>
                        </>
                    )}
                    <label>
                        {w.topic}
                        <select
                            value={filters.topic}
                            onChange={(e) => change("topic", e.target.value)}
                        >
                            <option value="">{w.all}</option>
                            {[
                                ...new Set(
                                    [
                                        filters.topic,
                                        ...(result.facets.topics || []),
                                    ].filter(Boolean),
                                ),
                            ].map((x) => (
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                    </label>
                    {parliament && (
                        <>
                            <label>
                                {w.from}
                                <input
                                    type="date"
                                    value={filters.from}
                                    onChange={(e) =>
                                        change("from", e.target.value)
                                    }
                                />
                            </label>
                            <label>
                                {w.to}
                                <input
                                    type="date"
                                    value={filters.to}
                                    min={filters.from}
                                    onChange={(e) =>
                                        change("to", e.target.value)
                                    }
                                />
                            </label>
                        </>
                    )}
                    <label>
                        {w.sort}
                        <select
                            value={filters.sort}
                            onChange={(e) => change("sort", e.target.value)}
                        >
                            <option value="latest">{w.latestSort}</option>
                            <option value="oldest">{w.oldest}</option>
                            <option value="featured">{w.featured}</option>
                        </select>
                    </label>
                </div>
                <div className="data-row">
                    <span>
                        {result.meta.total} {w.results}
                    </span>
                    <button
                        className="text-button"
                        onClick={() => {
                            setFilters({
                                q: "",
                                kind: "",
                                year: "",
                                topic: "",
                                ministry: "",
                                from: "",
                                to: "",
                                sort: "latest",
                            });
                            setPage(1);
                        }}
                    >
                        {w.clear}
                    </button>
                </div>
            </div>
            {error && (
                <p role="alert" className="notice">
                    {error}
                </p>
            )}
            <div aria-busy={busy}>
                {result.data.length ? (
                    <Cards items={result.data} />
                ) : (
                    <div className="empty" role="status">
                        {busy ? "…" : w.empty}
                    </div>
                )}
            </div>
            <div className="pagination">
                <button
                    disabled={page <= 1 || busy}
                    onClick={() => setPage(page - 1)}
                >
                    {w.previous}
                </button>
                <span>
                    {page} / {result.meta.last_page}
                </span>
                <button
                    disabled={page >= result.meta.last_page || busy}
                    onClick={() => setPage(page + 1)}
                >
                    {w.next}
                </button>
            </div>
        </section>
    );
}
function ParliamentPage({ page, items }) {
    const rows = items.filter((i) => i.type === "parliament");
    return (
        <>
            <Hero page={page} />
            <LinkCards cards={page.cards} compact />
            <section className="container section parliament-layout">
                <div>
                    <Heading label={w.featured} title={page.section_title} />
                    <Cards items={rows.filter((i) => i.featured).slice(0, 5)} />
                    <Heading title={w.questions} />
                    <PostList items={rows.slice(0, 4)} />
                </div>
                <Focus rows={page.focus} />
            </section>
            <Archive type="parliament" parliament title={w.search} />
            <CTA page={page} />
        </>
    );
}
function MediaPage({ page, items }) {
    const media = items.filter((i) => i.type === "media"),
        interviews = media.filter((i) => i.embed_url),
        statements = media.filter((i) => !i.embed_url),
        feature = interviews.find((i) => i.featured) || interviews[0],
        galleries = items.filter((i) => i.type === "gallery"),
        community = items.filter((i) => i.type === "community");
    return (
        <>
            <Hero page={page} />
            {feature && (
                <section className="container section feature-story">
                    <VideoPlayer item={feature} />
                    <div>
                        <p className="eyebrow">{w.featured}</p>
                        <h2>{feature.title}</h2>
                        <p>{feature.excerpt}</p>
                        <Button to={href("articles/" + feature.slug)}>
                            {w.more}
                        </Button>
                    </div>
                </section>
            )}
            <div className="soft-band">
                <section className="container section">
                    <Heading
                        label={t.nav[5]}
                        title={w.interviews}
                        to={href("updates")}
                    />
                    <Cards items={interviews.slice(0, 3)} />
                </section>
            </div>
            <section className="container section">
                <Heading
                    label={locale === "fr" ? "COMMUNIQUÉS" : "PRESS STATEMENTS"}
                    title={
                        locale === "fr"
                            ? "Communiqués de presse"
                            : locale === "km"
                              ? "Bann kominike"
                              : "Press statements"
                    }
                />
                <Cards items={statements.slice(0, 3)} />
            </section>
            <section className="container section twin-sections">
                <div>
                    <Heading label={w.gallery} title={w.galleryTitle} />
                    {galleries[0] ? (
                        <>
                            <Gallery
                                title={galleries[0].title}
                                photos={galleries[0].gallery?.slice(0, 6)}
                            />
                            <a
                                className="text-link"
                                href={href("articles/" + galleries[0].slug)}
                            >
                                {w.all}
                                <ArrowRight size={16} />
                            </a>
                        </>
                    ) : (
                        <div className="empty">{t.empty}</div>
                    )}
                </div>
                <div>
                    <Heading label={w.community} title={w.communityTitle} />
                    <PostList items={community.slice(0, 3)} />
                </div>
            </section>
            <Archive type="media" title={w.interviews} />
            {galleries.length > 1 && (
                <section className="container section">
                    <Heading title={w.gallery} />
                    <Cards items={galleries} />
                </section>
            )}
            <CTA page={page} />
        </>
    );
}
function ConstituencyPage({ page }) {
    return (
        <>
            <Hero page={page} />
            <Intro page={page} />
            <div className="soft-band">
                <LinkCards cards={page.cards} />
            </div>
            <section className="no15-connect">
                <div className="container">
                    <div>
                        <p className="eyebrow light">NO. 15 CONNECT</p>
                        <h2>{w.connect}</h2>
                        <p>{page.cta_body}</p>
                        <Button to={href("contact")}>{t.contact}</Button>
                    </div>
                    <div>
                        {[w.latest, w.concern, w.community].map((s, i) => (
                            <div className="focus-row" key={s}>
                                <span className={"round-icon tone-" + i}>
                                    {i === 0 ? (
                                        <Mail />
                                    ) : i === 1 ? (
                                        <MessageCircle />
                                    ) : (
                                        <Users />
                                    )}
                                </span>
                                <h3>{s}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Archive type="community" title={w.communityTitle} />
            <FocusTiles rows={page.focus} title={w.focus} />
            <ConnectCards />
            <CTA page={page} />
        </>
    );
}
function ArticleDetail() {
    const [item, setItem] = useState(null),
        [error, setError] = useState("");
    useEffect(() => {
        api("/api/content/" + locale + "/" + location.pathname.split("/")[3])
            .then(setItem)
            .catch((e) => setError(e.message));
    }, []);
    if (error)
        return (
            <section className="container section">
                <h1>{w.waiting}</h1>
                <p>{error}</p>
            </section>
        );
    if (!item)
        return (
            <section className="container section" aria-busy="true">
                …
            </section>
        );
    return (
        <>
            <PageHero
                eyebrow={item.category || item.parliament_kind || item.type}
                title={item.title}
                description={item.excerpt}
            />
            <article className="container article-detail">
                {item.embed_url ? (
                    <VideoPlayer item={item} />
                ) : (
                    item.image && (
                        <img className="detail-cover" src={item.image} alt="" />
                    )
                )}
                {item.type === "parliament" && (
                    <dl className="record-details">
                        {[
                            ["Type", item.parliament_kind],
                            [w.year, item.session_year],
                            ["Reference", item.question_number],
                            [w.ministry, item.ministry],
                            [
                                locale === "fr"
                                    ? "Date de séance"
                                    : "Sitting date",
                                item.event_date,
                            ],
                        ]
                            .filter(([, v]) => v)
                            .map(([label, value]) => (
                                <div key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                    </dl>
                )}
                <p className="article-body">{item.body}</p>
                <div className="topic-chips">
                    {item.topics?.map((topic) => (
                        <a
                            key={topic}
                            href={
                                href(
                                    item.type === "parliament"
                                        ? "parliament"
                                        : "perspectives",
                                ) +
                                "?topic=" +
                                encodeURIComponent(topic)
                            }
                        >
                            {topic}
                        </a>
                    ))}
                </div>
                <Gallery title={item.title} photos={item.gallery} />
                {item.attachments?.length > 0 && (
                    <section className="attachments">
                        <h2>{locale === "fr" ? "Documents" : "Documents"}</h2>
                        {item.attachments.map((a) => (
                            <a key={a.id} href={a.url}>
                                <FileText />
                                <span>
                                    {a.name}
                                    <small>
                                        {(a.bytes / 1024).toFixed(0)} KB · PDF
                                    </small>
                                </span>
                                <Download size={20} />
                            </a>
                        ))}
                    </section>
                )}
                {item.source_url && (
                    <a
                        className="text-link"
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {locale === "fr"
                            ? "Source originale"
                            : "Original source"}
                        <ArrowUpRight size={17} />
                    </a>
                )}
            </article>
        </>
    );
}
function LegalPage({ page, title }) {
    return (
        <>
            <PageHero eyebrow="KL WEBSITE" title={page?.hero_title || title} />
            <article className="container article-detail">
                {page ? (
                    <p className="article-body">{page.intro_body}</p>
                ) : (
                    <p role="status" className="notice">
                        {w.legal}
                    </p>
                )}
            </article>
        </>
    );
}
function PerspectiveFeature({ page, items }) {
    const feature = items.find((i) => i.type === "article" && i.featured);
    return (
        <section className="container section feature-story">
            <div>
                {(feature?.image || page.intro_image) && (
                    <img src={feature?.image || page.intro_image} alt="" />
                )}
            </div>
            <div>
                <p className="eyebrow">{feature ? w.featured : page.eyebrow}</p>
                <h2>{feature?.title || page.intro_title}</h2>
                <p>{feature?.excerpt || page.intro_body}</p>
                <Button
                    to={
                        feature
                            ? href("articles/" + feature.slug)
                            : href("perspectives") + "#archive"
                    }
                >
                    {w.more}
                </Button>
            </div>
        </section>
    );
}
export function Website() {
    const [items, setItems] = useState([]),
        [settings, setSettings] = useState({}),
        [pages, setPages] = useState({}),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(true);
    useEffect(() => {
        Promise.all([
            api("/api/content/" + locale),
            api("/api/settings"),
            api("/api/pages/" + locale),
        ])
            .then(([c, s, p]) => {
                setItems(c.data);
                setSettings(s);
                setPages(p.data);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    const section = location.pathname.split("/")[2] || "home",
        page = pages[section];
    let body;
    if (section === "articles") body = <ArticleDetail />;
    else if (section === "contact")
        body = (
            <>
                <Hero
                    page={
                        page || {
                            eyebrow: t.sections.contact[0],
                            hero_title: t.sections.contact[1],
                            hero_body: t.sections.contact[2],
                        }
                    }
                />
                <Contact settings={settings} hideHero />
                {page && <CTA page={page} />}
            </>
        );
    else if (["privacy", "terms"].includes(section))
        body = (
            <LegalPage
                page={page}
                title={section === "privacy" ? t.privacy : t.terms}
            />
        );
    else if (section === "updates")
        body = (
            <>
                <PageHero eyebrow={w.latest} title={t.latest} />
                <Archive />
            </>
        );
    else if (loading)
        body = (
            <section className="container section" aria-busy="true">
                …
            </section>
        );
    else if (!page)
        body = (
            <>
                <PageHero eyebrow={t.nav[0]} title={w.waiting} />
                <section className="container section">
                    <p>{t.empty}</p>
                </section>
            </>
        );
    else if (section === "home") body = <HomePage page={page} items={items} />;
    else if (section === "about")
        body = (
            <>
                <Hero page={page} />
                <Intro page={page} about />
                <Milestones page={page} />
                <LinkCards cards={page.cards} heading={w.work} />
                <FocusTiles
                    rows={page.focus}
                    title={
                        locale === "fr"
                            ? "En un coup d’œil"
                            : locale === "km"
                              ? "An bref"
                              : "At a glance"
                    }
                />
                <CTA page={page} />
                <ConnectCards />
            </>
        );
    else if (section === "parliament")
        body = <ParliamentPage page={page} items={items} />;
    else if (section === "media")
        body = <MediaPage page={page} items={items} />;
    else if (section === "constituency")
        body = <ConstituencyPage page={page} />;
    else
        body = (
            <>
                <Hero page={page} />
                <LinkCards cards={page.cards} heading={page.section_title} />
                <PerspectiveFeature page={page} items={items} />
                <Archive type="article" title={t.sections.perspectives[1]} />
                <CTA page={page} />
            </>
        );
    return (
        <>
            <Header settings={settings} />
            {locale === "km" &&
                (!pages.home || !settings.kreol_interface_approved) && (
                    <div className="review-banner">
                        Kreol Morisien — {w.waiting}
                    </div>
                )}
            {error && (
                <p className="container notice" role="alert">
                    {error}
                </p>
            )}
            <main>{body}</main>
            <Footer settings={settings} />
        </>
    );
}
