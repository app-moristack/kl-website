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
} from "lucide-react";
import { locale, t, paths, href, api, Brand, Button } from "./shared";
import { ReferenceImage } from "./reference-layout";
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
                    aria-label="Toggle menu"
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
function Footer({ settings }) {
    return (
        <>
            <section className="connect">
                <div className="container connect-inner">
                    <div>
                        <p className="eyebrow light">{t.contact}</p>
                        <h2>{t.message}</h2>
                        <p>{t.contactSub}</p>
                    </div>
                    <Button to={href("contact")} secondary>
                        {t.contact}
                    </Button>
                </div>
            </section>
            <footer>
                <div className="container footer-grid">
                    <div>
                        <Brand />
                        <p>{t.footer}</p>
                    </div>
                    <div>
                        <h4>
                            {locale === "fr"
                                ? "EXPLORER"
                                : locale === "km"
                                  ? "DEKOUVER"
                                  : "EXPLORE"}
                        </h4>
                        {paths.slice(1).map((p, i) => (
                            <a key={p} href={href(p)}>
                                {t.nav[i + 1]}
                            </a>
                        ))}
                    </div>
                    <div>
                        <h4>CONTACT</h4>
                        <a href={href("contact")}>{t.contact}</a>
                        {settings.email && (
                            <a href={`mailto:${settings.email}`}>
                                {settings.email}
                            </a>
                        )}
                        {settings.address && <p>{settings.address}</p>}
                    </div>
                    <div className="flag-block">
                        <span className="flag" aria-label="Mauritius flag" />
                        <p>{t.footer}</p>
                    </div>
                </div>
                <div className="container footer-bottom">
                    <span>© {new Date().getFullYear()} Khushal Lobine</span>
                    <div>
                        <a href={href("privacy")}>{t.privacy}</a>
                        <a href={href("terms")}>{t.terms}</a>
                    </div>
                </div>
            </footer>
        </>
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
                    <p className="eyebrow">CONTACT</p>
                    <h2>{t.formTitle}</h2>
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
                        {locale === "fr" ? "Type de demande" : "Enquiry type"}
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
                                {locale === "fr"
                                    ? "Signaler une préoccupation"
                                    : "Submit a concern"}
                            </option>
                            <option value="appointment">
                                {locale === "fr"
                                    ? "Rendez-vous"
                                    : "Appointment request"}
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
                        {locale === "en"
                            ? "OTHER WAYS TO REACH OUT"
                            : t.contact}
                    </p>
                    <h2>
                        {locale === "en" ? "How can we help?" : t.contactSub}
                    </h2>
                    <div className="contact-options-grid">
                        {[
                            [
                                FileText,
                                locale === "fr"
                                    ? "Signaler une préoccupation"
                                    : "Submit a Concern",
                                "concern",
                                locale === "fr"
                                    ? "Partagez un problème ou une suggestion."
                                    : "Share an issue, suggestion or concern about your community.",
                            ],
                            [
                                Calendar,
                                locale === "fr"
                                    ? "Demander un rendez-vous"
                                    : "Request an Appointment",
                                "appointment",
                                locale === "fr"
                                    ? "Rencontrez Khushal Lobine ou son équipe."
                                    : "Request a meeting with Khushal Lobine or his team.",
                            ],
                            [
                                MessageCircle,
                                "No. 15 Connect",
                                "general",
                                locale === "fr"
                                    ? "Restez en contact avec votre communauté."
                                    : "Stay connected for community news and updates.",
                            ],
                            [
                                Mail,
                                locale === "fr"
                                    ? "Demandes des médias"
                                    : "Media Enquiries",
                                "media",
                                locale === "fr"
                                    ? "Interviews et demandes de presse."
                                    : "For media requests, interviews or press-related enquiries.",
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
                            {locale === "en"
                                ? "CONSTITUENCY OFFICE"
                                : t.contact}
                        </p>
                        <h2>
                            {locale === "fr"
                                ? "Bureau de circonscription"
                                : "Constituency Office"}{" "}
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
                        <ReferenceImage
                            source="contact"
                            rect={[448, 875, 413, 165]}
                            alt="Illustrative constituency office map"
                        />
                        <div className="office-map-caption">
                            <MapPin />
                            <div>
                                <strong>Constituency Office No. 15</strong>
                                <p>
                                    {settings.address ||
                                        "La Caverne & Phoenix, Mauritius"}
                                </p>
                                <small>
                                    {locale === "fr"
                                        ? "Contactez le bureau pour obtenir les détails du lieu."
                                        : "Contact the office for exact location details."}
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
