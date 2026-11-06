import React, { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Upload,
    ArrowRight,
    Shield,
    Clock,
    Copy,
    Image,
    FileText,
    Users,
    X,
    Check,
} from "lucide-react";
import { api, Button, Brand } from "./shared";
const languages = { en: "English", fr: "Français", km: "Kreol Morisien" };
export function History({ type, id, version, onRestored, onClose }) {
    const [rows, setRows] = useState([]),
        [msg, setMsg] = useState(""),
        [selected, setSelected] = useState(null);
    useEffect(() => {
        api(`/api/admin/revisions?type=${type}&id=${id}`)
            .then((d) => setRows(d.data))
            .catch((e) => setMsg(e.message));
    }, [id, type]);
    return (
        <section className="panel history-panel">
            <div className="data-row">
                <h2>
                    <Clock size={20} /> Revision history
                </h2>
                <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    aria-label="Close history"
                >
                    <X />
                </button>
            </div>
            <p className="muted">
                Restoring creates a new draft. It never republishes a historical
                translation.
            </p>
            {rows.map((r) => (
                <div className="data-row" key={r.id}>
                    <button
                        className="text-button"
                        onClick={() => setSelected(r)}
                    >
                        Version {r.version} · {r.action} ·{" "}
                        {r.user?.name || "Former staff"} ·{" "}
                        {new Date(r.created_at).toLocaleString()}
                    </button>
                    <button
                        className="text-button"
                        onClick={async () => {
                            if (
                                !confirm(
                                    "Restore this revision as an unpublished draft?",
                                )
                            )
                                return;
                            try {
                                await api(
                                    `/api/admin/revisions/${r.id}/restore`,
                                    {
                                        method: "POST",
                                        body: JSON.stringify({ version }),
                                    },
                                );
                                onRestored();
                            } catch (e) {
                                setMsg(e.message);
                            }
                        }}
                    >
                        Restore as draft
                    </button>
                </div>
            ))}
            {!rows.length && <p>No saved revisions yet.</p>}
            {selected && (
                <div className="revision-preview">
                    <h3>Version {selected.version}</h3>
                    {Object.entries(selected.snapshot.translations || {}).map(
                        ([l, v]) => (
                            <div key={l}>
                                <h4>
                                    {languages[l]} · {v.title || v.hero_title}
                                </h4>
                                <p className="article-body">
                                    {v.body || v.intro_body || v.hero_body}
                                </p>
                            </div>
                        ),
                    )}
                </div>
            )}
            {msg && (
                <p className="notice" role="alert">
                    {msg}
                </p>
            )}
        </section>
    );
}
async function upload(file) {
    const fd = new FormData();
    fd.append("file", file);
    return api("/api/admin/media", { method: "POST", body: fd });
}
export function ImageField({ label, value, onChange }) {
    const [msg, setMsg] = useState("");
    return (
        <div className="image-field">
            <label>
                {label}
                <input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="/images/portrait.jpg"
                />
            </label>
            <label className="upload-control">
                <Upload size={16} />
                Choose photo
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        try {
                            const r = await upload(e.target.files[0]);
                            onChange(r.url);
                            setMsg("");
                        } catch (e) {
                            setMsg(e.message);
                        }
                    }}
                />
            </label>
            {value && (
                <img
                    className="cover-preview"
                    src={value}
                    alt="Selected image"
                />
            )}
            {msg && <p className="notice">{msg}</p>}
        </div>
    );
}
const fields = [
    ["eyebrow", "Section label"],
    ["hero_title", "Hero title"],
    ["hero_accent", "Hero accent"],
    ["hero_body", "Hero introduction", "area"],
    ["primary_label", "Primary button label"],
    ["primary_url", "Primary button link"],
    ["secondary_label", "Secondary button label"],
    ["secondary_url", "Secondary button link"],
    ["intro_title", "Biography / introduction heading"],
    ["intro_body", "Biography / page body", "large"],
    ["quote", "Approved quotation", "area"],
    ["signature", "Quotation attribution"],
    ["section_title", "Cards section heading"],
    ["cta_title", "Call-to-action heading"],
    ["cta_body", "Call-to-action text", "area"],
    ["cta_label", "Call-to-action button"],
    ["cta_url", "Call-to-action link"],
    ["seo_title", "SEO title"],
    ["meta_description", "SEO description", "area"],
    ["review_notes", "Review notes", "area"],
];
function Repeater({ name, rows, onChange }) {
    return (
        <section className="repeater">
            <div className="data-row">
                <h3>{name}</h3>
                <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                        onChange([
                            ...rows,
                            {
                                title: "",
                                body: "",
                                icon: "landmark",
                                image: "",
                                url: "",
                                year: "",
                            },
                        ])
                    }
                >
                    <Plus size={15} /> Add
                </button>
            </div>
            {rows.map((row, i) => (
                <div className="repeat-row" key={i}>
                    <div className="repeat-head">
                        <strong>
                            {i + 1}. {row.title || "New item"}
                        </strong>
                        <div>
                            <button
                                type="button"
                                className="text-button"
                                disabled={i === 0}
                                onClick={() => {
                                    const a = [...rows];
                                    [a[i - 1], a[i]] = [a[i], a[i - 1]];
                                    onChange(a);
                                }}
                            >
                                Move up
                            </button>
                            <button
                                type="button"
                                className="text-button danger"
                                onClick={() =>
                                    onChange(rows.filter((_, n) => n !== i))
                                }
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                    {[
                        "title",
                        "body",
                        ...(name === "Milestones"
                            ? ["year"]
                            : ["icon", "image", "url"]),
                    ].map((f) => (
                        <label key={f}>
                            {f}
                            {f === "body" ? (
                                <textarea
                                    value={row[f] || ""}
                                    onChange={(e) =>
                                        onChange(
                                            rows.map((x, n) =>
                                                n === i
                                                    ? {
                                                          ...x,
                                                          [f]: e.target.value,
                                                      }
                                                    : x,
                                            ),
                                        )
                                    }
                                />
                            ) : f === "icon" ? (
                                <select
                                    value={row[f] || "landmark"}
                                    onChange={(e) =>
                                        onChange(
                                            rows.map((x, n) =>
                                                n === i
                                                    ? {
                                                          ...x,
                                                          [f]: e.target.value,
                                                      }
                                                    : x,
                                            ),
                                        )
                                    }
                                >
                                    {[
                                        "landmark",
                                        "map",
                                        "lightbulb",
                                        "users",
                                        "shield",
                                        "book",
                                        "gavel",
                                        "leaf",
                                        "water",
                                        "chart",
                                        "calendar",
                                    ].map((x) => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    value={row[f] || ""}
                                    onChange={(e) =>
                                        onChange(
                                            rows.map((x, n) =>
                                                n === i
                                                    ? {
                                                          ...x,
                                                          [f]: e.target.value,
                                                      }
                                                    : x,
                                            ),
                                        )
                                    }
                                />
                            )}
                        </label>
                    ))}
                </div>
            ))}
        </section>
    );
}
export function PageStudio() {
    const [pages, setPages] = useState([]),
        [id, setId] = useState(null),
        [lang, setLang] = useState("en"),
        [form, setForm] = useState(null),
        [msg, setMsg] = useState(""),
        [busy, setBusy] = useState(false),
        [history, setHistory] = useState(false);
    async function load(selected = id) {
        try {
            const d = await api("/api/admin/pages");
            setPages(d.data);
            const page = d.data.find((p) => p.id === selected) || d.data[0];
            setId(page?.id);
            setForm(page ? structuredClone(page) : null);
        } catch (e) {
            setMsg(e.message);
        }
    }
    useEffect(() => {
        load();
    }, []);
    if (!form)
        return <div className="panel">{msg || "Loading editable pages…"}</div>;
    const tr = form.translations[lang] || { status: "draft", reviewed: false };
    function set(key, value) {
        setForm({
            ...form,
            translations: {
                ...form.translations,
                [lang]: {
                    ...tr,
                    [key]: value,
                    ...(![
                        "status",
                        "reviewed",
                        "review_notes",
                        "legal_approved",
                    ].includes(key)
                        ? {
                              reviewed: false,
                              legal_approved: false,
                              status:
                                  tr.status === "published"
                                      ? "draft"
                                      : tr.status,
                          }
                        : {}),
                },
            },
        });
    }
    const legal = ["privacy", "terms"].includes(form.slug);
    return (
        <>
            <div className="admin-heading">
                <div>
                    <p className="eyebrow">PAGE BUILDER</p>
                    <h1>Pages & sections</h1>
                    <p>
                        Hero banners, biography, cards, milestones, calls to
                        action and legal pages.
                    </p>
                </div>
                <select
                    aria-label="Choose page"
                    value={id || ""}
                    onChange={(e) => {
                        setId(Number(e.target.value));
                        setForm(
                            structuredClone(
                                pages.find(
                                    (p) => p.id === Number(e.target.value),
                                ),
                            ),
                        );
                        setHistory(false);
                        setMsg("");
                    }}
                >
                    {pages.map((p) => (
                        <option value={p.id} key={p.id}>
                            {p.slug}
                        </option>
                    ))}
                </select>
            </div>
            <div className="tabs">
                {Object.entries(languages).map(([l, n]) => (
                    <button
                        key={l}
                        type="button"
                        className={lang === l ? "selected" : ""}
                        onClick={() => setLang(l)}
                    >
                        {n}
                    </button>
                ))}
            </div>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                        const d = await api("/api/admin/pages/" + id, {
                            method: "PUT",
                            body: JSON.stringify({
                                version: form.version,
                                translations: form.translations,
                            }),
                        });
                        setForm(d);
                        setPages(pages.map((p) => (p.id === id ? d : p)));
                        setMsg("Page saved.");
                    } catch (e) {
                        setMsg(e.message);
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <div className="editor-grid">
                    <section className="panel">
                        {form.slug === "home" && (
                            <label>
                                Homepage design
                                <select
                                    value={tr.design || "editorial"}
                                    onChange={(e) =>
                                        set("design", e.target.value)
                                    }
                                >
                                    <option value="editorial">
                                        Editorial — final reference
                                    </option>
                                    <option value="classic">
                                        Classic — image-led reference
                                    </option>
                                </select>
                            </label>
                        )}
                        {fields.map(([key, label, kind]) => (
                            <label key={key}>
                                {label}
                                {kind ? (
                                    <textarea
                                        rows={kind === "large" ? 12 : 3}
                                        value={tr[key] || ""}
                                        onChange={(e) =>
                                            set(key, e.target.value)
                                        }
                                    />
                                ) : (
                                    <input
                                        value={tr[key] || ""}
                                        onChange={(e) =>
                                            set(key, e.target.value)
                                        }
                                    />
                                )}
                            </label>
                        ))}
                        {!legal &&
                            ["cards", "milestones", "focus"].map((key) => (
                                <Repeater
                                    key={key}
                                    name={
                                        {
                                            cards: "Cards",
                                            milestones: "Milestones",
                                            focus: "Focus areas",
                                        }[key]
                                    }
                                    rows={tr[key] || []}
                                    onChange={(rows) => set(key, rows)}
                                />
                            ))}
                    </section>
                    <aside className="panel sticky-panel">
                        <p className="eyebrow">PUBLISHING</p>
                        <h3>{form.slug}</h3>
                        <label>
                            Translation status
                            <select
                                value={tr.status || "draft"}
                                onChange={(e) => set("status", e.target.value)}
                            >
                                {[
                                    "draft",
                                    "review",
                                    "approved",
                                    "published",
                                ].map((x) => (
                                    <option key={x}>{x}</option>
                                ))}
                            </select>
                        </label>
                        <label className="check-label">
                            <input
                                type="checkbox"
                                checked={!!tr.reviewed}
                                onChange={(e) =>
                                    set("reviewed", e.target.checked)
                                }
                            />
                            A human reviewer has checked this translation.
                        </label>
                        {legal && (
                            <label className="check-label">
                                <input
                                    type="checkbox"
                                    checked={!!tr.legal_approved}
                                    onChange={(e) =>
                                        set("legal_approved", e.target.checked)
                                    }
                                />
                                The owner has confirmed operational details and
                                approved this legal text.
                            </label>
                        )}
                        {!legal && (
                            <>
                                {[
                                    "hero_image",
                                    "hero_background",
                                    "intro_image",
                                    "cta_image",
                                ].map((key) => (
                                    <ImageField
                                        key={key}
                                        label={key.replaceAll("_", " ")}
                                        value={tr[key]}
                                        onChange={(v) => set(key, v)}
                                    />
                                ))}
                            </>
                        )}
                        {msg && (
                            <p className="notice" role="status">
                                {msg}
                            </p>
                        )}
                        <Button disabled={busy}>
                            {busy ? "Saving…" : "Save page"}
                        </Button>
                        <button
                            className="text-button"
                            type="button"
                            onClick={() => setHistory(!history)}
                        >
                            Revision history · v{form.version}
                        </button>
                        <a
                            className="text-link"
                            href={`/${lang}/${form.slug === "home" ? "" : form.slug}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open published page <ArrowRight size={15} />
                        </a>
                    </aside>
                </div>
            </form>
            {history && (
                <History
                    type="page"
                    id={id}
                    version={form.version}
                    onClose={() => setHistory(false)}
                    onRestored={() => {
                        setHistory(false);
                        load();
                    }}
                />
            )}
        </>
    );
}
export function MediaLibrary() {
    const [rows, setRows] = useState([]),
        [msg, setMsg] = useState(""),
        [kind, setKind] = useState("all");
    const load = () =>
        api("/api/admin/media")
            .then((d) => setRows(d.data))
            .catch((e) => setMsg(e.message));
    useEffect(() => {
        load();
    }, []);
    return (
        <>
            <div className="admin-heading">
                <div>
                    <p className="eyebrow">MEDIA LIBRARY</p>
                    <h1>Photos & documents</h1>
                    <p>
                        Photos are resized and stripped of metadata. PDFs remain
                        private until attached to a published record.
                    </p>
                </div>
                <label className="upload-control">
                    Upload
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={async (e) => {
                            if (!e.target.files[0]) return;
                            try {
                                await upload(e.target.files[0]);
                                load();
                                setMsg("Upload complete.");
                            } catch (e) {
                                setMsg(e.message);
                            }
                        }}
                    />
                </label>
            </div>
            <div className="tabs">
                {["all", "image", "pdf"].map((k) => (
                    <button
                        key={k}
                        className={kind === k ? "selected" : ""}
                        onClick={() => setKind(k)}
                    >
                        {k}
                    </button>
                ))}
            </div>
            {msg && <p className="notice">{msg}</p>}
            <div className="media-library">
                {rows
                    .filter((m) => kind === "all" || m.kind === kind)
                    .map((m) => (
                        <section className="panel media-tile" key={m.id}>
                            {m.kind === "image" ? (
                                <img src={m.url} alt={m.name} />
                            ) : (
                                <FileText size={50} />
                            )}
                            <strong>{m.name}</strong>
                            <small>
                                {m.kind.toUpperCase()} ·{" "}
                                {(m.bytes / 1024).toFixed(0)} KB · ID {m.id}
                            </small>
                            <a
                                href={m.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-link"
                            >
                                Open file
                            </a>
                            <button
                                type="button"
                                className="text-button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(
                                            m.kind === "image"
                                                ? m.url
                                                : String(m.id),
                                        );
                                        setMsg("Copied.");
                                    } catch {
                                        setMsg(
                                            m.kind === "image"
                                                ? m.url
                                                : String(m.id),
                                        );
                                    }
                                }}
                            >
                                <Copy size={14} />
                                Copy{" "}
                                {m.kind === "image"
                                    ? "image path"
                                    : "document ID"}
                            </button>
                        </section>
                    ))}
            </div>
            {!rows.length && (
                <div className="empty">
                    Upload a photo or PDF to get started.
                </div>
            )}
        </>
    );
}
export function ContentExtras({ form, setForm, lang }) {
    const [msg, setMsg] = useState(""),
        [assets, setAssets] = useState([]);
    useEffect(() => {
        api("/api/admin/media")
            .then((d) => setAssets(d.data))
            .catch((e) => setMsg(e.message));
    }, []);
    const set = (k, v) => setForm({ ...form, [k]: v });
    return (
        <section className="content-extras">
            <h3>Media & archive details</h3>
            {form.type === "parliament" && (
                <>
                    <label>
                        Parliamentary contribution
                        <select
                            value={form.parliament_kind || ""}
                            onChange={(e) =>
                                set("parliament_kind", e.target.value || null)
                            }
                        >
                            <option value="">Select type</option>
                            {[
                                "question",
                                "speech",
                                "bill",
                                "committee",
                                "intervention",
                            ].map((k) => (
                                <option key={k}>{k}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Sitting / session year
                        <input
                            type="number"
                            min="1900"
                            max="2200"
                            value={form.session_year || ""}
                            onChange={(e) =>
                                set(
                                    "session_year",
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                )
                            }
                        />
                    </label>
                    <label>
                        Question / reference number
                        <input
                            value={form.question_number || ""}
                            onChange={(e) =>
                                set("question_number", e.target.value)
                            }
                        />
                    </label>
                    <label>
                        Ministry / committee
                        <input
                            value={form.ministry || ""}
                            onChange={(e) => set("ministry", e.target.value)}
                        />
                    </label>
                </>
            )}
            <label>
                Topics (comma separated)
                <input
                    defaultValue={(form.topics || []).join(", ")}
                    onBlur={(e) =>
                        set(
                            "topics",
                            e.target.value
                                .split(",")
                                .map((x) => x.trim())
                                .filter(Boolean),
                        )
                    }
                />
            </label>
            <label>
                YouTube / Vimeo HTTPS link
                <input
                    type="url"
                    value={form.video_url || ""}
                    onChange={(e) => set("video_url", e.target.value || null)}
                />
            </label>
            <label>
                Attach a PDF
                <select
                    value=""
                    onChange={(e) => {
                        if (e.target.value)
                            set("attachments", [
                                ...new Set([
                                    ...(form.attachments || []),
                                    Number(e.target.value),
                                ]),
                            ]);
                    }}
                >
                    <option value="">Select a document</option>
                    {assets
                        .filter((a) => a.kind === "pdf")
                        .map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                </select>
            </label>
            <label className="upload-control">
                <Upload size={16} />
                Upload & attach PDF
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                        if (!e.target.files[0]) return;
                        try {
                            const a = await upload(e.target.files[0]);
                            setAssets([...assets, { ...a }]);
                            set("attachments", [
                                ...(form.attachments || []),
                                a.id,
                            ]);
                        } catch (e) {
                            setMsg(e.message);
                        }
                    }}
                />
            </label>
            {(form.attachments || []).map((id) => (
                <div className="data-row" key={id}>
                    <small>
                        {assets.find((a) => a.id === id)?.name || "PDF #" + id}
                    </small>
                    <button
                        className="text-button danger"
                        type="button"
                        onClick={() =>
                            set(
                                "attachments",
                                form.attachments.filter((x) => x !== id),
                            )
                        }
                    >
                        Remove
                    </button>
                </div>
            ))}
            <h4>Photo gallery</h4>
            <label className="upload-control">
                <Upload size={16} />
                Add gallery photo
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                        if (!e.target.files[0]) return;
                        try {
                            const a = await upload(e.target.files[0]);
                            set("gallery", [
                                ...(form.gallery || []),
                                {
                                    image: a.url,
                                    translations: {
                                        en: { caption: "", alt: "" },
                                        fr: { caption: "", alt: "" },
                                        km: { caption: "", alt: "" },
                                    },
                                },
                            ]);
                        } catch (e) {
                            setMsg(e.message);
                        }
                    }}
                />
            </label>
            {(form.gallery || []).map((g, i) => (
                <div key={i} className="gallery-editor">
                    <img src={g.image} alt="Gallery preview" />
                    {["caption", "alt"].map((k) => (
                        <label key={k}>
                            {languages[lang]} {k}
                            <input
                                value={g.translations?.[lang]?.[k] || ""}
                                onChange={(e) =>
                                    set(
                                        "gallery",
                                        form.gallery.map((x, n) =>
                                            n === i
                                                ? {
                                                      ...x,
                                                      translations: {
                                                          ...x.translations,
                                                          [lang]: {
                                                              ...x
                                                                  .translations?.[
                                                                  lang
                                                              ],
                                                              [k]: e.target
                                                                  .value,
                                                          },
                                                      },
                                                  }
                                                : x,
                                        ),
                                    )
                                }
                            />
                        </label>
                    ))}
                    <button
                        className="text-button"
                        type="button"
                        disabled={i === 0}
                        onClick={() => {
                            const a = [...form.gallery];
                            [a[i - 1], a[i]] = [a[i], a[i - 1]];
                            set("gallery", a);
                        }}
                    >
                        Move up
                    </button>
                    <button
                        className="text-button danger"
                        type="button"
                        onClick={() =>
                            set(
                                "gallery",
                                form.gallery.filter((_, n) => n !== i),
                            )
                        }
                    >
                        Remove photo
                    </button>
                </div>
            ))}
            {msg && <p className="notice">{msg}</p>}
        </section>
    );
}
export function StaffStudio() {
    const [rows, setRows] = useState([]),
        [msg, setMsg] = useState(""),
        [busy, setBusy] = useState(false);
    const load = () =>
        api("/api/admin/staff")
            .then((d) => setRows(d.data))
            .catch((e) => setMsg(e.message));
    useEffect(() => {
        load();
    }, []);
    async function update(row) {
        try {
            await api("/api/admin/staff/" + row.id, {
                method: "PUT",
                body: JSON.stringify(row),
            });
            setMsg("Staff account updated.");
            load();
        } catch (e) {
            setMsg(e.message);
        }
    }
    return (
        <>
            <div className="admin-heading">
                <div>
                    <p className="eyebrow">ACCESS CONTROL</p>
                    <h1>Staff & permissions</h1>
                    <p>
                        Invite staff, manage permissions and suspend access.
                        Passwords are never sent by email.
                    </p>
                </div>
            </div>
            <form
                className="panel staff-invite"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                        await api("/api/admin/staff", {
                            method: "POST",
                            body: JSON.stringify(
                                Object.fromEntries(new FormData(e.target)),
                            ),
                        });
                        e.target.reset();
                        setMsg(
                            "Invitation queued. The mail worker must be running.",
                        );
                        load();
                    } catch (e) {
                        setMsg(e.message);
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <h3>Invite a team member</h3>
                <div className="form-two">
                    <label>
                        Name
                        <input name="name" required maxLength={120} />
                    </label>
                    <label>
                        Email
                        <input name="email" type="email" required />
                    </label>
                </div>
                <label>
                    Role
                    <select name="role">
                        <option value="editor">
                            Editor — content and enquiries
                        </option>
                        <option value="admin">
                            Administrator — staff, settings and restoration
                        </option>
                    </select>
                </label>
                <Button disabled={busy}>Send setup invitation</Button>
            </form>
            {msg && (
                <p className="notice" role="status">
                    {msg}
                </p>
            )}
            {rows.map((row) => (
                <section key={row.id} className="panel staff-row">
                    <div>
                        <strong>{row.name}</strong>
                        <small>
                            {row.email} ·{" "}
                            {row.enrolled
                                ? "Authenticator enrolled"
                                : "Setup pending"}
                        </small>
                    </div>
                    <label>
                        Role
                        <select
                            value={row.role}
                            onChange={(e) =>
                                update({ ...row, role: e.target.value })
                            }
                        >
                            <option value="editor">editor</option>
                            <option value="admin">admin</option>
                        </select>
                    </label>
                    <label className="check-label">
                        <input
                            type="checkbox"
                            checked={row.is_active}
                            onChange={(e) =>
                                update({ ...row, is_active: e.target.checked })
                            }
                        />
                        Active
                    </label>
                    <label className="check-label">
                        <input
                            type="checkbox"
                            checked={row.notify_enquiries}
                            onChange={(e) =>
                                update({
                                    ...row,
                                    notify_enquiries: e.target.checked,
                                })
                            }
                        />
                        Enquiry alerts
                    </label>
                    <button
                        className="text-button"
                        onClick={async () => {
                            try {
                                const d = await api(
                                    `/api/admin/staff/${row.id}/invite`,
                                    { method: "POST" },
                                );
                                setMsg(d.message);
                            } catch (e) {
                                setMsg(e.message);
                            }
                        }}
                    >
                        Send access link
                    </button>
                </section>
            ))}
        </>
    );
}
export function StaffActivation() {
    const q = new URLSearchParams(location.search);
    const [setup, setSetup] = useState(null),
        [msg, setMsg] = useState(""),
        [done, setDone] = useState(false);
    const identity = { token: q.get("token"), email: q.get("email") };
    return (
        <main className="login-page">
            <div className="login-card">
                <Brand />
                <p className="eyebrow">SECURE STAFF ACCESS</p>
                <h1>Set up your access</h1>
                {done ? (
                    <>
                        <p role="status">{msg}</p>
                        <a className="button" href="/admin">
                            Sign in
                        </a>
                    </>
                ) : !setup ? (
                    <>
                        <p>
                            Validate your one-time link to continue. This link
                            expires after 60 minutes.
                        </p>
                        <Button
                            onClick={async () => {
                                try {
                                    setSetup(
                                        await api("/api/staff/prepare", {
                                            method: "POST",
                                            body: JSON.stringify(identity),
                                        }),
                                    );
                                    setMsg("");
                                } catch (e) {
                                    setMsg(e.message);
                                }
                            }}
                        >
                            Validate invitation
                        </Button>
                    </>
                ) : (
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const d = await api("/api/staff/activate", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        ...identity,
                                        ...Object.fromEntries(
                                            new FormData(e.target),
                                        ),
                                    }),
                                });
                                setMsg(d.message);
                                setDone(true);
                            } catch (e) {
                                setMsg(e.message);
                            }
                        }}
                    >
                        {!setup.enrolled && (
                            <>
                                <p>
                                    Add this setup key to your authenticator
                                    app. Keep it private.
                                </p>
                                <code className="setup-secret">
                                    {setup.secret}
                                </code>
                                <p className="muted">
                                    Account: {identity.email}. Time-based codes,
                                    six digits.
                                </p>
                            </>
                        )}
                        <label>
                            New password
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={12}
                                autoComplete="new-password"
                            />
                        </label>
                        <label>
                            Confirm password
                            <input
                                type="password"
                                name="password_confirmation"
                                required
                                minLength={12}
                                autoComplete="new-password"
                            />
                        </label>
                        <label>
                            {setup.enrolled
                                ? "Existing authenticator code"
                                : "Authenticator code"}
                            <input
                                name="code"
                                required
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                autoComplete="one-time-code"
                            />
                        </label>
                        <Button>Activate access</Button>
                    </form>
                )}
                {!done && msg && (
                    <p className="notice" role="alert">
                        {msg}
                    </p>
                )}
            </div>
        </main>
    );
}
export function ForgotAccess({ onClose }) {
    const [msg, setMsg] = useState("");
    return (
        <section>
            <h3>Request an access link</h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        const d = await api("/api/staff/forgot", {
                            method: "POST",
                            body: JSON.stringify(
                                Object.fromEntries(new FormData(e.target)),
                            ),
                        });
                        setMsg(d.message);
                    } catch (e) {
                        setMsg(e.message);
                    }
                }}
            >
                <label>
                    Staff email
                    <input name="email" type="email" required />
                </label>
                <Button>Request link</Button>
            </form>
            {msg && <p className="notice">{msg}</p>}
            <button className="text-button" onClick={onClose}>
                Back to sign in
            </button>
        </section>
    );
}

export function Login({ onLogin }) {
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [forgot, setForgot] = useState(false);
    const [enrolment, setEnrolment] = useState(null);
    if (forgot)
        return (
            <main className="login-page">
                <div className="login-card">
                    <ForgotAccess onClose={() => setForgot(false)} />
                </div>
            </main>
        );
    return (
        <main className="login-page">
            <div className="login-card">
                <Brand />
                <p className="eyebrow">EDITORIAL WORKSPACE</p>
                <h1>Welcome back.</h1>
                <p>Manage the stories, ideas and work that connect us.</p>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        try {
                            const d = await api("/api/login", {
                                method: "POST",
                                body: JSON.stringify(
                                    Object.fromEntries(new FormData(e.target)),
                                ),
                            });
                            if (d.requires_enrolment) {
                                setEnrolment(d.secret);
                                setError(
                                    "Add this key to your authenticator app, then enter its current code.",
                                );
                            } else onLogin(d.user);
                        } catch (e) {
                            setError(e.message);
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    <label>
                        Email
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="username"
                        />
                    </label>
                    <label>
                        Password
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                        />
                    </label>
                    {enrolment && (
                        <code className="setup-secret">{enrolment}</code>
                    )}
                    <label>
                        Authenticator code
                        <input
                            name="code"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </label>
                    {error && (
                        <p role="alert" className="notice">
                            {error}
                        </p>
                    )}
                    <Button disabled={busy}>
                        {busy ? "Signing in…" : "Sign in securely"}
                    </Button>
                </form>
                <button
                    type="button"
                    className="text-button"
                    onClick={() => setForgot(true)}
                >
                    Forgot password / activate access
                </button>
                <small>
                    <Shield size={14} /> Protected editorial access · No public
                    registration
                </small>
                <a className="text-link" href="/en">
                    Back to website
                    <ArrowRight size={16} />
                </a>
            </div>
        </main>
    );
}
