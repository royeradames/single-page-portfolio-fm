import { expect, test, type Page } from "@playwright/test";

// Regression checks for the October 8 width-sweep findings (overflow from 770 px, tight-spacing
// after an empty submit). Each fails on the shipped layout and passes once it is fixed.

const widths = [320, 375, 560, 768, 770, 1000, 1199, 1200, 1440, 1920];

/** In-flow children that cross the edge of a visible-overflow parent (the sweep's `overflow` rule, simplified). */
const spills = (page: Page) =>
  page.evaluate(() => {
    const outOfFlow = (el: Element, stop: Element) => {
      for (let n: Element | null = el; n && n !== stop; n = n.parentElement) {
        if (["absolute", "fixed"].includes(getComputedStyle(n).position)) return true;
      }
      return false;
    };
    const found: string[] = [];
    for (const parent of document.body.querySelectorAll("*")) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== "visible" || style.display === "contents" || parent.scrollWidth <= parent.clientWidth + 1) continue;
      const box = parent.getBoundingClientRect();
      if (!box.width) continue;
      for (const child of parent.querySelectorAll("button, input, a, span, p, h1, h2, h3, li")) {
        if (outOfFlow(child, parent) || child.closest(".sr-only, [hidden]")) continue;
        const r = child.getBoundingClientRect();
        if (r.width && (r.right > box.right + 1 || r.left < box.left - 1)) found.push(`${child.textContent?.trim().slice(0, 30)} in ${parent.className.toString().slice(0, 40)}`);
      }
    }
    return [...new Set(found)];
  });

test("social links and every label stay inside their boxes from 320 to 1920 px", async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await spills(page), `spill at ${width}px`).toEqual([]);
  }
});

// The design paints its rings pattern under the left of the form; that decoration is a CSS background now,
// so it isn't content. Every real neighbour (fields, labels, icons, buttons, text) must stay 4px clear.
test("empty-submit errors keep at least 4px from every content neighbour", async ({ page }) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.locator("#contact-name-error")).not.toBeEmpty();
    const clashes = await page.evaluate(() => {
      const found: string[] = [];
      const contact = document.querySelector("#contact")!;
      const errors = [...contact.querySelectorAll(".field-error")].filter((error) => error.textContent?.trim());
      const others = [...contact.querySelectorAll("input, textarea, button, img, svg, p, h2")].filter(
        (el) => !errors.some((e) => e === el || e.contains(el)) && el.getClientRects().length && !el.closest(".field-icon"),
      );
      for (const error of errors) {
        const range = document.createRange();
        range.selectNodeContents(error);
        const box = range.getBoundingClientRect();
        for (const other of others) {
          const r = other.getBoundingClientRect();
          const across = Math.min(r.right, box.right) - Math.max(r.left, box.left);
          if (across <= 4 || !r.height) continue;
          const gap = Math.max(box.top - r.bottom, r.top - box.bottom);
          if (gap < 4) found.push(`${error.id} is ${Math.round(gap)}px from ${other.localName}.${other.getAttribute("class") ?? ""}`);
        }
      }
      return found;
    });
    expect(clashes, `at ${width}px`).toEqual([]);
  }
});
