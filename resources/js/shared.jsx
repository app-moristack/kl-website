import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
const locale =
    document.documentElement.dataset.locale ||
    document.documentElement.lang ||
    "en";
const copy = {
    en: {
        nav: [
            "Home",
            "About",
            "Parliament",
            "No. 15",
            "Perspectives",
            "Media",
            "Contact",
        ],
        eyebrow: "A LIFE IN LAW AND PUBLIC SERVICE",
        hero: (
            <>
                A commitment
                <br />
                to <em>people.</em>
                <br />A vision for
                <br />
                Mauritius.
            </>
        ),
        intro: "Law. Leadership. Public service.",
        desc: "Discover the work, ideas and public engagement of Khushal Lobine.",
        discover: "Discover Khushal",
        explore: "Explore parliamentary work",
        work: "Parliament. People. Perspectives.",
        workSub:
            "Three connected areas of public service, with people at the centre.",
        latest: "The latest from the journey",
        latestSub: "Parliamentary work, ideas and community updates.",
        all: "View all",
        read: "Read more",
        contact: "Connect with Khushal",
        contactSub:
            "Your ideas, concerns and suggestions matter. Get in touch with the team.",
        empty: "Updates will appear here once published by the editorial team.",
        send: "Send message",
        privacy: "Privacy",
        terms: "Terms",
        footer: "A stronger Mauritius. For all.",
        about: "Law, leadership and public service",
        aboutText:
            "This website brings together Khushal Lobine’s parliamentary work, engagement with Constituency No. 15 and perspectives on national issues.",
        paragraph:
            "Listening to people, engaging with ideas and working towards practical solutions are at the heart of public service.",
        message: "Representation starts with listening.",
        formTitle: "We would like to hear from you",
        name: "Full name",
        email: "Email address",
        subject: "Subject",
        body: "Your message",
        consent:
            "I agree that the team may use these details to respond to my enquiry.",
        received: "Thank you. Your message has been received.",
        search: "Search published content",
        types: ["All", "Articles", "Parliament", "Media", "Community"],
        sections: {
            parliament: [
                "PARLIAMENTARY WORK",
                "Scrutiny. Accountability. Action.",
                "Questions, speeches, debates and legislative contributions.",
            ],
            constituency: [
                "CONSTITUENCY NO. 15",
                "La Caverne & Phoenix",
                "Community priorities, local engagement and the people at the heart of our work.",
            ],
            perspectives: [
                "IDEAS & PERSPECTIVES",
                "Ideas for a stronger Mauritius",
                "Reflections on law, governance, democracy and opportunity.",
            ],
            media: [
                "MEDIA & INTERVIEWS",
                "In conversation",
                "Interviews, statements and public engagements.",
            ],
            contact: [
                "GET IN TOUCH",
                "Your voice matters.",
                "Speak to the team, share a concern or request an appointment.",
            ],
        },
    },
    fr: {
        nav: [
            "Accueil",
            "À propos",
            "Parlement",
            "N° 15",
            "Perspectives",
            "Médias",
            "Contact",
        ],
        eyebrow: "LE DROIT ET LE SERVICE PUBLIC",
        hero: (
            <>
                Un engagement
                <br />
                pour les <em>citoyens.</em>
                <br />
                Une vision pour
                <br />
                Maurice.
            </>
        ),
        intro: "Droit. Leadership. Service public.",
        desc: "Découvrez le travail, les idées et l’engagement public de Khushal Lobine.",
        discover: "Découvrir Khushal",
        explore: "Le travail parlementaire",
        work: "Parlement. Citoyens. Perspectives.",
        workSub:
            "Trois dimensions du service public, avec les citoyens au centre.",
        latest: "Les dernières actualités",
        latestSub:
            "Travail parlementaire, idées et actualités de la communauté.",
        all: "Tout voir",
        read: "Lire la suite",
        contact: "Contacter Khushal",
        contactSub:
            "Vos idées, préoccupations et suggestions comptent. Contactez notre équipe.",
        empty: "Les actualités seront affichées après leur publication par l’équipe éditoriale.",
        send: "Envoyer le message",
        privacy: "Confidentialité",
        terms: "Conditions",
        footer: "Une île Maurice plus forte. Pour tous.",
        about: "Droit, leadership et service public",
        aboutText:
            "Ce site rassemble le travail parlementaire de Khushal Lobine, son engagement dans la circonscription n° 15 et ses perspectives sur les enjeux nationaux.",
        paragraph:
            "Écouter les citoyens, échanger des idées et rechercher des solutions concrètes sont au cœur du service public.",
        message: "La représentation commence par l’écoute.",
        formTitle: "Nous sommes à votre écoute",
        name: "Nom complet",
        email: "Adresse e-mail",
        subject: "Objet",
        body: "Votre message",
        consent:
            "J’accepte que l’équipe utilise ces informations pour répondre à ma demande.",
        received: "Merci. Votre message a bien été reçu.",
        search: "Rechercher dans les publications",
        types: ["Tout", "Articles", "Parlement", "Médias", "Communauté"],
        sections: {
            parliament: [
                "TRAVAIL PARLEMENTAIRE",
                "Examen. Responsabilité. Action.",
                "Questions, discours, débats et contributions législatives.",
            ],
            constituency: [
                "CIRCONSCRIPTION N° 15",
                "La Caverne et Phoenix",
                "Les priorités locales et les citoyens au cœur de notre travail.",
            ],
            perspectives: [
                "IDÉES ET PERSPECTIVES",
                "Des idées pour une île Maurice plus forte",
                "Réflexions sur le droit, la gouvernance et la démocratie.",
            ],
            media: [
                "MÉDIAS ET ENTRETIENS",
                "En conversation",
                "Entretiens, communiqués et rencontres publiques.",
            ],
            contact: [
                "CONTACT",
                "Votre voix compte.",
                "Contactez l’équipe ou demandez un rendez-vous.",
            ],
        },
    },
    km: {
        nav: [
            "Akèy",
            "Lor Khushal",
            "Parlman",
            "No. 15",
            "Lide",
            "Media",
            "Kontak",
        ],
        eyebrow: "KREOL MORISIEN",
        hero: (
            <>
                Enn lang.
                <br />
                Enn <em>kominote.</em>
                <br />
                Enn lavenir
                <br />
                ansam.
            </>
        ),
        intro: "Tradiksion pe atann revizion.",
        desc: "Bann tradiksion Kreol Morisien pou pibliye apre enn revizion imin.",
        discover: "Lor Khushal",
        explore: "Travay dan Parlman",
        work: "Parlman. Dimoun. Lide.",
        workSub: "Servis piblik avek dimoun dan sant nou travay.",
        latest: "Bann dernie piblikasion",
        latestSub: "Travay dan Parlman ek dan kominote.",
        all: "Get tou",
        read: "Lir plis",
        contact: "Kontak Khushal",
        contactSub: "Partaz ou bann lide ek ou bann konsern avek lekip.",
        empty: "Bann piblikasion pou disponib apre revizion ek piblikasion.",
        send: "Avoy mesaz",
        privacy: "Konfidansialite",
        terms: "Kondision",
        footer: "Enn Moris pli for. Pou tou dimoun.",
        about: "Lalwa ek servis piblik",
        aboutText: "Tradiksion sa paz-la pe atann revizion.",
        paragraph: "Tradiksion pe atann revizion.",
        message: "Ekout dimoun.",
        formTitle: "Kontak nou lekip",
        name: "Nom konple",
        email: "Adres email",
        subject: "Sizet",
        body: "Ou mesaz",
        consent:
            "Mo dakor ki lekip servi sa bann linformasion-la pou reponn mwa.",
        received: "Mersi. Nou finn resevwar ou mesaz.",
        search: "Rod enn piblikasion",
        types: ["Tou", "Lartik", "Parlman", "Media", "Kominote"],
        sections: {
            parliament: [
                "TRAVAY DAN PARLMAN",
                "Parlman",
                "Bann piblikasion ki finn revize.",
            ],
            constituency: [
                "SIRKONSKRIPSION NO. 15",
                "La Caverne ek Phoenix",
                "Bann piblikasion ki finn revize.",
            ],
            perspectives: [
                "LIDE",
                "Lide pou Moris",
                "Bann piblikasion ki finn revize.",
            ],
            media: [
                "MEDIA",
                "Media ek interview",
                "Bann piblikasion ki finn revize.",
            ],
            contact: ["KONTAK", "Ou lavwa konte.", "Kontak nou lekip."],
        },
    },
};
const t = copy[locale] || copy.en;
const paths = [
    "",
    "about",
    "parliament",
    "constituency",
    "perspectives",
    "media",
    "contact",
];
const href = (p = "") => `/${locale}${p ? "/" + p : ""}`;
async function api(path, options = {}) {
    const headers = {
        Accept: "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
            .content,
        ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        ...options.headers,
    };
    const res = await fetch(path, {
        credentials: "same-origin",
        ...options,
        headers,
    });
    const data = await res
        .json()
        .catch(() => ({ message: "Unexpected server response." }));
    if (data.csrf)
        document.querySelector('meta[name="csrf-token"]').content = data.csrf;
    if (!res.ok)
        throw new Error(
            Object.values(data.errors || {})
                .flat()
                .join(" ") ||
                data.message ||
                "Request failed.",
        );
    return data;
}
function Brand() {
    return (
        <a className="brand" href={href()} aria-label="Khushal Lobine home">
            {location.pathname.split("/")[2] &&
            !location.pathname.startsWith("/admin") ? (
                <span className="reference-wordmark classic-wordmark">
                    <img
                        src="/reference-assets/about.jpg"
                        alt="Khushal Lobine"
                    />
                </span>
            ) : (
                <span className="reference-wordmark">
                    <img
                        src="/reference-assets/home.jpg"
                        alt="Khushal Lobine"
                    />
                </span>
            )}
        </a>
    );
}
function Button({ children, to, secondary = false, ...rest }) {
    return to ? (
        <a
            className={`button ${secondary ? "secondary" : ""}`}
            href={to}
            {...rest}
        >
            {children}
            <ArrowUpRight size={17} />
        </a>
    ) : (
        <button className={`button ${secondary ? "secondary" : ""}`} {...rest}>
            {children}
            <ArrowRight size={17} />
        </button>
    );
}

export { locale, t, copy, paths, href, api, Brand, Button };
