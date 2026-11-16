import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
    ArrowRight,
    ArrowUpRight,
    Landmark,
    MapPin,
    Lightbulb,
    Menu,
    X,
    Mail,
    Calendar,
    MessageSquare,
    Shield,
    Search,
    Plus,
    LogOut,
    LayoutDashboard,
    FileText,
    Inbox,
    Settings,
    Upload,
    Users,
    Eye,
    Check,
    Globe,
    ChevronRight,
} from "lucide-react";
import { locale, t, copy, paths, href, api, Brand, Button } from "./shared";
import {
    PageStudio,
    StaffStudio,
    MediaLibrary,
    History,
    ContentExtras,
    StaffActivation,
    ForgotAccess,
    Login,
} from "./workspace";
import { Website } from "./website";
const blankTranslation = () => ({
    title: "",
    excerpt: "",
    body: "",
    meta_description: "",
    status: "draft",
    reviewed: false,
});
const blankContent = () => ({
    slug: "",
    type: "article",
    category: "",
    image: "",
    source_url: "",
    event_date: "",
    featured: false,
    position: 0,
    published_at: "",
    translations: {
        en: blankTranslation(),
        fr: blankTranslation(),
        km: blankTranslation(),
    },
});
function Editor({ value, onSave, onCancel }) {
    const [form, setForm] = useState({
        ...value,
        translations: {
            en: blankTranslation(),
            fr: blankTranslation(),
            km: blankTranslation(),
            ...value.translations,
        },
        published_at: value.published_at
            ? new Date(value.published_at)
                  .toLocaleString("sv-SE", { timeZone: "Indian/Mauritius" })
                  .slice(0, 16)
                  .replace(" ", "T")
            : "",
    });
    const [lang, setLang] = useState("en");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);
    const tr = form.translations[lang];
    const set = (key, v) => setForm({ ...form, [key]: v });
    const setT = (key, v) =>
        setForm({
            ...form,
            translations: {
                ...form.translations,
                [lang]: {
                    ...tr,
                    [key]: v,
                    ...(["title", "excerpt", "body"].includes(key)
                        ? {
                              reviewed: false,
                              status:
                                  tr.status === "published"
                                      ? "draft"
                                      : tr.status,
                          }
                        : {}),
                },
            },
        });
    async function save(e) {
        e.preventDefault();
        setBusy(true);
        try {
            const data = {
                ...form,
                published_at: form.published_at || null,
                event_date: form.event_date || null,
                image: form.image || null,
                source_url: form.source_url || null,
                translations: Object.fromEntries(
                    Object.entries(form.translations).filter(([, v]) =>
                        v.title.trim(),
                    ),
                ),
            };
            await api("/api/admin/contents" + (form.id ? "/" + form.id : ""), {
                method: form.id ? "PUT" : "POST",
                body: JSON.stringify(data),
            });
            onSave();
        } catch (e) {
            setMsg(e.message);
        } finally {
            setBusy(false);
        }
    }
    return (
        <form className="editor" onSubmit={save}>
            <div className="admin-heading">
                <div>
                    <p className="eyebrow">CONTENT STUDIO</p>
                    <h1>{form.id ? "Edit publication" : "New publication"}</h1>
                </div>
                <button
                    type="button"
                    className="icon-button"
                    onClick={onCancel}
                    aria-label="Close editor"
                >
                    <X />
                </button>
            </div>
            <div className="editor-grid">
                <section className="panel">
                    <div className="tabs">
                        {["en", "fr", "km"].map((l) => (
                            <button
                                type="button"
                                key={l}
                                className={lang === l ? "selected" : ""}
                                onClick={() => setLang(l)}
                            >
                                {
                                    {
                                        en: "English",
                                        fr: "Français",
                                        km: "Kreol Morisien",
                                    }[l]
                                }
                            </button>
                        ))}
                    </div>
                    <label>
                        Title
                        <input
                            value={tr.title}
                            onChange={(e) => setT("title", e.target.value)}
                            maxLength={180}
                        />
                    </label>
                    <label>
                        Summary
                        <textarea
                            rows={3}
                            value={tr.excerpt || ""}
                            onChange={(e) => setT("excerpt", e.target.value)}
                            maxLength={500}
                        />
                    </label>
                    <label>
                        Article text{" "}
                        <small>Plain text; line breaks are preserved.</small>
                        <textarea
                            className="body-editor"
                            value={tr.body || ""}
                            onChange={(e) => setT("body", e.target.value)}
                        />
                    </label>
                    <label>
                        SEO description
                        <textarea
                            rows={2}
                            value={tr.meta_description || ""}
                            maxLength={170}
                            onChange={(e) =>
                                setT("meta_description", e.target.value)
                            }
                        />
                    </label>
                    <p className="muted">
                        Changes to published text are saved as drafts. Save
                        changed wording before recording a new review approval.
                    </p>
                    <label>
                        Translation status
                        <select
                            value={tr.status}
                            onChange={(e) => setT("status", e.target.value)}
                        >
                            {["draft", "review", "approved", "published"].map(
                                (s) => (
                                    <option key={s}>{s}</option>
                                ),
                            )}
                        </select>
                    </label>
                    {lang === "km" && (
                        <label className="check-label">
                            <input
                                type="checkbox"
                                checked={tr.reviewed}
                                onChange={(e) =>
                                    setT("reviewed", e.target.checked)
                                }
                            />
                            A human reviewer has checked this Kreol translation.
                        </label>
                    )}
                </section>
                <aside className="panel">
                    <ContentExtras form={form} setForm={setForm} lang={lang} />
                    <label>
                        URL slug
                        <input
                            required
                            value={form.slug}
                            onChange={(e) => set("slug", e.target.value)}
                            pattern="[A-Za-z0-9_-]+"
                        />
                    </label>
                    <label>
                        Content type
                        <select
                            value={form.type}
                            onChange={(e) => set("type", e.target.value)}
                        >
                            {[
                                "article",
                                "parliament",
                                "media",
                                "community",
                                "page",
                                "gallery",
                            ].map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Topic / category
                        <input
                            value={form.category || ""}
                            onChange={(e) => set("category", e.target.value)}
                        />
                    </label>
                    <label>
                        Publication date/time (Mauritius)
                        <input
                            type="datetime-local"
                            value={form.published_at}
                            onChange={(e) =>
                                set("published_at", e.target.value)
                            }
                        />
                    </label>
                    <small>
                        Required to publish. A future date schedules
                        publication.
                    </small>
                    <label>
                        Parliament / event date
                        <input
                            type="date"
                            value={form.event_date?.slice(0, 10) || ""}
                            onChange={(e) => set("event_date", e.target.value)}
                        />
                    </label>
                    <label>
                        Official source / video URL
                        <input
                            type="url"
                            value={form.source_url || ""}
                            onChange={(e) => set("source_url", e.target.value)}
                        />
                    </label>
                    <label>
                        Cover image
                        <input
                            value={form.image || ""}
                            onChange={(e) => set("image", e.target.value)}
                            placeholder="/images/portrait.jpg"
                        />
                    </label>
                    <label className="upload-control">
                        <Upload size={17} /> Upload photo
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={async (e) => {
                                if (!e.target.files[0]) return;
                                try {
                                    const data = new FormData();
                                    data.append("file", e.target.files[0]);
                                    const r = await api("/api/admin/media", {
                                        method: "POST",
                                        body: data,
                                    });
                                    set("image", r.url);
                                } catch (e) {
                                    setMsg(e.message);
                                }
                            }}
                        />
                    </label>
                    {form.image && (
                        <img
                            className="cover-preview"
                            src={form.image}
                            alt="Cover preview"
                        />
                    )}
                    <label className="check-label">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) => set("featured", e.target.checked)}
                        />
                        Featured placement
                    </label>
                    <label>
                        Display order
                        <input
                            type="number"
                            min="0"
                            max="9999"
                            value={form.position}
                            onChange={(e) =>
                                set("position", Number(e.target.value))
                            }
                        />
                    </label>
                    {msg && (
                        <p className="notice" role="alert">
                            {msg}
                        </p>
                    )}
                    <Button disabled={busy}>
                        {busy ? "Saving…" : "Save publication"}
                    </Button>
                </aside>
            </div>
        </form>
    );
}
function Dashboard({ stats, days, setDays }) {
    return (
        <>
            <div className="admin-heading">
                <div>
                    <p className="eyebrow">YOUR WEBSITE AT A GLANCE</p>
                    <h1>Overview</h1>
                    <p>
                        Stories published. People reached. Conversations
                        started.
                    </p>
                </div>
                <select
                    aria-label="Analytics date range"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                >
                    {[7, 30, 90].map((d) => (
                        <option key={d} value={d}>
                            Last {d} days
                        </option>
                    ))}
                </select>
            </div>
            <div className="stat-grid">
                {[
                    [Users, "Daily unique visitors", stats.visitors],
                    [Eye, "Page views", stats.page_views],
                    [FileText, "Publications", stats.contents],
                    [Inbox, "New enquiries", stats.enquiries],
                ].map(([Icon, label, val]) => (
                    <div className="stat" key={label}>
                        <Icon />
                        <span>{label}</span>
                        <strong>{val ?? 0}</strong>
                    </div>
                ))}
            </div>
            <div className="dashboard-grid">
                <section className="panel">
                    <p className="eyebrow">AUDIENCE</p>
                    <h2>Visits over time</h2>
                    <p className="muted">
                        Daily pseudonymous visitors; totals are not deduplicated
                        across days.
                    </p>
                    <div className="bar-chart">
                        {stats.daily?.length ? (
                            stats.daily.map((d) => (
                                <div
                                    className="bar-column"
                                    key={d.day}
                                    title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                                >
                                    <span>{d.views}</span>
                                    <div
                                        style={{
                                            height:
                                                Math.max(
                                                    3,
                                                    (Number(d.views) /
                                                        Math.max(
                                                            ...stats.daily.map(
                                                                (v) =>
                                                                    Number(
                                                                        v.views,
                                                                    ),
                                                            ),
                                                        )) *
                                                        140,
                                                ) + "px",
                                        }}
                                    />
                                    <small>{d.day.slice(5)}</small>
                                </div>
                            ))
                        ) : (
                            <div className="empty">
                                Visitor activity will appear after the public
                                site is browsed.
                            </div>
                        )}
                    </div>
                </section>
                <section className="panel">
                    <p className="eyebrow">CONTENT PERFORMANCE</p>
                    <h2>Most viewed pages</h2>
                    {stats.top_pages?.map((p) => (
                        <div className="data-row" key={p.path}>
                            <span>{p.path}</span>
                            <strong>{p.views}</strong>
                        </div>
                    ))}
                    {!stats.top_pages?.length && (
                        <p className="muted">No page views yet.</p>
                    )}
                </section>
            </div>
            <section className="panel">
                <p className="eyebrow">EDITORIAL ACTIVITY</p>
                <h2>Recent changes</h2>
                {stats.activity?.map((a) => (
                    <div className="data-row" key={a.id}>
                        <span>
                            {a.action} {a.details?.slug || ""}
                        </span>
                        <small>{new Date(a.created_at).toLocaleString()}</small>
                    </div>
                ))}
            </section>
        </>
    );
}
function AdminApp() {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState({});
    const [contents, setContents] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [settings, setSettings] = useState({});
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [days, setDays] = useState(30);
    const [query, setQuery] = useState("");
    const [historyTarget, setHistoryTarget] = useState(null);
    useEffect(() => {
        api("/api/session")
            .then((d) => setUser(d.user))
            .catch((e) => setError(e.message))
            .finally(() => setReady(true));
    }, []);
    async function reload() {
        try {
            const [d, c, e, s] = await Promise.all([
                api("/api/admin/dashboard?days=" + days),
                api("/api/admin/contents"),
                api("/api/admin/enquiries"),
                api("/api/settings"),
            ]);
            setStats(d);
            setContents(c.data);
            setEnquiries(e.data);
            setSettings(s);
        } catch (e) {
            setError(e.message);
        }
    }
    useEffect(() => {
        if (user) reload();
    }, [user, days]);
    if (!ready) return <div className="login-page">Loading workspace…</div>;
    if (!user) return <Login onLogin={setUser} />;
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Brand />
                <p className="sidebar-label">EDITORIAL WORKSPACE</p>
                <nav>
                    {[
                        [LayoutDashboard, "overview", "Overview"],
                        [FileText, "content", "Publications"],
                        [FileText, "pages", "Pages & sections"],
                        [Upload, "media", "Media library"],
                        [Users, "staff", "Staff & permissions"],
                        [Inbox, "enquiries", "Enquiries"],
                        [Settings, "settings", "Site settings"],
                    ]
                        .filter(
                            ([, id]) =>
                                !["settings", "staff"].includes(id) ||
                                user.role === "admin",
                        )
                        .map(([Icon, id, label]) => (
                            <button
                                key={id}
                                className={tab === id ? "active" : ""}
                                onClick={() => {
                                    setTab(id);
                                    setEditing(null);
                                    setError("");
                                }}
                            >
                                <Icon size={19} />
                                {label}
                                {id === "enquiries" && stats.enquiries > 0 && (
                                    <span className="count">
                                        {stats.enquiries}
                                    </span>
                                )}
                            </button>
                        ))}
                </nav>
                <a
                    className="view-site"
                    href="/en"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Globe size={17} />
                    View website
                    <ArrowUpRight size={15} />
                </a>
                <div className="admin-user">
                    <span>{user.name?.slice(0, 1)}</span>
                    <div>
                        {user.name}
                        <small>{user.role}</small>
                    </div>
                    <button
                        className="icon-button"
                        aria-label="Sign out"
                        onClick={async () => {
                            try {
                                await api("/api/logout", { method: "POST" });
                                location.reload();
                            } catch (e) {
                                setError(e.message);
                            }
                        }}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                <div className="admin-top">
                    <span>
                        KL WEBSITE <ChevronRight size={14} /> {tab}
                    </span>
                    <span>
                        <Shield size={14} /> Private workspace
                    </span>
                </div>
                {error && (
                    <p className="notice" role="alert">
                        {error}
                    </p>
                )}
                {historyTarget && (
                    <History
                        type="content"
                        canRestore={user.role === "admin"}
                        id={historyTarget.id}
                        version={historyTarget.version}
                        onClose={() => setHistoryTarget(null)}
                        onRestored={() => {
                            setHistoryTarget(null);
                            reload();
                        }}
                    />
                )}
                {tab === "pages" ? (
                    <PageStudio
                        canRestore={user.role === "admin"}
                        canEditLegal={user.role === "admin"}
                    />
                ) : tab === "media" ? (
                    <MediaLibrary />
                ) : tab === "staff" ? (
                    <StaffStudio />
                ) : editing ? (
                    <Editor
                        value={editing}
                        onCancel={() => setEditing(null)}
                        onSave={() => {
                            setEditing(null);
                            reload();
                        }}
                    />
                ) : tab === "overview" ? (
                    <Dashboard stats={stats} days={days} setDays={setDays} />
                ) : tab === "content" ? (
                    <>
                        <div className="admin-heading">
                            <div>
                                <p className="eyebrow">CONTENT STUDIO</p>
                                <h1>Publications</h1>
                                <p>
                                    One story. Three languages. Your editorial
                                    control.
                                </p>
                            </div>
                            <Button onClick={() => setEditing(blankContent())}>
                                <Plus size={17} />
                                New publication
                            </Button>
                        </div>
                        <label className="search-box">
                            <Search size={18} />
                            <input
                                placeholder="Search publications"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </label>
                        <section className="panel table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Publication</th>
                                        <th>Type</th>
                                        <th>EN / FR / KR</th>
                                        <th>Featured</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contents
                                        .filter((c) =>
                                            JSON.stringify(c.translations)
                                                .toLowerCase()
                                                .includes(query.toLowerCase()),
                                        )
                                        .map((c) => (
                                            <tr key={c.id}>
                                                <td>
                                                    <strong>
                                                        {c.translations.en
                                                            ?.title || c.slug}
                                                    </strong>
                                                    <small>/{c.slug}</small>
                                                </td>
                                                <td>{c.type}</td>
                                                <td>
                                                    {["en", "fr", "km"].map(
                                                        (l) => (
                                                            <span
                                                                key={l}
                                                                className={
                                                                    "status " +
                                                                    (c
                                                                        .translations[
                                                                        l
                                                                    ]?.status ||
                                                                        "missing")
                                                                }
                                                            >
                                                                {l.toUpperCase()}
                                                                :{" "}
                                                                {c.translations[
                                                                    l
                                                                ]?.status ||
                                                                    "missing"}
                                                            </span>
                                                        ),
                                                    )}
                                                </td>
                                                <td>
                                                    {c.featured ? (
                                                        <Check size={18} />
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="text-button"
                                                        onClick={() =>
                                                            setHistoryTarget(c)
                                                        }
                                                    >
                                                        History
                                                    </button>
                                                    {!c.deleted_at && (
                                                        <button
                                                            className="text-button"
                                                            onClick={() =>
                                                                setEditing(c)
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {c.deleted_at && (
                                                        <span className="status">
                                                            Archived
                                                        </span>
                                                    )}
                                                    {user.role === "admin" &&
                                                        !c.deleted_at && (
                                                            <button
                                                                className="text-button danger"
                                                                onClick={async () => {
                                                                    if (
                                                                        !confirm(
                                                                            "Archive this publication? Its revisions remain available for restoration.",
                                                                        )
                                                                    )
                                                                        return;
                                                                    try {
                                                                        await api(
                                                                            "/api/admin/contents/" +
                                                                                c.id,
                                                                            {
                                                                                method: "DELETE",
                                                                            },
                                                                        );
                                                                        reload();
                                                                    } catch (e) {
                                                                        setError(
                                                                            e.message,
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                Archive
                                                            </button>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {!contents.length && (
                                <div className="empty">
                                    Create your first publication to get
                                    started.
                                </div>
                            )}
                        </section>
                    </>
                ) : tab === "enquiries" ? (
                    <>
                        <div className="admin-heading">
                            <div>
                                <p className="eyebrow">CONVERSATIONS</p>
                                <h1>Enquiries</h1>
                                <p>
                                    Messages, concerns and appointment requests.
                                </p>
                            </div>
                        </div>
                        {enquiries.map((e) => (
                            <section className="panel enquiry" key={e.id}>
                                <div className="data-row">
                                    <h3>{e.subject}</h3>
                                    <select
                                        aria-label="Enquiry status"
                                        value={e.status}
                                        onChange={async (ev) => {
                                            try {
                                                await api(
                                                    "/api/admin/enquiries/" +
                                                        e.id,
                                                    {
                                                        method: "PATCH",
                                                        body: JSON.stringify({
                                                            status: ev.target
                                                                .value,
                                                        }),
                                                    },
                                                );
                                                reload();
                                            } catch (e) {
                                                setError(e.message);
                                            }
                                        }}
                                    >
                                        {["new", "in_progress", "closed"].map(
                                            (s) => (
                                                <option key={s}>{s}</option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <small>
                                    {e.name} · {e.email} · {e.kind} · {e.locale}
                                </small>
                                <p className="article-body">{e.message}</p>
                            </section>
                        ))}
                        {!enquiries.length && (
                            <div className="panel empty">
                                No enquiries received yet.
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="admin-heading">
                            <div>
                                <p className="eyebrow">CONFIGURATION</p>
                                <h1>Site settings</h1>
                            </div>
                        </div>
                        <form
                            className="panel settings-form"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await api("/api/admin/settings", {
                                        method: "PUT",
                                        body: JSON.stringify(settings),
                                    });
                                    setError("Settings saved.");
                                } catch (e) {
                                    setError(e.message);
                                }
                            }}
                        >
                            {[
                                ["email", "Office email"],
                                ["phone", "Office phone"],
                                ["address", "Office address"],
                                ["whatsapp", "WhatsApp HTTPS URL"],
                                ["party_url", "Party website HTTPS URL"],
                                ["facebook", "Facebook HTTPS URL"],
                                ["instagram", "Instagram HTTPS URL"],
                                ["youtube", "YouTube HTTPS URL"],
                                ["linkedin", "LinkedIn HTTPS URL"],
                            ].map(([key, label]) => (
                                <label key={key}>
                                    {label}
                                    <input
                                        type={
                                            key === "email"
                                                ? "email"
                                                : key.includes("url") ||
                                                    [
                                                        "whatsapp",
                                                        "facebook",
                                                        "instagram",
                                                        "youtube",
                                                        "linkedin",
                                                    ].includes(key)
                                                  ? "url"
                                                  : "text"
                                        }
                                        value={settings[key] || ""}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                [key]: e.target.value,
                                            })
                                        }
                                    />
                                </label>
                            ))}
                            <label className="check-label">
                                <input
                                    type="checkbox"
                                    checked={
                                        !!settings.kreol_interface_approved
                                    }
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            kreol_interface_approved:
                                                e.target.checked,
                                        })
                                    }
                                />
                                A human reviewer has approved the common Kreol
                                interface, navigation and form wording.
                            </label>
                            <Button>Save settings</Button>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
createRoot(document.getElementById("app")).render(
    location.pathname === "/admin/activate" ? (
        <StaffActivation />
    ) : location.pathname.startsWith("/admin") ? (
        <AdminApp />
    ) : (
        <Website />
    ),
);
