import { describe, expect, it } from "vitest";
import { buildLoadingPage, escapeHtml } from "@/lib/scoreDetailLoadingPage";

describe("escapeHtml", () => {
  it("meng-escape semua karakter khusus HTML", () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
    );
  });

  it("tidak meng-escape ulang & dua kali dalam satu panggilan", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("membiarkan teks biasa apa adanya", () => {
    expect(escapeHtml("Teknik Informatika")).toBe("Teknik Informatika");
  });
});

describe("buildLoadingPage", () => {
  const origin = "https://ibl.example";

  it("menampilkan kedua nama tim di judul tab dan di halaman", () => {
    const html = buildLoadingPage("Elektro", "Sipil", origin);
    expect(html).toContain("<title>Score Detail · Elektro vs Sipil</title>");
    expect(html).toContain("<b>Elektro</b><i>VS</i><b>Sipil</b>");
  });

  it("meng-escape nama tim sehingga tidak bisa menyisipkan markup", () => {
    const html = buildLoadingPage(`<script>alert(1)</script>`, `A & B`, origin);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("A &amp; B");
  });

  it("memakai URL absolut dari origin untuk aset (tab about:blank tidak punya base URL)", () => {
    const html = buildLoadingPage("A", "B", origin);
    expect(html).toContain(`url("${origin}/images/BACKGROUND.png")`);
    expect(html).toContain(`src="${origin}/images/logo-ibl.png"`);
    expect(html).toContain(`${origin}/fonts/HollyWoodFont/SF%20Hollywood%20Hills%20Bold.ttf`);
    expect(html).not.toMatch(/(src|url\()="?\/(images|fonts|svg)\//);
  });

  it("berbahasa Indonesia dan mematikan animasi untuk prefers-reduced-motion", () => {
    const html = buildLoadingPage("A", "B", origin);
    expect(html).toContain('<html lang="id">');
    expect(html).toContain("Menyiapkan box score");
    expect(html).toContain("prefers-reduced-motion: reduce");
  });
});
