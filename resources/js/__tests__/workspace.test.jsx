import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    render,
    screen,
    cleanup,
    waitFor,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.mock("../shared", async () => ({
    ...(await vi.importActual("../shared")),
    api: vi.fn(),
}));
import { api } from "../shared";
import { PageStudio, ContentExtras, StaffStudio, Login } from "../workspace";
import { Gallery, VideoPlayer, Archive } from "../website";
beforeEach(() => {
    vi.resetAllMocks();
    document.body.style.overflow = "";
    window.confirm = vi.fn(() => true);
});
afterEach(() => cleanup());
describe("Public media and archive", () => {
    it("does not contact a video provider until explicitly loaded", async () => {
        const user = userEvent.setup();
        const { container } = render(
            <VideoPlayer
                item={{
                    title: "Interview",
                    image: "/images/portrait.jpg",
                    embed_url:
                        "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
                }}
            />,
        );
        expect(container.querySelector("iframe")).toBeNull();
        await user.click(screen.getByRole("button", { name: "Load video" }));
        expect(container.querySelector("iframe").getAttribute("src")).toContain(
            "youtube-nocookie.com",
        );
        expect(
            container.querySelector("iframe").getAttribute("sandbox"),
        ).toContain("allow-presentation");
    });
    it("supports gallery navigation, escape and focus restoration", async () => {
        const user = userEvent.setup();
        render(
            <Gallery
                title="Portraits"
                photos={[
                    {
                        image: "/a.jpg",
                        caption: "First",
                        alt: "First portrait",
                    },
                    {
                        image: "/b.jpg",
                        caption: "Second",
                        alt: "Second portrait",
                    },
                ]}
            />,
        );
        const trigger = screen.getByRole("button", {
            name: "Portraits 1: First portrait",
        });
        await user.click(trigger);
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(document.body.style.overflow).toBe("hidden");
        await user.keyboard("{ArrowRight}");
        expect(
            within(screen.getByRole("dialog")).getByAltText("Second portrait"),
        ).toBeTruthy();
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(trigger);
        expect(document.body.style.overflow).toBe("");
    });
    it("sends parliamentary filters to the paginated API", async () => {
        api.mockResolvedValue({
            data: [],
            meta: { total: 0, page: 1, last_page: 1 },
            facets: {
                years: [2026],
                topics: ["Governance"],
                ministries: ["Justice"],
            },
        });
        const user = userEvent.setup();
        render(<Archive type="parliament" parliament />);
        await screen.findByRole("option", { name: "2026" });
        await user.selectOptions(screen.getByLabelText("Year"), "2026");
        await user.selectOptions(
            screen.getByLabelText("Contribution type"),
            "speech",
        );
        await waitFor(() =>
            expect(
                api.mock.calls.some(
                    ([path]) =>
                        path.includes("year=2026") &&
                        path.includes("kind=speech") &&
                        path.includes("per_page=12"),
                ),
            ).toBe(true),
        );
    });
});
describe("Editorial screens", () => {
    it("saves editable hero text with a concurrency version", async () => {
        const page = {
            id: 1,
            slug: "home",
            version: 2,
            translations: {
                en: {
                    hero_title: "Original heading",
                    status: "draft",
                    cards: [],
                    milestones: [],
                    focus: [],
                },
            },
        };
        api.mockImplementation((path, opts) =>
            Promise.resolve(
                opts
                    ? {
                          ...page,
                          version: 3,
                          translations: JSON.parse(opts.body).translations,
                      }
                    : { data: [page] },
            ),
        );
        const user = userEvent.setup();
        render(<PageStudio />);
        const title = await screen.findByLabelText("Hero title");
        await user.clear(title);
        await user.type(title, "Updated heading");
        await user.click(screen.getByRole("button", { name: "Save page" }));
        await waitFor(() =>
            expect(
                api.mock.calls.some(
                    ([path, opts]) =>
                        path === "/api/admin/pages/1" &&
                        opts?.method === "PUT" &&
                        JSON.parse(opts.body).version === 2 &&
                        JSON.parse(opts.body).translations.en.hero_title ===
                            "Updated heading",
                ),
            ).toBe(true),
        );
    });
    it("attaches PDF IDs without treating private documents as public images", async () => {
        api.mockResolvedValue({
            data: [{ id: 7, name: "Speech.pdf", kind: "pdf" }],
        });
        const setForm = vi.fn();
        render(
            <ContentExtras
                form={{ type: "parliament", attachments: [], gallery: [] }}
                setForm={setForm}
                lang="en"
            />,
        );
        await screen.findByRole("option", { name: "Speech.pdf" });
        await userEvent.selectOptions(
            screen.getByLabelText("Attach a PDF"),
            "7",
        );
        expect(setForm).toHaveBeenCalledWith(
            expect.objectContaining({ attachments: [7] }),
        );
    });
    it("queues a staff invitation with a role and no emailed password", async () => {
        api.mockImplementation((path, opts) =>
            Promise.resolve(
                opts ? { id: 2, message: "Invitation queued." } : { data: [] },
            ),
        );
        const user = userEvent.setup();
        render(<StaffStudio />);
        const form = screen
            .getByRole("heading", { name: "Invite a team member" })
            .closest("form");
        await user.type(within(form).getByLabelText("Name"), "New Editor");
        await user.type(
            within(form).getByLabelText("Email"),
            "editor@example.com",
        );
        await user.click(
            within(form).getByRole("button", { name: "Send setup invitation" }),
        );
        await waitFor(() =>
            expect(
                api.mock.calls.some(
                    ([path, opts]) =>
                        path === "/api/admin/staff" &&
                        opts?.method === "POST" &&
                        JSON.parse(opts.body).role === "editor" &&
                        !("password" in JSON.parse(opts.body)),
                ),
            ).toBe(true),
        );
    });
});

it("requires the bootstrap authenticator step before opening the dashboard", async () => {
    const onLogin = vi.fn();
    api.mockResolvedValueOnce({
        requires_enrolment: true,
        secret: "TEST-SETUP-KEY",
    }).mockResolvedValueOnce({
        user: { name: "Administrator", role: "admin" },
    });
    const user = userEvent.setup();
    render(<Login onLogin={onLogin} />);
    await user.type(screen.getByLabelText("Email"), "admin@nd.com");
    await user.type(
        screen.getByLabelText("Password"),
        "only-a-disposable-test-password",
    );
    await user.click(screen.getByRole("button", { name: "Sign in securely" }));
    await screen.findByText("TEST-SETUP-KEY");
    expect(onLogin).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Authenticator code"), "123456");
    await user.click(screen.getByRole("button", { name: "Sign in securely" }));
    await waitFor(() =>
        expect(onLogin).toHaveBeenCalledWith({
            name: "Administrator",
            role: "admin",
        }),
    );
});
