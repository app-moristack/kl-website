import React, { useState, useEffect } from "react";
import {
    ArrowRight,
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
    Mail,
    MessageCircle,
    Play,
    FileText,
} from "lucide-react";
import { locale, t, href, Button } from "./shared";
import { Contact, Cards } from "./public-components";
export const text = (en, fr, km) => ({ en, fr, km })[locale] || en;
const ui = {
    about: text(
        "About Khushal Lobine",
        "À propos de Khushal Lobine",
        "Lor Khushal Lobine",
    ),
    message: text(
        "A Message from Khushal",
        "Un message de Khushal",
        "Enn mesaz Khushal",
    ),
    bio: text(
        "Read Full Biography",
        "Lire la biographie complète",
        "Lir biografi konple",
    ),
    latest: text(
        "Latest Updates",
        "Dernières actualités",
        "Bann dernie nouvel",
    ),
    focus: text("In Focus", "À la une", "An vedet"),
    topics: text("Key Perspectives", "Idées clés", "Bann lide prinsipal"),
    essay: text("Featured Essay", "Essai à la une", "Lartik an vedet"),
    readEssay: text(
        "Read the Full Essay",
        "Lire l’essai complet",
        "Lir lartik konple",
    ),
    articles: text(
        "Articles, Speeches, Interviews and Commentary",
        "Articles, discours, entretiens et commentaires",
        "Lartik, diskour, interview ek komanter",
    ),
    articlesSub: text(
        "Thoughts, analysis and contributions to national debate on the issues that matter.",
        "Réflexions, analyses et contributions au débat national sur les enjeux essentiels.",
        "Bann lide, analiz ek kontribision dan deba nasional lor seki konte.",
    ),
    journey: text(
        "A Journey of Service",
        "Un parcours au service du public",
        "Enn parkour dan servis piblik",
    ),
    milestones: text("Key Milestones", "Étapes clés", "Bann letap inportan"),
    multifaceted: text(
        "A Multifaceted Commitment",
        "Un engagement multiple",
        "Enn langazman dan plizier domenn",
    ),
    work: text("Areas of Work", "Domaines d’action", "Bann domenn travay"),
    commitment: text("My Commitment", "Mon engagement", "Mo langazman"),
    glance: text("At a Glance", "En un coup d’œil", "An bref"),
    featured: text(
        "Featured Legislative Work",
        "Travail législatif à la une",
        "Travay lezislatif an vedet",
    ),
    recent: text(
        "Recent Interventions",
        "Interventions récentes",
        "Bann dernie intervansion",
    ),
    debate: text(
        "Contributing to national debate",
        "Contribuer au débat national",
        "Kontribie dan deba nasional",
    ),
    legislative: text(
        "Key legislative work and contributions in Parliament.",
        "Travail législatif et contributions au Parlement.",
        "Bann travay lezislatif ek kontribision dan Parlman.",
    ),
    focusAreas: text("Focus Areas", "Domaines prioritaires", "Bann priorite"),
    legislativeFocus: text(
        "Building a better Mauritius through legislative action",
        "Construire une île Maurice meilleure par l’action législative",
        "Konstrir enn meyer Moris atraver bann lalwa",
    ),
    archive: text(
        "Search Parliamentary Questions and Speeches",
        "Rechercher les questions et discours parlementaires",
        "Rod bann kestyon ek diskour dan Parlman",
    ),
    community: text("In the Community", "Dans la communauté", "Dan kominote"),
    connect: text(
        "Stay Connected with No. 15",
        "Restez en contact avec le n° 15",
        "Res an kontak avek No. 15",
    ),
    connectBody: text(
        "No. 15 Connect is a dedicated way for residents of La Caverne and Phoenix to stay informed, share their concerns and contribute ideas for our community.",
        "No. 15 Connect permet aux habitants de La Caverne et Phoenix de s’informer, de partager leurs préoccupations et leurs idées.",
        "No. 15 Connect permet bann abitan La Caverne ek Phoenix gagn bann nouvel, partaz zot bann konsern ek bann lide.",
    ),
    updates: text(
        "Receive Updates",
        "Recevoir les actualités",
        "Resevwar bann nouvel",
    ),
    concerns: text(
        "Share Your Concerns",
        "Partager vos préoccupations",
        "Partaz ou bann konsern",
    ),
    conversation: text(
        "Be Part of the Conversation",
        "Participer au dialogue",
        "Partisip dan konversasion",
    ),
    local: text(
        "Key Focus Areas in No. 15",
        "Priorités dans le n° 15",
        "Bann priorite dan No. 15",
    ),
    localTitle: text(
        "Addressing Local Concerns, Building Solutions",
        "Répondre aux préoccupations locales, bâtir des solutions",
        "Reponn bann konsern lokal, konstrir bann solision",
    ),
    interviews: text("Interviews", "Entretiens", "Bann interview"),
    statements: text(
        "Press Statements",
        "Communiqués de presse",
        "Bann kominike lapres",
    ),
    gallery: text("Photo Gallery", "Galerie photo", "Galri foto"),
    moments: text(
        "Moments from the Journey",
        "Les moments du parcours",
        "Bann moman nou parkour",
    ),
    engagements: text(
        "Public Engagements",
        "Rencontres publiques",
        "Bann rankont piblik",
    ),
    people: text(
        "Engaging with People",
        "À la rencontre des citoyens",
        "Rankont bann dimoun",
    ),
    dialogue: text(
        "Dialogue for a Fairer Mauritius",
        "Dialoguer pour une île Maurice plus juste",
        "Dialog pou enn Moris pli zis",
    ),
    stay: text("Stay informed", "Restez informés", "Res informe"),
    staySub: text(
        "Follow Khushal Lobine’s latest interviews, statements and public engagement.",
        "Suivez les derniers entretiens, déclarations et rencontres de Khushal Lobine.",
        "Swiv bann dernie interview, deklarasion ek rankont Khushal Lobine.",
    ),
    reach: text("Get in Touch", "Contactez-nous", "Kontak nou"),
    concern: text(
        "Submit a Concern",
        "Signaler une préoccupation",
        "Partaz enn konsern",
    ),
    appointment: text(
        "Request an Appointment",
        "Demander un rendez-vous",
        "Demann enn randevou",
    ),
    whatsapp: text(
        "No. 15 Connect on WhatsApp",
        "No. 15 Connect sur WhatsApp",
        "No. 15 Connect lor WhatsApp",
    ),
    concernBody: text(
        "Share an issue or suggestion related to your community.",
        "Partagez un problème ou une suggestion pour votre communauté.",
        "Partaz enn problem ouswa enn sigzesion pou ou kominote.",
    ),
    appointmentBody: text(
        "Meet with Khushal Lobine or his team.",
        "Rencontrez Khushal Lobine ou son équipe.",
        "Rankont Khushal Lobine ouswa so lekip.",
    ),
    whatsappBody: text(
        "Stay connected for updates and community information.",
        "Restez en contact pour les actualités locales.",
        "Res an kontak pou bann nouvel kominote.",
    ),
    submit: text("Submit Now", "Envoyer", "Avoy aster"),
    request: text("Request Now", "Faire une demande", "Fer enn demann"),
    join: text(
        "Join on WhatsApp",
        "Rejoindre sur WhatsApp",
        "Zwenn lor WhatsApp",
    ),
    allTopics: text(
        "Explore by Topic",
        "Explorer par thème",
        "Dekouver par tem",
    ),
    all: text("All", "Tout", "Tou"),
    quick: text("Quick Links", "Liens utiles", "Bann lien itil"),
    follow: text("Follow", "Suivez-nous", "Swiv nou"),
    roles: text(
        "Member of Parliament · Barrister-at-Law · Leader of Nouveaux Démocrates",
        "Député · Avocat · Leader des Nouveaux Démocrates",
        "Depite · Avoka · Lider Nouveaux Démocrates",
    ),
};
const iconMap = {
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
function Icon({ name, index = 0 }) {
    const I = iconMap[name] || FileText;
    return (
        <span className={"tpl-icon tone-" + (index % 3)}>
            <I size={25} />
        </span>
    );
}
function Heading({ label, title, to }) {
    return (
        <div className="tpl-heading">
            <div>
                {label && <p className="tpl-label">{label}</p>}
                <h2>{title}</h2>
            </div>
            {to && (
                <a className="tpl-link" href={to}>
                    {t.all} <ArrowRight size={15} />
                </a>
            )}
        </div>
    );
}
function Hero({ section, page }) {
    return (
        <section
            className={"tpl-hero tpl-hero-" + section}
            style={{ "--scenery": `url(${page.hero_background})` }}
        >
            <img
                className="tpl-hero-photo"
                src={page.hero_image}
                alt="Khushal Lobine"
                fetchPriority="high"
            />
            <div className="tpl-wrap">
                <div className="tpl-hero-copy">
                    {page.eyebrow && (
                        <p className="tpl-label">{page.eyebrow}</p>
                    )}
                    <h1>
                        {page.hero_title}
                        <br />
                        <em>{page.hero_accent}</em>
                    </h1>
                    <div className="tpl-hero-body">
                        {page.hero_body?.split("\n\n").map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                    <div className="button-row">
                        {page.primary_label && (
                            <Button to={page.primary_url}>
                                {page.primary_label}
                            </Button>
                        )}
                        {page.secondary_label && (
                            <Button secondary to={page.secondary_url}>
                                {page.secondary_label}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
function Intro({ page, section }) {
    return (
        <section id="biography" className="tpl-wrap tpl-intro">
            <img
                src={page.intro_image || "/images/template-home-portrait.jpg"}
                alt="Khushal Lobine"
            />
            <div>
                <p className="tpl-label">
                    {section === "constituency" ? t.nav[3] : ui.about}
                </p>
                <h2>{page.intro_title}</h2>
                <p className="tpl-prose">{page.intro_body}</p>
                <Button
                    to={
                        section === "constituency"
                            ? href("constituency") + "#community"
                            : href("about") + "#milestones"
                    }
                >
                    {section === "constituency" ? t.read : ui.bio}
                </Button>
            </div>
            <blockquote>
                <span className="tpl-quote-mark">“</span>
                {section === "home" && <h3>{ui.message}</h3>}
                <p className="tpl-prose">{page.quote}</p>
                <cite>{page.signature || "KHUSHAL LOBINE"}</cite>
            </blockquote>
        </section>
    );
}
function Grid({ rows = [], className = "", action = t.read }) {
    return (
        <div
            className={"tpl-grid " + className}
            style={{ "--columns": Math.min(rows.length, 6) }}
        >
            {rows.map((r, i) => (
                <a className="tpl-card" href={r.url || href("contact")} key={i}>
                    {r.image && <img src={r.image} alt="" loading="lazy" />}
                    {r.year && (
                        <span className="tpl-date">
                            {Number.isNaN(new Date(r.year).getTime())
                                ? r.year
                                : new Intl.DateTimeFormat(
                                      locale === "km" ? "fr" : locale,
                                      {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                      },
                                  ).format(new Date(r.year))}
                        </span>
                    )}
                    <div className="tpl-card-body">
                        <Icon name={r.icon} index={i} />
                        <h3>{r.title}</h3>
                        {r.body && <p>{r.body}</p>}
                        <span className="tpl-link">
                            {action} <ArrowRight size={15} />
                        </span>
                    </div>
                </a>
            ))}
        </div>
    );
}
function CTA({ page, section }) {
    return (
        <section id="community" className={"tpl-cta tpl-cta-" + section}>
            <div className="tpl-wrap">
                <div>
                    <p className="tpl-label">
                        {section === "about"
                            ? ui.commitment
                            : section === "home"
                              ? ui.focus
                              : ui.community}
                    </p>
                    <h2>{page.cta_title}</h2>
                    <p>{page.cta_body}</p>
                    <Button to={page.cta_url}>{page.cta_label}</Button>
                </div>
                <img
                    src={page.cta_image}
                    alt={
                        section === "home" || section === "perspectives"
                            ? "Khushal Lobine"
                            : text(
                                  "Community gathering",
                                  "Rencontre avec la communauté",
                                  "Rankont kominote",
                              )
                    }
                    loading="lazy"
                />
            </div>
        </section>
    );
}
function Connect({ settings }) {
    return (
        <section className="tpl-connect">
            <div className="tpl-wrap">
                <Heading label={t.contact} title={ui.reach} />
                <div className="tpl-connect-grid">
                    {[
                        [
                            Mail,
                            ui.concern,
                            ui.concernBody,
                            ui.submit,
                            "concern",
                        ],
                        [
                            Calendar,
                            ui.appointment,
                            ui.appointmentBody,
                            ui.request,
                            "appointment",
                        ],
                        [
                            MessageCircle,
                            ui.whatsapp,
                            ui.whatsappBody,
                            settings.whatsapp ? ui.join : t.contact,
                            "general",
                        ],
                    ].map(([I, title, body, action, kind], i) => (
                        <a
                            key={kind}
                            href={
                                kind === "general" && settings.whatsapp
                                    ? settings.whatsapp
                                    : href("contact") + "?kind=" + kind
                            }
                        >
                            <span className={"tpl-icon tone-" + i}>
                                <I />
                            </span>
                            <div>
                                <h3>{title}</h3>
                                <p>{body}</p>
                                <span className="tpl-link">{action} →</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
function GallerySection({ Gallery }) {
    return (
        <Gallery
            title={ui.moments}
            photos={[
                "media-gallery",
                "about-community",
                "constituency-community",
            ].map((name) => ({
                image: "/images/template-" + name + ".jpg",
                alt: ui.community,
                caption: ui.community,
            }))}
        />
    );
}
function ArchivePanel({ Archive, ...props }) {
    const [open, setOpen] = useState(
        Boolean(location.search) ||
            ["#archive", "#media-archive"].includes(location.hash),
    );
    useEffect(() => {
        const reveal = () => {
            if (["#archive", "#media-archive"].includes(location.hash))
                setOpen(true);
        };
        window.addEventListener("hashchange", reveal);
        return () => window.removeEventListener("hashchange", reveal);
    }, []);
    return (
        <details
            className="tpl-wrap tpl-archive-panel"
            open={open}
            onToggle={(event) => setOpen(event.currentTarget.open)}
        >
            <summary>
                <BookOpen size={26} />
                <strong>{props.title}</strong>
                <span>+</span>
            </summary>
            <Archive {...props} />
        </details>
    );
}
export function TemplatePage({
    section,
    page,
    items,
    settings,
    Archive,
    VideoPlayer,
    Gallery,
}) {
    const records = items.filter((i) => i.type !== "gallery");
    const parliament = items.filter((i) => i.type === "parliament");
    const interviews = items.filter((i) => i.type === "media" && i.embed_url);
    const feature = interviews.find((i) => i.featured) || interviews[0];
    return (
        <div className="template-site">
            <Hero section={section} page={page} />
            {["home", "about", "constituency"].includes(section) && (
                <Intro page={page} section={section} />
            )}
            {section === "home" && (
                <>
                    <div className="tpl-soft">
                        <section className="tpl-wrap tpl-section">
                            <Grid
                                rows={page.cards}
                                className="tpl-landscape-cards"
                            />
                        </section>
                    </div>
                    <section className="tpl-wrap tpl-section">
                        <Heading
                            label={ui.latest}
                            title={page.section_title}
                            to={href("updates")}
                        />
                        {records.length ? (
                            <Cards items={records.slice(0, 3)} />
                        ) : (
                            <Grid
                                rows={page.milestones}
                                className="tpl-news-cards"
                            />
                        )}
                    </section>
                    <CTA page={page} section={section} />
                    <Connect settings={settings} />
                </>
            )}
            {section === "about" && (
                <>
                    <section id="milestones" className="tpl-soft tpl-section">
                        <div className="tpl-wrap">
                            <Heading label={ui.journey} title={ui.milestones} />
                            <ol className="tpl-timeline">
                                {page.milestones?.map((r, i) => (
                                    <li key={i}>
                                        <Icon
                                            name={
                                                r.icon ||
                                                [
                                                    "book",
                                                    "gavel",
                                                    "book",
                                                    "users",
                                                    "shield",
                                                    "landmark",
                                                    "leaf",
                                                    "users",
                                                ][i]
                                            }
                                            index={i}
                                        />
                                        <h3>
                                            {r.title}
                                            {r.year && " " + r.year}
                                        </h3>
                                        <p>{r.body}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>
                    <section className="tpl-wrap tpl-section">
                        <Heading label={ui.multifaceted} title={ui.work} />
                        <Grid rows={page.cards} className="tpl-about-cards" />
                    </section>
                    <CTA page={page} section={section} />
                    <section className="tpl-wrap tpl-section">
                        <Heading label="Khushal Lobine" title={ui.glance} />
                        <Grid
                            rows={page.focus}
                            className="tpl-facts"
                            action=""
                        />
                    </section>
                </>
            )}
            {section === "parliament" && (
                <>
                    <section className="tpl-wrap tpl-section">
                        <Grid
                            rows={page.cards}
                            className="tpl-services"
                            action={t.explore}
                        />
                    </section>
                    <section className="tpl-wrap tpl-section tpl-parliament">
                        <div>
                            <Heading
                                label={ui.featured}
                                title={page.section_title}
                            />
                            <p>{ui.legislative}</p>
                            {parliament.some((i) => i.featured) ? (
                                <Cards
                                    items={parliament
                                        .filter((i) => i.featured)
                                        .slice(0, 5)}
                                />
                            ) : (
                                <Grid
                                    rows={page.milestones}
                                    className="tpl-legislation"
                                />
                            )}
                        </div>
                        <aside className="tpl-focus">
                            <Heading
                                label={ui.focusAreas}
                                title={ui.legislativeFocus}
                            />
                            {page.focus?.map((r, i) => (
                                <div key={i}>
                                    <Icon name={r.icon} />
                                    <div>
                                        <h3>{r.title}</h3>
                                        <p>{r.body}</p>
                                    </div>
                                </div>
                            ))}
                        </aside>
                    </section>
                    <section className="tpl-wrap tpl-section">
                        <Heading
                            label={ui.recent}
                            title={ui.debate}
                            to="#archive"
                        />
                        <div className="tpl-records">
                            {(parliament.length
                                ? parliament.slice(0, 3).map((r) => ({
                                      ...r,
                                      url: href("articles/" + r.slug),
                                  }))
                                : page.milestones?.slice(0, 3)
                            ).map((r, i) => (
                                <a key={i} href={r.url}>
                                    <FileText />
                                    <strong>{r.title}</strong>
                                    <ArrowRight />
                                </a>
                            ))}
                        </div>
                    </section>
                    <ArchivePanel
                        Archive={Archive}
                        type="parliament"
                        parliament
                        title={ui.archive}
                    />
                    <CTA page={page} section={section} />
                </>
            )}
            {section === "constituency" && (
                <>
                    <div className="tpl-soft">
                        <section className="tpl-wrap tpl-section">
                            <Grid
                                rows={page.cards}
                                className="tpl-landscape-cards"
                            />
                        </section>
                    </div>
                    <section className="tpl-no15">
                        <div className="tpl-wrap">
                            <div>
                                <p className="tpl-label">No. 15 Connect</p>
                                <h2>{ui.connect}</h2>
                                <p>{ui.connectBody}</p>
                                <Button
                                    to={settings.whatsapp || href("contact")}
                                >
                                    {t.contact}
                                </Button>
                            </div>
                            <div className="tpl-no15-benefits">
                                {[ui.updates, ui.concerns, ui.conversation].map(
                                    (s, i) => (
                                        <div key={s}>
                                            <Icon
                                                name={
                                                    [
                                                        "lightbulb",
                                                        "map",
                                                        "users",
                                                    ][i]
                                                }
                                                index={i}
                                            />
                                            <h3>{s}</h3>
                                        </div>
                                    ),
                                )}
                            </div>
                            <img
                                src="/images/template-constituency-phone.jpg"
                                alt="No. 15 Connect"
                            />
                        </div>
                    </section>
                    <CTA page={page} section={section} />
                    <section className="tpl-wrap tpl-section">
                        <Heading label={ui.local} title={ui.localTitle} />
                        <Grid
                            rows={page.focus}
                            className="tpl-landscape-cards"
                        />
                    </section>
                    <Connect settings={settings} />
                </>
            )}
            {section === "perspectives" && (
                <>
                    <section className="tpl-wrap tpl-section">
                        <Heading label={ui.topics} title={page.section_title} />
                        <Grid
                            rows={page.cards}
                            className="tpl-topics"
                            action=""
                        />
                    </section>
                    <section className="tpl-soft">
                        <div className="tpl-wrap tpl-section tpl-feature">
                            <img src={page.intro_image} alt="Khushal Lobine" />
                            <div>
                                <Heading
                                    label={ui.essay}
                                    title={page.intro_title}
                                />
                                <p>{page.intro_body}</p>
                                <Button to="#archive">{ui.readEssay}</Button>
                            </div>
                        </div>
                    </section>
                    <section className="tpl-wrap tpl-section">
                        <p className="tpl-label">{ui.allTopics}</p>
                        <div className="tpl-topic-links">
                            <a href={href("perspectives") + "#archive"}>
                                {ui.all}
                            </a>
                            {page.cards?.map((r) => (
                                <a href={r.url} key={r.title}>
                                    {r.title}
                                </a>
                            ))}
                        </div>
                        <Heading title={ui.articles} to="#archive" />
                        <p>{ui.articlesSub}</p>
                        {records.some((i) => i.type === "article") ? (
                            <Cards
                                items={records
                                    .filter((i) => i.type === "article")
                                    .slice(0, 3)}
                            />
                        ) : (
                            <Grid
                                rows={page.milestones}
                                className="tpl-news-cards"
                            />
                        )}
                    </section>
                    <ArchivePanel
                        Archive={Archive}
                        type="article"
                        title={ui.articles}
                    />
                    <CTA page={page} section={section} />
                </>
            )}
            {section === "media" && (
                <>
                    <section className="tpl-wrap tpl-section tpl-media-feature">
                        <div>
                            {feature ? (
                                <VideoPlayer item={feature} />
                            ) : (
                                <img
                                    src={page.intro_image}
                                    alt="Khushal Lobine"
                                />
                            )}
                        </div>
                        <div>
                            <Heading
                                label={ui.focus}
                                title={feature?.title || page.intro_title}
                            />
                            <p>{feature?.excerpt || page.intro_body}</p>
                            <Button
                                to={
                                    feature
                                        ? href("articles/" + feature.slug)
                                        : "#media-archive"
                                }
                            >
                                {feature ? t.read : t.all}
                            </Button>
                        </div>
                        <blockquote>
                            <span className="tpl-quote-mark">“</span>
                            <p>{page.quote}</p>
                            <cite>KHUSHAL LOBINE</cite>
                        </blockquote>
                    </section>
                    <section className="tpl-soft">
                        <div className="tpl-wrap tpl-section">
                            <Heading
                                label={ui.interviews}
                                title={ui.interviews}
                                to="#media-archive"
                            />
                            {interviews.length ? (
                                <Cards items={interviews.slice(0, 3)} />
                            ) : (
                                <Grid
                                    rows={page.cards}
                                    className="tpl-news-cards"
                                />
                            )}
                        </div>
                    </section>
                    <section className="tpl-wrap tpl-section">
                        <Heading
                            label={ui.statements}
                            title={ui.statements}
                            to="#media-archive"
                        />
                        <Grid rows={page.focus} className="tpl-statements" />
                    </section>
                    <section className="tpl-wrap tpl-section tpl-media-bottom">
                        <div>
                            <Heading label={ui.gallery} title={ui.moments} />
                            <GallerySection Gallery={Gallery} />
                        </div>
                        <div>
                            <Heading
                                label={ui.engagements}
                                title={ui.community}
                            />
                            {[ui.people, ui.dialogue].map((title, i) => (
                                <a
                                    className="tpl-engagement"
                                    key={title}
                                    href={href("constituency")}
                                >
                                    <Icon name="users" index={i} />
                                    <div>
                                        <h3>{title}</h3>
                                        <p>
                                            {i === 0
                                                ? ui.concernBody
                                                : t.contactSub}
                                        </p>
                                    </div>
                                    <img
                                        src={
                                            "/images/template-" +
                                            (i === 0
                                                ? "home-community"
                                                : "about-portrait") +
                                            ".jpg"
                                        }
                                        alt=""
                                    />
                                </a>
                            ))}
                        </div>
                    </section>
                    <div id="media-archive">
                        <ArchivePanel
                            Archive={Archive}
                            type="media"
                            title={ui.interviews}
                        />
                    </div>
                    <section className="tpl-stay">
                        <div className="tpl-wrap">
                            <h2>{ui.stay}</h2>
                            <p>{ui.staySub}</p>
                            <Button to={href("updates")}>{t.all}</Button>
                        </div>
                    </section>
                </>
            )}
            {section === "contact" && (
                <>
                    <Contact settings={settings} hideHero />
                    <CTA page={page} section={section} />
                </>
            )}
        </div>
    );
}
export { ui };
