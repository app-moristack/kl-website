import React from "react";
import {
    Landmark,
    MapPin,
    Lightbulb,
    Mail,
    FileText,
    Calendar,
    MessageCircle,
    ArrowRight,
} from "lucide-react";
import { href, locale, t } from "./shared";

// Original reference pixels, cropped in CSS: no regenerated portraits or logos.
export function ReferenceImage({
    source = "home",
    rect,
    alt = "",
    className = "",
}) {
    const [x, y, width, height] = rect;
    const fullWidth = source === "home" ? 698 : 900;
    return (
        <span
            className={`reference-image ${className}`}
            style={{ aspectRatio: `${width}/${height}` }}
        >
            <img
                src={`/reference-assets/${source}.jpg`}
                alt={alt}
                style={{
                    width: `${(fullWidth / width) * 100}%`,
                    left: `${(-x / width) * 100}%`,
                    top: 0,
                    marginTop: `${(-y / width) * 100}%`,
                }}
            />
        </span>
    );
}
export function NavyHome({ page, items }) {
    const english = locale === "en";
    const archive = items.filter((i) => i.type === "parliament").slice(0, 3);
    const links = [
        [
            "parliament",
            Landmark,
            "In Parliament",
            "Parliamentary questions, speeches, bills and legislative work — bringing public issues into national debate.",
        ],
        [
            "constituency",
            MapPin,
            "Constituency No. 15",
            "Community visits, representations and practical work for the people of La Caverne & Phoenix.",
        ],
        [
            "perspectives",
            Lightbulb,
            "Ideas & Perspectives",
            "Articles and contributions informed by law, public institutions and national development.",
        ],
    ];
    return (
        <div className="navy-reference">
            <section className="navy-hero">
                <div className="navy-wrap">
                    <div className="navy-hero-text">
                        <p className="navy-label">
                            {page.eyebrow || "A LIFE IN LAW AND PUBLIC SERVICE"}
                        </p>
                        <h1>
                            {page.hero_title || "KHUSHAL"}
                            <br />
                            <em>{page.hero_accent || "LOBINE"}</em>
                        </h1>
                        <p className="navy-roles">
                            Member of Parliament <span>•</span> Barrister-at-Law
                            <br />
                            Leader of Nouveaux Démocrates
                        </p>
                        <p>
                            First Elected Member for Constituency No. 15
                            <br />
                            La Caverne & Phoenix
                        </p>
                        <p className="navy-bio">{page.hero_body}</p>
                        <div className="navy-actions">
                            <a href={page.primary_url || href("about")}>
                                {page.primary_label || "Discover Khushal"}
                            </a>
                            <a href={page.secondary_url || href("parliament")}>
                                {page.secondary_label ||
                                    "Explore parliamentary work"}{" "}
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                    {page.hero_image &&
                    !page.hero_image.startsWith("/images/") ? (
                        <img
                            className="navy-custom-hero"
                            src={page.hero_image}
                            alt="Khushal Lobine"
                        />
                    ) : (
                        <ReferenceImage
                            rect={[350, 44, 348, 308]}
                            alt="Khushal Lobine in a blue suit"
                            className="navy-hero-photo"
                        />
                    )}
                </div>
            </section>
            <section className="navy-wrap navy-intro">
                <div>
                    <p className="navy-label">ABOUT KHUSHAL LOBINE</p>
                    <h2>{page.intro_title}</h2>
                    <i className="navy-rule" />
                </div>
                <div>
                    <p>{page.intro_body}</p>
                    <a href={href("about")}>
                        {english ? "Discover his journey" : t.more} →
                    </a>
                </div>
                <blockquote>
                    <p className="navy-label">A MESSAGE FROM KHUSHAL</p>
                    <h3>Representation starts with listening.</h3>
                    {page.quote && <p>“{page.quote}”</p>}
                    <cite>{page.signature || "KHUSHAL LOBINE"}</cite>
                </blockquote>
                <div className="navy-facts">
                    {(page.milestones || []).map(
                        ({ year: n, title: label }) => (
                            <div key={label}>
                                <strong>{n}</strong>
                                <span>{label}</span>
                            </div>
                        ),
                    )}
                </div>
            </section>
            <section className="navy-work">
                <div className="navy-wrap">
                    <p className="navy-label">EXPLORE HIS WORK</p>
                    <h2>
                        {page.section_title ||
                            "Parliament. People. Perspectives."}
                    </h2>
                    <p>
                        A life in law and public service, with a sustained
                        commitment to the people and institutions of Mauritius.
                    </p>
                    <div className="navy-work-grid">
                        {links.map(([path, Icon, title, body], i) => (
                            <a key={path} href={href(path)}>
                                <Icon />
                                <span className="navy-card-number">
                                    0{i + 1}
                                </span>
                                <i className="navy-rule" />
                                <h3>{page.cards?.[i]?.title || title}</h3>
                                <p>{page.cards?.[i]?.body || body}</p>
                                <small>
                                    Explore{" "}
                                    {i === 1
                                        ? "No. 15"
                                        : i === 2
                                          ? "perspectives"
                                          : "the record"}{" "}
                                    →
                                </small>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
            <section className="navy-wrap navy-archive">
                <div>
                    <div className="navy-section-title">
                        <h2>From the Parliamentary Archive</h2>
                        <a href={href("parliament")}>Explore all →</a>
                    </div>
                    {archive.length ? (
                        archive.map((item) => (
                            <a
                                className="navy-record"
                                key={item.id}
                                href={href("articles/" + item.slug)}
                            >
                                <FileText />
                                <div>
                                    <small>
                                        {item.parliament_kind ||
                                            "PARLIAMENTARY WORK"}
                                    </small>
                                    <h3>{item.title}</h3>
                                    <p>{item.excerpt}</p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="navy-archive-empty">
                            <FileText />
                            <p>
                                Parliamentary questions, speeches and
                                legislative contributions.
                            </p>
                            <a href={href("parliament")}>
                                Browse the parliamentary archive →
                            </a>
                        </div>
                    )}
                    <p className="navy-note">
                        Explore parliamentary contributions, official documents
                        and published interventions.
                    </p>
                </div>
                <div>
                    <div className="navy-section-title">
                        <h2>People & Constituency</h2>
                        <a href={href("constituency")}>No. 15 in action →</a>
                    </div>
                    <a href={href("constituency")}>
                        <ReferenceImage
                            rect={[368, 883, 277, 130]}
                            alt="Community gathering with Khushal Lobine"
                        />
                    </a>
                    <p className="navy-label navy-caption">
                        LISTENING. ENGAGING. WORKING TOGETHER.
                    </p>
                    <a
                        className="navy-community-link"
                        href={href("constituency")}
                    >
                        <strong>
                            Constituency No. 15 · La Caverne & Phoenix
                        </strong>
                        <span>
                            Listening and representing our community.{" "}
                            <ArrowRight size={16} />
                        </span>
                    </a>
                </div>
            </section>
            <section className="navy-perspectives">
                <div className="navy-wrap">
                    <p className="navy-label">BEYOND THE HEADLINES</p>
                    <h2>Ideas, Perspectives & Media</h2>
                    <div className="navy-perspective-grid">
                        <a href={href("perspectives")} className="navy-ideas">
                            <div>
                                <p className="navy-label">
                                    IDEAS & PERSPECTIVES
                                </p>
                                <h3>
                                    Law, Governance
                                    <br />
                                    and National Affairs
                                </h3>
                                <p>
                                    Reflections informed by legal practice,
                                    public service and a sustained interest in
                                    our national affairs.
                                </p>
                                <small>Explore perspectives →</small>
                            </div>
                            <ReferenceImage
                                rect={[271, 1169, 122, 184]}
                                alt="Portrait of Khushal Lobine"
                            />
                        </a>
                        <a className="navy-conversation" href={href("media")}>
                            <p className="navy-label">MEDIA & INTERVIEWS</p>
                            <h3>In Conversation</h3>
                            <p>
                                A dedicated space for interviews, public
                                dialogue and contributions to the national
                                conversation.
                            </p>
                            <small>Browse media archive →</small>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
export function NavyFooter({ settings = {} }) {
    return (
        <div className="navy-reference navy-bottom">
            <section className="navy-wrap navy-connect">
                <p className="navy-label">STAY IN TOUCH</p>
                <div className="navy-section-title">
                    <div>
                        <h2>Connect with Khushal</h2>
                        <p>
                            Your ideas and concerns help shape a stronger
                            community.
                            <br />
                            Reach the office or connect with No. 15.
                        </p>
                    </div>
                    <a className="navy-outline" href={href("contact")}>
                        CONTACT THE OFFICE →
                    </a>
                </div>
                <div className="navy-contact-strip">
                    {[
                        [Mail, "Submit a Concern", "concern"],
                        [FileText, "Track a Request", "general"],
                        [Calendar, "Request an Appointment", "appointment"],
                        [MessageCircle, "No. 15 Connect", "general"],
                    ].map(([Icon, label, kind]) => (
                        <a key={label} href={href("contact") + "?kind=" + kind}>
                            <Icon size={18} />
                            <span>{label}</span>
                        </a>
                    ))}
                </div>
            </section>
            <footer className="navy-footer">
                <div className="navy-wrap">
                    <a href={href()}>
                        <ReferenceImage
                            rect={[52, 6, 96, 31]}
                            alt="Khushal Lobine"
                        />
                    </a>
                    <div>
                        <p>
                            © {new Date().getFullYear()} Khushal Lobine. All
                            rights reserved.
                        </p>
                        <a href={href("privacy")}>Privacy policy</a> ·{" "}
                        <a href={href("terms")}>Terms of use</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
