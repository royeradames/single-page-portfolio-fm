import { expect, test, type Page } from "@playwright/test";

const REQUIRED = "Sorry, this field is required";
const INVALID_EMAIL = "Sorry, invalid format here";
const DEMO_NOTICE = "This is a demo form, so your message was not sent or stored.";
const UPFRONT_NOTICE = "Demo form: nothing you enter is sent or stored.";
const SITE_NAME = "adamkeyes";
const SITE_URL = "https://single-page-portfolio-fm.royeradames.com";
const RED = "rgb(255, 111, 91)";
const GREEN = "rgb(78, 225, 160)";

test.beforeEach(async ({ page }) => {
  // Transitions are instant so state checks are deterministic.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

function contactForm(page: Page) {
  const form = page.getByRole("form", { name: "Contact Adam" });
  return {
    form,
    name: form.getByRole("textbox", { name: "Name" }),
    email: form.getByRole("textbox", { name: "Email" }),
    message: form.getByRole("textbox", { name: "Message" }),
    send: form.getByRole("button", { name: "Send message" }),
    status: form.getByRole("status"),
  };
}

test("renders the designed content, metadata and icons", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Single-page developer portfolio | Royer Adames");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Adam Keyes/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nice to meet you! I’m Adam Keyes.");
  for (const name of ["HTML", "CSS", "JavaScript", "Accessibility", "React", "Sass"]) {
    await expect(page.getByRole("heading", { level: 3, name, exact: true })).toBeVisible();
  }
  await expect(page.locator(".project")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  for (const profile of ["GitHub", "Frontend Mentor", "LinkedIn", "Twitter"]) {
    await expect(page.getByRole("navigation", { name: "Social profiles", exact: true }).getByRole("link", { name: profile })).toBeVisible();
  }
  const iconHrefs = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((links) =>
    links.map((link) => (link as HTMLLinkElement).href));
  expect(iconHrefs.some((href) => href.includes("/icon.svg"))).toBe(true);
  expect(iconHrefs.some((href) => href.includes("/apple-icon.png"))).toBe(true);
  for (const href of iconHrefs) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
  const images = await page.locator("img").evaluateAll((elements) =>
    elements.map((element) => ({ src: (element as HTMLImageElement).currentSrc, alt: element.getAttribute("alt") })));
  expect(images.filter((image) => image.alt === null)).toEqual([]);
});

for (const width of [400, 768, 1440]) {
  test(`the demo notice is visible near the form before anyone types at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const notice = page.locator("#contact").getByText(UPFRONT_NOTICE, { exact: true });
    await expect(notice).toBeVisible();
    await expect(contactForm(page).name).toHaveValue("");
    const noticeBox = (await notice.boundingBox())!;
    const sendBox = (await contactForm(page).send.boundingBox())!;
    // It is read before the visitor reaches the send button.
    expect(noticeBox.y).toBeLessThan(sendBox.y);
    expect(parseFloat(await notice.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  });
}

test("the home page declares one site name for search", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-header .logo")).toHaveText(SITE_NAME);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", SITE_NAME);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", SITE_URL);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE_URL);
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const websites = blocks.map((text) => JSON.parse(text)).filter((data) => data["@type"] === "WebSite");
  expect(websites).toEqual([{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL }]);
});

test.describe("desktop project links", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("appear on hover and on keyboard focus, then hide again", async ({ page }) => {
    await page.goto("/");
    const card = page.locator(".project").first();
    const links = card.locator(".project-links");
    const viewProject = card.getByRole("link", { name: "View project: Design portfolio" });
    const viewCode = card.getByRole("link", { name: "View code: Design portfolio (GitHub search)" });
    await card.scrollIntoViewIfNeeded();
    await expect(links).toHaveCSS("opacity", "0");

    // A pointer over the screenshot lands on the transparent overlay inside the card.
    await card.hover({ position: { x: 270, y: 60 } });
    await expect(links).toHaveCSS("opacity", "1");
    // The overlay sits over the screenshot, centered, as in the active-state frame.
    const imageBox = (await card.locator("img").boundingBox())!;
    const projectBox = (await viewProject.boundingBox())!;
    expect(projectBox.y).toBeGreaterThan(imageBox.y);
    expect(projectBox.y + projectBox.height).toBeLessThan(imageBox.y + imageBox.height);
    await viewProject.hover();
    await expect(viewProject).toHaveCSS("color", GREEN);

    await page.mouse.move(5, 5);
    await expect(links).toHaveCSS("opacity", "0");
    // Only the screenshot reveals the links; the title and tags do not.
    await card.getByRole("heading", { level: 3 }).hover();
    await expect(links).toHaveCSS("opacity", "0");
    await card.locator(".project-tags").hover();
    await expect(links).toHaveCSS("opacity", "0");

    await viewProject.focus();
    await expect(links).toHaveCSS("opacity", "1");
    await page.keyboard.press("Tab");
    await expect(viewCode).toBeFocused();
    await expect(links).toHaveCSS("opacity", "1");
    await page.keyboard.press("Tab");
    await expect(card.getByRole("link", { name: /View project/ })).not.toBeFocused();
    await expect(links).toHaveCSS("opacity", "0");
    await expect(page.locator(".project").nth(1).locator(".project-links")).toHaveCSS("opacity", "1");
  });

  test("lead to the project preview and a code search", async ({ page, request }) => {
    await page.goto("/");
    const card = page.locator(".project").nth(4);
    const projectHref = await card.getByRole("link", { name: "View project: Memory game" }).getAttribute("href");
    expect(projectHref).toBe("/images/thumbnail-project-5-large.webp");
    const response = await request.get(projectHref!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/webp");
    await expect(card.getByRole("link", { name: "View code: Memory game (GitHub search)" })).toHaveAttribute(
      "href", "https://github.com/search?q=Memory%20game%20frontend%20mentor&type=repositories");
  });
});

async function expectLinksBelowEveryCard(page: Page) {
  for (const card of await page.locator(".project").all()) {
    const links = card.locator(".project-links");
    await expect(links).toHaveCSS("opacity", "1");
    await expect(links.getByRole("link")).toHaveCount(2);
    const tags = (await card.locator(".project-tags").boundingBox())!;
    const linkBox = (await links.boundingBox())!;
    expect(linkBox.y).toBeGreaterThanOrEqual(tags.y + tags.height);
  }
}

test.describe("touch screen at desktop width", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: true, hasTouch: true });

  test("keeps project links visible below each card", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(false);
    await expectLinksBelowEveryCard(page);
  });
});

test("the 1200px breakpoint switches from always-visible links to the hover overlay", async ({ page }) => {
  await page.setViewportSize({ width: 1199, height: 900 });
  await page.goto("/");
  await expectLinksBelowEveryCard(page);
  const columns = async () => page.locator(".project-list").evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(" ").length);
  expect(await columns()).toBe(2);
  await page.setViewportSize({ width: 1200, height: 900 });
  const card = page.locator(".project").first();
  await expect(card.locator(".project-links")).toHaveCSS("opacity", "0");
  await expect(card.locator(".project-links")).toHaveCSS("position", "absolute");
  expect(await columns()).toBe(2);
  await card.locator(".project-links").hover();
  await expect(card.locator(".project-links")).toHaveCSS("opacity", "1");
});

test("form fields keep a focus ring in forced colours", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/");
  const { name, send } = contactForm(page);
  await send.click();
  await expect(name).toBeFocused();
  await expect(name).toHaveCSS("outline-style", "solid");
  await expect(name).toHaveCSS("outline-width", "2px");
  const color = await name.evaluate((input) => getComputedStyle(input).outlineColor);
  expect(color).not.toBe("rgba(0, 0, 0, 0)");
});

for (const width of [400, 768]) {
  test(`project links are always visible below each card at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expectLinksBelowEveryCard(page);
  });
}

test.describe("retina screenshots", () => {
  test.use({ deviceScaleFactor: 2 });

  for (const width of [400, 768, 1199]) {
    test(`project screenshots are sharp enough for the card at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const image = page.locator(".project").first().locator("img");
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
      // naturalWidth is density-corrected for srcset candidates, so read the chosen file's real width.
      const { natural, rendered } = await image.evaluate((img) => ({
        natural: (img as HTMLImageElement).currentSrc.includes("-large.webp") ? 1080 : 686,
        rendered: img.getBoundingClientRect().width,
      }));
      // The largest supplied export is 1080px wide; below that, it should cover 2x.
      expect(natural).toBeGreaterThanOrEqual(Math.min(1080, Math.floor(rendered * 2)));
    });
  }
});

test.describe("contact form validation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("an empty submit flags every field and focuses the first", async ({ page }) => {
    await page.goto("/");
    const { name, email, message, send } = contactForm(page);
    await send.click();
    for (const field of [name, email, message]) {
      await expect(field).toHaveAttribute("aria-invalid", "true");
      await expect(field).toHaveAccessibleDescription(REQUIRED);
      await expect(field).toHaveCSS("border-bottom-color", RED);
      await expect(field.locator("xpath=..").locator(".field-icon")).toBeVisible();
    }
    await expect(name).toBeFocused();
    const error = page.locator("#contact-email-error");
    await expect(error).toHaveCSS("color", RED);
    await expect(error).toHaveCSS("text-align", "right");
  });

  test("whitespace counts as empty", async ({ page }) => {
    await page.goto("/");
    const { name, email, message, send } = contactForm(page);
    await name.fill("   ");
    await email.fill("fredrick@example.com");
    await message.fill("Hello");
    await send.click();
    await expect(name).toHaveAccessibleDescription(REQUIRED);
    await expect(name).toBeFocused();
    await expect(email).not.toHaveAttribute("aria-invalid", "true");
    await expect(message).not.toHaveAttribute("aria-invalid", "true");
  });

  test("a malformed email shows the format error and gets focus", async ({ page }) => {
    await page.goto("/");
    const { name, email, message, send, status } = contactForm(page);
    await name.fill("Fredrick Joules");
    await email.fill("fredrick#example.com");
    await message.fill("Hello Adam");
    await send.click();
    await expect(email).toHaveAccessibleDescription(INVALID_EMAIL);
    await expect(email).toBeFocused();
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await expect(status).toHaveText("");
    for (const bad of ["fredrick@", "fredrick@example", "@example.com", "fred rick@example.com"]) {
      await email.fill(bad);
      await expect(email).toHaveAccessibleDescription(INVALID_EMAIL);
    }
  });

  test("errors clear as each field is corrected after a failed submit", async ({ page }) => {
    await page.goto("/");
    const { name, email, message, send } = contactForm(page);
    await send.click();
    await name.fill("Fredrick");
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#contact-name-error")).toHaveText("");
    await email.fill("fredrick");
    await expect(email).toHaveAccessibleDescription(INVALID_EMAIL);
    await email.fill("fredrick@example.com");
    await expect(email).not.toHaveAttribute("aria-invalid", "true");
    await expect(message).toHaveAccessibleDescription(REQUIRED);
    await send.click();
    await expect(message).toBeFocused();
  });

  test("errors do not appear before the first submit", async ({ page }) => {
    await page.goto("/");
    const { email } = contactForm(page);
    await email.fill("not-an-email");
    await email.blur();
    await expect(email).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(".field-error:not(:empty)")).toHaveCount(0);
  });

  test("a valid message gets an honest demo confirmation and sends nothing", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => { if (request.method() !== "GET") writes.push(`${request.method()} ${request.url()}`); });
    await page.goto("/");
    const { name, email, message, send, status } = contactForm(page);
    await name.fill("Fredrick Joules");
    await email.fill(" fredrick@example.com ");
    await message.fill("I have a project for you.");
    await send.click();
    await expect(status).toHaveText(`Thanks, Fredrick Joules. ${DEMO_NOTICE}`);
    await expect(name).toHaveValue("");
    await expect(email).toHaveValue("");
    await expect(message).toHaveValue("");
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    expect(new URL(page.url()).search).toBe("");
    expect(writes).toEqual([]);
    await name.fill("F");
    await expect(status).toHaveText("");
  });
});

test("keyboard-only visitors can reach the form, fix errors and send", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "GitHub" }).first()).toBeFocused();
  for (let i = 0; i < 4; i += 1) await page.keyboard.press("Tab");
  const heroCta = page.locator(".hero").getByRole("link", { name: "Contact me" });
  await expect(heroCta).toBeFocused();
  await expect(heroCta).toHaveCSS("outline-color", GREEN);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contact$/);
  const { name, email, message, send, status } = contactForm(page);
  await page.keyboard.press("Tab");
  await expect(name).toBeFocused();
  await expect(name).toHaveCSS("border-bottom-color", GREEN);
  await page.keyboard.type("Fredrick Joules");
  await page.keyboard.press("Tab");
  await expect(email).toBeFocused();
  await page.keyboard.type("fredrick#example.com");
  await page.keyboard.press("Tab");
  await expect(message).toBeFocused();
  await page.keyboard.type("Hello");
  await page.keyboard.press("Tab");
  await expect(send).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(email).toBeFocused();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("fredrick@example.com");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(send).toBeFocused();
  await page.keyboard.press("Space");
  await expect(status).toContainText(DEMO_NOTICE);
});

for (const width of [400, 768, 1440]) {
  test(`both Contact me links scroll to the form at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const section of [".hero", ".projects"]) {
      await page.goto("/");
      await page.locator(section).getByRole("link", { name: "Contact me" }).click();
      await expect(page).toHaveURL(/#contact$/);
      const { form } = contactForm(page);
      await expect(form).toBeInViewport();
      const box = (await form.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(0);
    }
  });
}

for (const width of [375, 400, 768, 1000, 1199, 1200, 1440]) {
  test(`no horizontal overflow or undersized text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    // Show the inline errors too: they also meet the 16px floor (QA, October 8).
    await contactForm(page).send.click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const small = await page.evaluate(() => {
      const found: string[] = [];
      for (const element of document.querySelectorAll<HTMLElement>("body *")) {
        const ownText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        if (!ownText || !element.getClientRects().length || element.closest(".sr-only")) continue;
        if (parseFloat(getComputedStyle(element).fontSize) < 16) found.push(element.textContent ?? "");
      }
      return found;
    });
    expect(small).toEqual([]);
    const errorSize = await page.locator("#contact-name-error").evaluate((element) => getComputedStyle(element).fontSize);
    expect(errorSize).toBe("16px");
    for (const control of await page.locator("a:visible, button:visible").all()) {
      const box = (await control.boundingBox())!;
      expect(box.height, await control.textContent() ?? "").toBeGreaterThanOrEqual(24);
      expect(box.width).toBeGreaterThanOrEqual(24);
    }
  });
}

test("loads with no page errors and no requests to other hosts", async ({ page, baseURL }) => {
  const problems: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") problems.push(message.text()); });
  page.on("request", (request) => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) external.push(request.url()); });
  for (const width of [400, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    });
    await page.waitForLoadState("networkidle");
    const broken = await page.locator("img").evaluateAll((images) =>
      images.filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0).map((image) => (image as HTMLImageElement).src));
    expect(broken).toEqual([]);
    await contactForm(page).send.click();
  }
  expect(problems).toEqual([]);
  expect(external).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("content, links and the demo notice still work, and nothing is sent", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => { if (request.method() !== "GET") writes.push(request.url()); });
    await page.setViewportSize({ width: 400, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".project").first().getByRole("link", { name: "View project: Design portfolio" })).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    const firstLinks = page.locator(".project").first().locator(".project-links");
    await expect(firstLinks).toHaveCSS("opacity", "0");
    await page.locator(".project").first().getByRole("link", { name: "View project: Design portfolio" }).focus();
    await expect(firstLinks).toHaveCSS("opacity", "1");

    const { name, email, message, send } = contactForm(page);
    await send.click();
    expect(await name.evaluate((input) => (input as HTMLInputElement).validity.valueMissing)).toBe(true);
    await expect(page).toHaveURL(/\/$/);

    await name.fill("Fredrick Joules");
    await email.fill("fredrick@example.com");
    await message.fill("Private words");
    await send.click();
    await expect(page).toHaveURL(/\/\?#contact-demo-note$/);
    expect(page.url()).not.toContain("Fredrick");
    await expect(page.locator("#contact-demo-note")).toBeVisible();
    await expect(page.locator("#contact-demo-note")).toHaveText(UPFRONT_NOTICE);
    expect(writes).toEqual([]);
  });
});
