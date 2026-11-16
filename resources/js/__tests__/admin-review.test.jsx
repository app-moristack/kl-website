import React from "react";
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
vi.mock("../shared", async () => ({
    ...(await vi.importActual("../shared")),
    api: vi.fn(),
}));
import { api } from "../shared";
import { PageStudio, History } from "../workspace";
import { TemplatePage } from "../template-pages";
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
it("exposes images and destination links for homepage update cards", async () => {
    api.mockResolvedValue({
        data: [
            {
                id: 1,
                slug: "home",
                version: 0,
                translations: {
                    en: {
                        hero_title: "Home",
                        status: "draft",
                        cards: [],
                        focus: [],
                        milestones: [
                            {
                                title: "Update",
                                image: "/images/update.jpg",
                                url: "/en/media",
                                year: "Undated",
                            },
                        ],
                    },
                },
            },
        ],
    });
    const { container } = render(<PageStudio />);
    await screen.findByLabelText("Hero title");
    const repeater = [...container.querySelectorAll(".repeater")].find((el) =>
        el.textContent.includes("Latest updates"),
    );
    expect(within(repeater).getByLabelText("image").value).toBe(
        "/images/update.jpg",
    );
    expect(within(repeater).getByLabelText("url").value).toBe("/en/media");
    expect(screen.queryByLabelText("Homepage design")).toBeNull();
});
it("keeps administrator-only legal editors out of the editor page selector", async () => {
    api.mockResolvedValue({
        data: [
            { id: 1, slug: "home", translations: { en: { status: "draft" } } },
            {
                id: 2,
                slug: "privacy",
                translations: { en: { status: "draft" } },
            },
        ],
    });
    render(<PageStudio canEditLegal={false} canRestore={false} />);
    await screen.findByLabelText("Hero title");
    expect(screen.queryByRole("option", { name: "privacy" })).toBeNull();
});
it("lets editors inspect history without offering restoration", async () => {
    api.mockResolvedValue({
        data: [
            {
                id: 1,
                version: 2,
                action: "saved",
                created_at: new Date().toISOString(),
                snapshot: { translations: { en: { title: "Snapshot" } } },
            },
        ],
    });
    render(
        <History
            type="page"
            id={1}
            version={2}
            canRestore={false}
            onClose={() => {}}
            onRestored={() => {}}
        />,
    );
    await screen.findByRole("button", { name: /Version 2/ });
    expect(
        screen.queryByRole("button", { name: "Restore as draft" }),
    ).toBeNull();
});
it("renders a configured homepage portrait and a non-date card label safely", () => {
    const { container } = render(
        <TemplatePage
            section="home"
            page={{
                hero_title: "Home",
                hero_body: "Introduction",
                intro_title: "About",
                intro_image: "/images/custom-portrait.jpg",
                cards: [],
                milestones: [
                    { title: "Update card", year: "Undated", url: "/en/media" },
                ],
            }}
            items={[]}
            settings={{}}
            Archive={() => null}
            VideoPlayer={() => null}
            Gallery={() => null}
        />,
    );
    expect(container.querySelector(".tpl-intro>img").getAttribute("src")).toBe(
        "/images/custom-portrait.jpg",
    );
    expect(screen.getByText("Undated")).toBeTruthy();
});
