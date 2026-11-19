// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Unit test bagian PDF di boxScoreExport. html-to-image, jsPDF, Image, dan canvas di-mock: jsdom tidak bisa
 * merender DOM ke gambar, dan yang diuji di sini adalah alur kita (cache font, JPEG, tata letak halaman),
 * bukan library-nya. Render sungguhan diuji oleh Playwright di e2e/score-detail.spec.ts.
 */

const htmlToImage = vi.hoisted(() => ({
  getFontEmbedCSS: vi.fn<(node: HTMLElement) => Promise<string>>(),
  toSvg: vi.fn<(node: HTMLElement, options: Record<string, unknown>) => Promise<string>>(),
}));
vi.mock("html-to-image", () => htmlToImage);

const pdfCalls = vi.hoisted(() => ({
  addImage: vi.fn(),
  addPage: vi.fn(),
  output: vi.fn(() => new Blob(["%PDF-fake"], { type: "application/pdf" })),
}));
vi.mock("jspdf", () => ({
  default: class {
    internal = { pageSize: { getWidth: () => 297, getHeight: () => 210 } };
    addImage = pdfCalls.addImage;
    addPage = pdfCalls.addPage;
    output = pdfCalls.output;
  },
}));

/** Modul di-load ulang per test karena cache font disimpan di level modul. */
async function loadModule() {
  vi.resetModules();
  return import("@/lib/boxScoreExport");
}

function sheet(width: number, height: number): HTMLElement {
  const el = document.createElement("div");
  Object.defineProperty(el, "scrollWidth", { value: width });
  Object.defineProperty(el, "scrollHeight", { value: height });
  return el;
}

/** Image palsu: onload langsung terpanggil (jsdom tidak memuat gambar). */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = "";
  decoding = "";
  decode = () => Promise.resolve();
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

const canvasCalls = vi.hoisted(() => ({
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  toDataURL: vi.fn((type?: string, quality?: number) => `data:${type};q=${quality};base64,AAAA`),
}));

beforeEach(() => {
  vi.clearAllMocks();
  htmlToImage.getFontEmbedCSS.mockResolvedValue("@font-face{font-family:Poppins}");
  htmlToImage.toSvg.mockResolvedValue("data:image/svg+xml;charset=utf-8,<svg/>");
  vi.stubGlobal("Image", FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () =>
      ({
        drawImage: canvasCalls.drawImage,
        fillRect: canvasCalls.fillRect,
        fillStyle: "",
      }) as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(canvasCalls.toDataURL);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("generateBoxScorePdf", () => {
  it("membuat satu halaman per lembar dan mengembalikan Blob PDF", async () => {
    const { generateBoxScorePdf } = await loadModule();
    const blob = await generateBoxScorePdf([sheet(1280, 600), sheet(1280, 600), sheet(1280, 600)]);

    expect(pdfCalls.addImage).toHaveBeenCalledTimes(3);
    expect(pdfCalls.addPage).toHaveBeenCalledTimes(2);
    expect(blob.type).toBe("application/pdf");
  });

  it("menyisipkan gambar sebagai JPEG (tanpa decode/kompres ulang PNG)", async () => {
    const { generateBoxScorePdf } = await loadModule();
    await generateBoxScorePdf([sheet(1280, 600)]);

    expect(htmlToImage.toSvg).toHaveBeenCalledTimes(1);
    expect(htmlToImage.toSvg.mock.calls[0][1]).toMatchObject({
      width: 1280,
      height: 600,
      fontEmbedCSS: "@font-face{font-family:Poppins}",
    });
    // Rasterisasi 1.5x di atas latar putih, lalu JPEG kualitas 0.92
    expect(canvasCalls.fillRect).toHaveBeenCalledWith(0, 0, 1920, 900);
    expect(canvasCalls.drawImage).toHaveBeenCalledWith(expect.any(FakeImage), 0, 0, 1920, 900);
    expect(canvasCalls.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.92);
    expect(pdfCalls.addImage.mock.calls[0][0]).toBe("data:image/jpeg;q=0.92;base64,AAAA");
    expect(pdfCalls.addImage.mock.calls[0][1]).toBe("JPEG");
  });

  it("selesai walau requestAnimationFrame tidak pernah jalan (halaman tersembunyi di belakang tab PDF)", async () => {
    const raf = vi.fn();
    vi.stubGlobal("requestAnimationFrame", raf);
    const { generateBoxScorePdf } = await loadModule();

    await expect(generateBoxScorePdf([sheet(1280, 600), sheet(1280, 600)])).resolves.toBeInstanceOf(Blob);
    expect(raf).not.toHaveBeenCalled();
  });

  it("gagal dengan jelas kalau gambar lembar tidak bisa dimuat", async () => {
    class BrokenImage extends FakeImage {
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", BrokenImage);
    const { generateBoxScorePdf } = await loadModule();

    await expect(generateBoxScorePdf([sheet(1280, 600)])).rejects.toThrow("Gagal memuat gambar lembar export");
  });

  it("menskalakan gambar agar muat di A4 landscape dengan margin 8mm, rasio tetap, dan di tengah", async () => {
    const { generateBoxScorePdf } = await loadModule();
    await generateBoxScorePdf([sheet(1280, 600)]);

    const [, , x, y, w, h] = pdfCalls.addImage.mock.calls[0] as [string, string, number, number, number, number];
    expect(w).toBeLessThanOrEqual(297 - 16 + 1e-9);
    expect(h).toBeLessThanOrEqual(210 - 16 + 1e-9);
    expect(w / h).toBeCloseTo(1280 / 600, 6);
    expect(x).toBeCloseTo((297 - w) / 2, 6);
    expect(y).toBeCloseTo((210 - h) / 2, 6);
  });

  it("lembar yang tinggi dibatasi oleh tinggi halaman", async () => {
    const { generateBoxScorePdf } = await loadModule();
    await generateBoxScorePdf([sheet(1280, 2000)]);

    const [, , , , w, h] = pdfCalls.addImage.mock.calls[0] as [string, string, number, number, number, number];
    expect(h).toBeCloseTo(210 - 16, 6);
    expect(w / h).toBeCloseTo(1280 / 2000, 6);
  });
});

describe("cache font", () => {
  it("mengambil CSS font sekali saja untuk banyak lembar dan banyak export", async () => {
    const { generateBoxScorePdf } = await loadModule();
    await generateBoxScorePdf([sheet(1280, 600), sheet(1280, 600)]);
    await generateBoxScorePdf([sheet(1280, 600)]);

    expect(htmlToImage.getFontEmbedCSS).toHaveBeenCalledTimes(1);
    expect(htmlToImage.toSvg).toHaveBeenCalledTimes(3);
  });

  it("prewarmBoxScoreExport mengisi cache sehingga export berikutnya tidak mengambil ulang", async () => {
    const { generateBoxScorePdf, prewarmBoxScoreExport } = await loadModule();
    const button = document.createElement("button");
    prewarmBoxScoreExport(button);
    prewarmBoxScoreExport(button);
    await generateBoxScorePdf([sheet(1280, 600)]);

    expect(htmlToImage.getFontEmbedCSS).toHaveBeenCalledTimes(1);
    expect(htmlToImage.getFontEmbedCSS).toHaveBeenCalledWith(button);
  });

  it("kalau ambil font gagal: export tetap jalan tanpa font, lalu export berikutnya mencoba lagi", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    htmlToImage.getFontEmbedCSS
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce("@font-face{font-family:Poppins}");
    const { generateBoxScorePdf } = await loadModule();

    await generateBoxScorePdf([sheet(1280, 600)]);
    expect(htmlToImage.toSvg.mock.calls[0][1]).toMatchObject({ fontEmbedCSS: "" });

    await generateBoxScorePdf([sheet(1280, 600)]);
    expect(htmlToImage.getFontEmbedCSS).toHaveBeenCalledTimes(2);
    expect(htmlToImage.toSvg.mock.calls[1][1]).toMatchObject({ fontEmbedCSS: "@font-face{font-family:Poppins}" });
  });
});

describe("exportPdf", () => {
  it("mengunduh PDF dengan nama file yang diberikan", async () => {
    const createObjectURL = vi.fn(() => "blob:fake");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const { exportPdf } = await loadModule();
    await exportPdf([sheet(1280, 600)], "box-score.pdf");

    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("box-score.pdf");
    expect(anchor.href).toBe("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
