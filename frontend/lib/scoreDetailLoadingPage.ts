/** Halaman loading yang ditulis ke tab baru saat tombol Score Detail diklik. */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Halaman loading di tab baru: memakai background, ornamen tiket, dan logo yang sama dengan halaman Schedule Result. */
export function buildLoadingPage(team1: string, team2: string, origin: string): string {
  const t1 = escapeHtml(team1);
  const t2 = escapeHtml(team2);
  const font = `${origin}/fonts/HollyWoodFont/SF%20Hollywood%20Hills%20Bold.ttf`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Score Detail · ${t1} vs ${t2}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap" rel="stylesheet" />
<style>
  @font-face { font-family: "Hollywood"; src: url("${font}") format("truetype"); font-weight: 700; font-display: block; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
    padding: 16px; background: #f3e6ce url("${origin}/images/BACKGROUND.png") center top / cover no-repeat;
    font-family: Poppins, sans-serif; text-align: center;
  }
  .ticket { position: absolute; width: 15vw; max-width: 240px; pointer-events: none;
    filter: drop-shadow(0 8px 18px rgba(0,0,0,.22)); animation: float 5.4s ease-in-out infinite; }
  .ticket.l { left: 2vw; top: 18%; }
  .ticket.r { right: 2vw; top: 36%; animation-delay: -2.7s; }
  @media (max-width: 1023px) { .ticket { display: none; } }
  .stack { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
  .logo { width: clamp(84px, 12vw, 140px); height: auto; filter: drop-shadow(3px 3px 0 #380606);
    animation: float 3s ease-in-out infinite; }
  h1 {
    margin: 18px 0 0; font-family: "Hollywood", Poppins, sans-serif; font-weight: 700;
    font-size: clamp(40px, 8vw, 88px); line-height: .9; letter-spacing: .02em; text-transform: uppercase;
    color: #c51610; -webkit-text-stroke: 2px #380606; paint-order: stroke fill;
    text-shadow: 4px 4px 0 #380606;
  }
  .teams {
    margin-top: 18px; display: inline-flex; align-items: stretch; border: 2px solid #380606;
    box-shadow: 3px 3px 0 #380606; font-weight: 800; text-transform: uppercase;
    font-size: clamp(12px, 1.6vw, 16px); letter-spacing: .03em;
  }
  .teams b { padding: 8px 14px; color: #fff; max-width: 38vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .teams b:first-child { background: #074770; }
  .teams b:last-child { background: #760807; }
  .teams i { display: flex; align-items: center; padding: 0 10px; background: #fff5df; color: #380606; font-style: normal; }
  .bar { margin-top: 22px; width: min(260px, 60vw); height: 10px; border: 2px solid #380606; background: #fff5df; overflow: hidden; }
  .bar::after { content: ""; display: block; height: 100%; width: 40%; background: #f4631e;
    animation: slide 1.1s ease-in-out infinite; }
  .hint { margin: 10px 0 0; font-size: 12px; font-weight: 600; color: #380606; }
  @keyframes float { 0%,100% { transform: translateY(-5px); } 50% { transform: translateY(5px); } }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
  @media (prefers-reduced-motion: reduce) { *, *::after { animation: none !important; } }
</style>
</head>
<body>
  <img class="ticket l" src="${origin}/svg/figma/ticketelemenkiri.svg" alt="" />
  <img class="ticket r" src="${origin}/svg/figma/ticketelementkanan.svg" alt="" />
  <div class="stack">
    <img class="logo" src="${origin}/images/logo-ibl.png" alt="IBL 2K26" />
    <h1>Score Detail</h1>
    <div class="teams"><b>${t1}</b><i>VS</i><b>${t2}</b></div>
    <div class="bar"></div>
    <p class="hint">Menyiapkan box score&hellip;</p>
  </div>
</body>
</html>`;
}
