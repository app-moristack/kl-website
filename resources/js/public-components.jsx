import React, { useState } from "react";
import {
    Menu,
    X,
    ArrowRight,
    ArrowUpRight,
    Mail,
    MapPin,
    FileText,
    Landmark,
    Calendar,
    MessageCircle,
    Facebook,
    Instagram,
    Youtube,
    Linkedin,
    Phone,
} from "lucide-react";
import { locale, t, paths, href, api, Brand, Button } from "./shared";
import { ReferenceImage } from "./reference-layout";
const tr = (en, fr, km) => ({ en, fr, km })[locale] || en;
function Header({ settings = {} }) {
    const [open, setOpen] = useState(false);
    const current = location.pathname.split("/")[2] || "";
    return (
        <header className="header">
            <div className="nav-wrap">
                <Brand />
                <button
                    className="menu-toggle"
                    onClick={() => setOpen(!open)}
                    aria-label={tr(
                        "Toggle menu",
                        "Ouvrir le menu",
                        "Ouver meni",
                    )}
                    aria-expanded={open}
                >
                    {open ? <X /> : <Menu />}
                </button>
                <nav
                    className={open ? "open" : ""}
                    aria-label="Main navigation"
                >
                    {paths.map((p, i) => (
                        <a
                            key={p}
                            aria-current={current === p ? "page" : undefined}
                            className={current === p ? "active" : ""}
                            href={href(p)}
                        >
                            {t.nav[i]}
                        </a>
                    ))}
                </nav>
                {settings.party_url && (
                    <a
                        className="party-link"
                        href={settings.party_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Nouveaux Démocrates <ArrowUpRight size={13} />
                    </a>
                )}
                <div className="languages" aria-label="Language">
                    {["en", "fr", "km"].map((l) => (
                        <a
                            key={l}
                            lang={l === "km" ? "mfe" : l}
                            className={locale === l ? "selected" : ""}
                            href={`/${l}/${location.pathname.split("/").slice(2).join("/")}`.replace(
                                /\/$/,
                                "",
                            )}
                        >
                            {l === "km" ? "KR" : l.toUpperCase()}
                        </a>
                    ))}
                </div>
            </div>
        </header>
    );
}
function Footer({ settings = {} }) {
    const socials = [
        [Facebook, "Facebook", settings.facebook],
        [Instagram, "Instagram", settings.instagram],
        [Youtube, "YouTube", settings.youtube],
        [Linkedin, "LinkedIn", settings.linkedin],
    ].filter(([, , url]) => url);
    return (
        <footer className="shared-footer">
            <div className="tpl-wrap">
                <div>
                    <Brand />
                    <p>
                        {tr(
                            "Member of Parliament · Barrister-at-Law · Leader of Nouveaux Démocrates",
                            "Député · Avocat · Leader des Nouveaux Démocrates",
                            "Depite · Avoka · Lider Nouveaux Démocrates",
                        )}
                    </p>
                </div>
                <div>
                    <h4>
                        {tr("Quick Links", "Liens utiles", "Bann lien itil")}
                    </h4>
                    {paths.map((p, i) => (
                        <a key={p} href={href(p)}>
                            {t.nav[i]}
                        </a>
                    ))}
                </div>
                <div>
                    <h4>{tr("Follow", "Suivez-nous", "Swiv nou")}</h4>
                    <div className="social-links">
                        {socials.map(([I, label, url]) => (
                            <a
                                key={label}
                                href={url}
                                aria-label={label}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <I size={16} />
                            </a>
                        ))}
                    </div>
                    {!socials.length && <a href={href("media")}>{t.nav[5]}</a>}
                </div>
                <div>
                    <h4>{t.nav[6]}</h4>
                    {settings.phone && (
                        <a
                            href={
                                "tel:" + settings.phone.replace(/[^+0-9]/g, "")
                            }
                        >
                            <Phone size={13} /> {settings.phone}
                        </a>
                    )}
                    {settings.email && (
                        <a href={"mailto:" + settings.email}>
                            <Mail size={13} /> {settings.email}
                        </a>
                    )}
                    {settings.address && (
                        <p>
                            <MapPin size={13} /> {settings.address}
                        </p>
                    )}
                    <a href={href("contact")}>{t.contact}</a>
                </div>
                <div className="flag-block">
                    <span
                        className="flag"
                        aria-label={tr(
                            "Mauritius flag",
                            "Drapeau mauricien",
                            "Paviyon Moris",
                        )}
                    />
                    <p>{t.footer}</p>
                </div>
            </div>
            <div className="footer-bottom">
                <span>
                    © {new Date().getFullYear()} Khushal Lobine.{" "}
                    {tr(
                        "All rights reserved.",
                        "Tous droits réservés.",
                        "Tou drwa rezerve.",
                    )}
                </span>
                <div>
                    <a href={href("privacy")}>{t.privacy}</a>
                    <a href={href("terms")}>{t.terms}</a>
                </div>
            </div>
        </footer>
    );
}
function Contact({ settings, hideHero = false }) {
    const [state, setState] = useState("");
    const [busy, setBusy] = useState(false);
    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setState("");
        const form = new FormData(e.currentTarget);
        try {
            await api("/api/enquiries", {
                method: "POST",
                body: JSON.stringify({
                    ...Object.fromEntries(form),
                    locale,
                    consent: form.get("consent") === "on",
                }),
            });
            setState(t.received);
            e.target.reset();
        } catch (err) {
            setState(err.message);
        } finally {
            setBusy(false);
        }
    }
    return (
        <>
            {!hideHero && (
                <PageHero
                    eyebrow={t.sections.contact[0]}
                    title={t.sections.contact[1]}
                    description={t.sections.contact[2]}
                />
            )}
            <section className="container contact-grid section">
                <form className="contact-form" onSubmit={submit}>
                    <p className="eyebrow">
                        {tr(
                            "Send us a message",
                            "Envoyez-nous un message",
                            "Avoy nou enn mesaz",
                        )}
                    </p>
                    <h2>
                        {tr(
                            "General Enquiries",
                            "Demandes générales",
                            "Bann demann zeneral",
                        )}
                    </h2>
                    <p>
                        {tr(
                            "Have a question, suggestion or comment? Fill in the form below and our team will get back to you.",
                            "Une question, une suggestion ou un commentaire ? Remplissez le formulaire et notre équipe vous répondra.",
                            "Enn kestyon, sigzesion ouswa komanter? Ranpli sa form-la ek nou lekip pou reponn ou.",
                        )}
                    </p>
                    <div className="form-two">
                        <label>
                            {t.name}
                            <input
                                name="name"
                                required
                                maxLength={120}
                                autoComplete="name"
                            />
                        </label>
                        <label>
                            {t.email}
                            <input
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                            />
                        </label>
                    </div>
                    <label>
                        {t.subject}
                        <input name="subject" required maxLength={180} />
                    </label>
                    <label>
                        {tr("Enquiry type", "Type de demande", "Tip demann")}
                        <select
                            name="kind"
                            defaultValue={
                                new URLSearchParams(location.search).get(
                                    "kind",
                                ) || "general"
                            }
                        >
                            <option value="general">{t.subject}</option>
                            <option value="concern">
                                {tr(
                                    "Submit a concern",
                                    "Signaler une préoccupation",
                                    "Partaz enn konsern",
                                )}
                            </option>
                            <option value="appointment">
                                {tr(
                                    "Appointment request",
                                    "Demande de rendez-vous",
                                    "Demann enn randevou",
                                )}
                            </option>
                            <option value="media">{t.nav[5]}</option>
                        </select>
                    </label>
                    <label>
                        {t.body}
                        <textarea
                            name="message"
                            rows={6}
                            minLength={10}
                            maxLength={5000}
                            required
                        />
                    </label>
                    <input
                        className="honeypot"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                    />
                    <label className="check-label">
                        <input type="checkbox" name="consent" required />
                        {t.consent}
                    </label>
                    <Button disabled={busy}>{busy ? "…" : t.send}</Button>
                    {state && (
                        <p role="status" className="notice">
                            {state}
                        </p>
                    )}
                </form>
                <aside className="contact-options">
                    <p className="eyebrow">
                        {tr(
                            "Other ways to reach out",
                            "Autres moyens de nous contacter",
                            "Bann lezot fason pou kontak nou",
                        )}
                    </p>
                    <h2>
                        {tr(
                            "How can we help?",
                            "Comment pouvons-nous vous aider ?",
                            "Kouma nou kapav ed ou?",
                        )}
                    </h2>
                    <div className="contact-options-grid">
                        {[
                            [
                                FileText,
                                tr(
                                    "Submit a Concern",
                                    "Signaler une préoccupation",
                                    "Partaz enn konsern",
                                ),
                                "concern",
                                tr(
                                    "Share an issue, suggestion or concern about your community.",
                                    "Partagez un problème, une suggestion ou une préoccupation locale.",
                                    "Partaz enn problem, sigzesion ouswa konsern lor ou kominote.",
                                ),
                            ],
                            [
                                Calendar,
                                tr(
                                    "Request an Appointment",
                                    "Demander un rendez-vous",
                                    "Demann enn randevou",
                                ),
                                "appointment",
                                tr(
                                    "Request a meeting with Khushal Lobine or his team at the constituency office.",
                                    "Demandez une rencontre avec Khushal Lobine ou son équipe au bureau de circonscription.",
                                    "Demann enn rankont avek Khushal Lobine ouswa so lekip dan biro sirkonskripsion.",
                                ),
                            ],
                            [
                                MessageCircle,
                                tr(
                                    "No. 15 Connect on WhatsApp",
                                    "No. 15 Connect sur WhatsApp",
                                    "No. 15 Connect lor WhatsApp",
                                ),
                                "general",
                                tr(
                                    "Stay connected for updates, community news and important announcements.",
                                    "Restez en contact pour les actualités locales et les annonces importantes.",
                                    "Res an kontak pou bann nouvel kominote ek bann lanons inportan.",
                                ),
                            ],
                            [
                                Mail,
                                tr(
                                    "Media Enquiries",
                                    "Demandes des médias",
                                    "Bann demann media",
                                ),
                                "media",
                                tr(
                                    "For media requests, interviews or press-related enquiries.",
                                    "Pour les demandes de presse et les entretiens.",
                                    "Pou bann demann lapres ek interview.",
                                ),
                            ],
                        ].map(([Icon, title, kind, body], i) => (
                            <a
                                className="contact-option"
                                key={kind}
                                href={
                                    kind === "general" && settings.whatsapp
                                        ? settings.whatsapp
                                        : href("contact") + "?kind=" + kind
                                }
                            >
                                <span className={"round-icon tone-" + i}>
                                    <Icon />
                                </span>
                                <h3>{title}</h3>
                                <p>{body}</p>
                                <span className="text-link">{t.contact} →</span>
                            </a>
                        ))}
                    </div>
                </aside>
            </section>
            <section className="contact-office">
                <div className="container">
                    <div>
                        <p className="eyebrow">
                            {tr(
                                "Constituency office",
                                "Bureau de circonscription",
                                "Biro sirkonskripsion",
                            )}
                        </p>
                        <h2>
                            {tr(
                                "Constituency Office",
                                "Bureau de circonscription",
                                "Biro sirkonskripsion",
                            )}{" "}
                            — No. 15
                        </h2>
                        <p>{t.contactSub}</p>
                        {[
                            [Mail, t.contact, settings.email],
                            [
                                Calendar,
                                locale === "fr"
                                    ? "Rendez-vous"
                                    : "Constituency Appointments",
                                settings.phone,
                            ],
                            [MapPin, "La Caverne & Phoenix", settings.address],
                        ].map(([Icon, title, detail]) => (
                            <div className="office-row" key={title}>
                                <span className="round-icon">
                                    <Icon />
                                </span>
                                <div>
                                    <h3>{title}</h3>
                                    {detail && <p>{detail}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <img
                            src="/images/template-contact-map.jpg"
                            alt={tr(
                                "Illustrative map; contact the office for the exact location",
                                "Carte illustrative ; contactez le bureau pour le lieu exact",
                                "Kart ilistratif; kontak biro pou ladres exak",
                            )}
                        />
                        <div className="office-map-caption">
                            <MapPin />
                            <div>
                                <strong>
                                    {tr(
                                        "Constituency Office No. 15",
                                        "Bureau de circonscription n° 15",
                                        "Biro sirkonskripsion No. 15",
                                    )}
                                </strong>
                                <p>
                                    {settings.address ||
                                        "La Caverne & Phoenix, Mauritius"}
                                </p>
                                <small>
                                    {tr(
                                        "Contact the office for exact location details.",
                                        "Contactez le bureau pour obtenir les détails du lieu.",
                                        "Kontak biro pou gagn ladres exak.",
                                    )}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
function Cards({ items }) {
    return items.length ? (
        <div className="article-grid">
            {items.map((item) => (
                <a
                    className="article-card"
                    href={href("articles/" + item.slug)}
                    key={item.id}
                >
                    <div className="article-image">
                        {item.image ? (
                            <img src={item.image} alt="" loading="lazy" />
                        ) : (
                            <div className="abstract-image">
                                <Landmark size={55} />
                            </div>
                        )}
                        <span className="category">
                            {item.category || item.type}
                        </span>
                    </div>
                    <div className="article-copy">
                        <small>
                            {item.published_at &&
                                new Intl.DateTimeFormat(
                                    locale === "km" ? "en" : locale,
                                    { dateStyle: "medium" },
                                ).format(new Date(item.published_at))}
                        </small>
                        <h3>{item.title}</h3>
                        <p>{item.excerpt}</p>
                        <span className="text-link">
                            {t.read}
                            <ArrowRight size={16} />
                        </span>
                    </div>
                </a>
            ))}
        </div>
    ) : (
        <div className="empty">
            <FileText size={25} />
            <p>{t.empty}</p>
        </div>
    );
}
function PageHero({ eyebrow, title, description }) {
    return (
        <section className="page-hero">
            <div className="container">
                <p className="eyebrow light">{eyebrow}</p>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        </section>
    );
}
export { Header, Footer, Contact, Cards, PageHero };
