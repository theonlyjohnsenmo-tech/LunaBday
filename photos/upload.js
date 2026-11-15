// Guest uploads straight from this page into a Google Drive folder, through a small
// Google Apps Script (guest-upload-script/Code.gs). Paste its Web app URL below.
// While it is "", the Upload and Guest photos buttons keep opening the NAS pages.
const UPLOAD_API = "https://script.google.com/macros/s/AKfycbyipgHLcWhnCGRCOA61YKqQtdNufr-Xepg3SBdacPSKsb5HkUlSrd3C0t2bMO7OzeNn/exec";

(() => {
  if (!UPLOAD_API) return;
  const NAS_GUESTS = LINKS.guests; // uploads made on the NAS during the party
  const MAX_VIDEO = 30 * 1024 * 1024, MAX_FILES = 30, LONG_EDGE = 2560;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const thumbUrl = (id, w) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

  document.head.insertAdjacentHTML("beforeend", `<style>
.sheet { position: fixed; inset: 0; z-index: 70; display: none; place-items: end center; background: rgba(40,10,35,.45); backdrop-filter: blur(4px); }
.sheet.on { display: grid; }
@media (min-width: 700px) { .sheet { place-items: center; } }
.card { width: min(100%, 520px); max-height: 92dvh; overflow-y: auto; background: #fff; border-radius: 28px 28px 0 0; padding: 22px 22px 26px; box-shadow: 0 -10px 40px rgba(40,10,35,.3); animation: up .3s ease; }
@media (min-width: 700px) { .card { border-radius: 28px; } }
@keyframes up { from { transform: translateY(30px); opacity: 0; } }
.card header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.card h2 { font-family: Satisfy, cursive; font-weight: 400; font-size: 38px; color: var(--plum); margin: 0 auto 0 0; line-height: 1.1; }
.card .x { width: 38px; height: 38px; border-radius: 50%; border: 0; background: var(--blush); color: var(--plum); font-size: 18px; }
.card p.sub { margin: 0 0 16px; font-weight: 600; color: var(--soft); font-size: 15px; }
.field { display: block; text-align: left; font-weight: 700; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--soft); margin-bottom: 14px; }
.field input { display: block; width: 100%; margin-top: 6px; padding: 13px 16px; border-radius: 14px; border: 2px solid var(--rose); font: 600 16px Quicksand, sans-serif; color: var(--ink); text-transform: none; letter-spacing: 0; }
.field input:focus { outline: none; border-color: var(--plum); }
.drop { display: grid; place-items: center; text-align: center; gap: 6px; padding: 26px 16px; border: 2.5px dashed var(--rose); border-radius: 20px; background: var(--blush); color: var(--plum); font-weight: 700; cursor: pointer; }
.drop.over { background: #f6dcea; border-color: var(--plum); }
.drop .big { font-size: 34px; line-height: 1; }
.drop small { font-weight: 600; color: var(--soft); }
.files { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px; margin: 16px 0 6px; }
.file { position: relative; aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: var(--blush); }
.file img, .file video { width: 100%; height: 100%; object-fit: cover; }
.file .rm { position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%; border: 0; background: rgba(40,10,35,.7); color: #fff; font-size: 12px; }
.file .bar { position: absolute; left: 8px; right: 8px; bottom: 8px; height: 6px; border-radius: 6px; background: rgba(255,255,255,.75); overflow: hidden; display: none; }
.file .bar i { display: block; height: 100%; width: 0; background: var(--plum); transition: width .3s ease-out; }
.busy .file .bar { display: block; }
.busy .file .rm { display: none; }
.file.ok::after, .file.bad::after { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-size: 30px; font-weight: 700; }
.file.ok::after { content: "✓"; background: rgba(142,47,106,.55); }
.file.bad::after { content: "!"; background: rgba(180,40,60,.6); }
.go { margin-top: 14px; }
.go:disabled { opacity: .45; pointer-events: none; }
.status { text-align: center; font-weight: 700; color: var(--soft); font-size: 14px; margin: 10px 0 0; min-height: 1.4em; }
.status.err { color: #b4283c; }
.updone { text-align: center; padding: 10px 0 4px; }
.updone .big { font-size: 54px; }
.updone h3 { font-family: Satisfy, cursive; font-weight: 400; font-size: 40px; color: var(--plum); margin: 4px 0; }
.updone p { font-weight: 600; margin: 0 0 18px; }
.updone .btn + .btn { margin-top: 10px; }
.gg { position: fixed; inset: 0; z-index: 40; overflow-y: auto; background: var(--blush); padding: 16px 16px 40px; display: none; }
.gg.on { display: block; }
.gg header { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; max-width: 1200px; margin: 0 auto 14px; }
.gg header b { font-family: Satisfy, cursive; font-weight: 400; font-size: 30px; color: var(--plum); margin-right: auto; }
.gg header .btn { width: auto; padding: 10px 18px; font-size: 15px; }
.gg .g { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; max-width: 1200px; margin: 0 auto; }
.gg .g button { position: relative; padding: 0; border: 0; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f1e3ec; }
.gg .g img { width: 100%; height: 100%; object-fit: cover; }
.gg .by { position: absolute; left: 6px; bottom: 6px; max-width: calc(100% - 12px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(255,255,255,.9); color: var(--plum); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; }
.gg .vid { position: absolute; top: 6px; right: 6px; background: rgba(40,10,35,.7); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; }
.gg .empty { grid-column: 1 / -1; text-align: center; font-weight: 600; color: var(--soft); padding: 40px 0; }
.gv { position: fixed; inset: 0; z-index: 65; display: none; grid-template-rows: auto minmax(0, 1fr) auto; grid-template-columns: minmax(0, 1fr); background: rgba(20,6,19,.96); color: #fff; }
.gv.on { display: grid; }
.petal { position: fixed; z-index: 75; top: -30px; width: 22px; height: 22px; pointer-events: none; animation: fall 2.6s ease-in forwards; }
@keyframes fall { to { transform: translateY(110vh) rotate(540deg); opacity: .3; } }
</style>`);

  document.body.insertAdjacentHTML("beforeend", `
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="upTitle"><div class="card" id="card"></div></div>
<div class="gg" id="gg" role="dialog" aria-modal="true" aria-label="Photos from our guests">
  <header><b>Photos from our guests</b><button class="btn main" id="ggUp" type="button">+ Upload</button><button class="btn" id="ggX" type="button">Back</button></header>
  <div class="g" id="ggG"></div>
  <p style="text-align:center;margin-top:22px"><a class="home" href="${esc(NAS_GUESTS)}" target="_blank" rel="noopener">Photos shared during the party (NAS album)</a></p>
</div>
<div class="gv" id="gv" role="dialog" aria-modal="true" aria-label="Guest photo">
  <div class="lt"><span id="gvN"></span><a class="ib" id="gvDl" target="_blank" rel="noopener" aria-label="Download photo">⤓</a><button class="ib" id="gvX" type="button" aria-label="Close">✕</button></div>
  <div class="lm" id="gvM"><img id="gvImg" src="img/thumb/01.jpg" alt="Guest photo"><button class="ib nav p" id="gvP" type="button" aria-label="Previous">‹</button><button class="ib nav n" id="gvNx" type="button" aria-label="Next">›</button></div>
  <div class="lc" id="gvC"></div>
</div>`);

  const sheet = document.getElementById("sheet"), card = document.getElementById("card");
  let picked = [], sending = false;

  /* ---------- Upload sheet ---------- */
  function form() {
    card.classList.remove("busy");
    card.innerHTML = `
      <header><h2 id="upTitle">Share your photos</h2><button class="x" id="upX" type="button" aria-label="Close">✕</button></header>
      <p class="sub">They go straight into Luna's album. No app, no login.</p>
      <label class="field">Your name (optional)<input id="upName" autocomplete="name" maxlength="40" placeholder="e.g. Tita Grace"></label>
      <label class="drop" id="drop"><span class="big">📷</span>Tap to pick photos or videos<small>or drag them here · up to ${MAX_FILES} at a time · videos up to 30 MB</small>
        <input id="upFiles" type="file" accept="image/*,video/*" multiple hidden></label>
      <div class="files" id="files"></div>
      <button class="btn main go" id="upGo" type="button" disabled>Upload</button>
      <p class="status" id="upStatus" aria-live="polite"></p>`;
    try { document.getElementById("upName").value = localStorage.getItem("lunaName") || ""; } catch (e) {}
    document.getElementById("upX").onclick = close;
    const input = document.getElementById("upFiles"), drop = document.getElementById("drop");
    input.onchange = () => { add(input.files); input.value = ""; };
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); add(e.dataTransfer.files); });
    document.getElementById("upGo").onclick = upload;
    list();
  }
  function add(files) {
    let skipped = 0;
    for (const f of files) {
      if (!/^(image|video)\//.test(f.type) || picked.length >= MAX_FILES) { skipped++; continue; }
      if (f.type.startsWith("video") && f.size > MAX_VIDEO) { skipped++; continue; }
      picked.push({ f, url: URL.createObjectURL(f), state: "" });
    }
    list();
    const st = document.getElementById("upStatus");
    st.className = "status" + (skipped ? " err" : "");
    st.textContent = skipped ? `${skipped} file${skipped > 1 ? "s were" : " was"} skipped: only photos and videos under 30 MB, up to ${MAX_FILES} at a time.` : "";
  }
  function list() {
    const box = document.getElementById("files");
    box.innerHTML = picked.map((p, k) => `<div class="file ${p.state}" data-i="${k}">${p.f.type.startsWith("video") ? `<video src="${p.url}" muted playsinline></video>` : `<img src="${p.url}" alt="">`}<button class="rm" type="button" aria-label="Remove">✕</button><span class="bar"><i></i></span></div>`).join("");
    box.onclick = (e) => { const b = e.target.closest(".rm"); if (b && !sending) { picked.splice(+b.parentElement.dataset.i, 1); list(); } };
    const left = picked.filter((p) => p.state !== "ok").length, go = document.getElementById("upGo");
    go.disabled = !left;
    go.textContent = left ? `Upload ${left} ${left === 1 ? "file" : "files"}` : "Upload";
  }

  // Photos are shrunk to 2560 px on the phone first, so they upload fast on mobile data.
  async function prepare(f) {
    if (f.type.startsWith("image") && !/gif|svg/.test(f.type)) {
      try {
        const bmp = await createImageBitmap(f, { imageOrientation: "from-image" });
        const k = Math.min(1, LONG_EDGE / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.88));
        if (blob) return { blob, mime: "image/jpeg", name: f.name.replace(/\.[^.]+$/, "") + ".jpg" };
      } catch (e) { /* the browser cannot read this format: send it as it is */ }
    }
    return { blob: f, mime: f.type, name: f.name };
  }
  const base64 = (blob) => new Promise((ok, bad) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = bad; r.readAsDataURL(blob); });

  async function sendOne(p, tile, name) {
    const bar = tile.querySelector(".bar i");
    bar.style.width = "12%";
    const x = await prepare(p.f);
    const data = await base64(x.blob);
    // fetch has no upload progress: ease the bar toward 90% for the expected time.
    bar.style.transition = `width ${Math.min(40, 2 + x.blob.size / 250000)}s ease-out`; bar.style.width = "90%";
    // A text/plain body keeps this a simple request, which Apps Script accepts from any site.
    const r = await fetch(UPLOAD_API, { method: "POST", body: JSON.stringify({ name, filename: x.name, mime: x.mime, data }) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Upload failed");
    bar.style.transition = "width .3s"; bar.style.width = "100%";
  }

  async function upload() {
    const name = (document.getElementById("upName").value || "").trim().slice(0, 40);
    try { localStorage.setItem("lunaName", name); } catch (e) {}
    const st = document.getElementById("upStatus");
    const todo = picked.filter((p) => p.state !== "ok");
    if (!todo.length) return;
    sending = true; card.classList.add("busy"); document.getElementById("upGo").disabled = true;
    todo.forEach((p) => (p.state = ""));
    let done = 0, failed = 0, next = 0;
    const tiles = () => [...document.getElementById("files").children];
    st.className = "status"; st.textContent = `Uploading… 0 of ${todo.length}`;
    async function worker() {
      while (next < todo.length) {
        const p = todo[next++], tile = tiles()[picked.indexOf(p)];
        try { await sendOne(p, tile, name); p.state = "ok"; done++; }
        catch (e) { p.state = "bad"; failed++; }
        tile.classList.add(p.state);
        st.textContent = `Uploading… ${done + failed} of ${todo.length}`;
      }
    }
    await Promise.all([worker(), worker()]);
    sending = false;
    if (!failed) return finish(name, done);
    card.classList.remove("busy"); list();
    st.className = "status err";
    st.textContent = `${done} uploaded, ${failed} did not go through. Check your connection and tap Upload to try those again.`;
  }

  function finish(name, n) {
    picked = [];
    card.classList.remove("busy");
    card.innerHTML = `<div class="updone"><div class="big">🌼</div><h3>Thank you${name ? ", " + esc(name) : ""}!</h3>
      <p>${n} ${n === 1 ? "file was" : "files were"} added to Luna's album.</p>
      <button class="btn main" id="upMore" type="button">Share more photos</button>
      <button class="btn" id="upSee" type="button">See guest photos</button></div>`;
    document.getElementById("upMore").onclick = form;
    document.getElementById("upSee").onclick = () => { close(); openGuests(); };
    petals();
    loadGuests();
  }
  function petals() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let k = 0; k < 24; k++) {
      const el = document.createElement("div"); el.className = "petal";
      el.style.left = Math.random() * 100 + "vw"; el.style.animationDelay = Math.random() * .8 + "s";
      el.innerHTML = `<svg viewBox="-50 -50 100 100"><g fill="${["#fff", "#ffd6e7", "#e7d6ff"][k % 3]}">${[...Array(8)].map((_, j) => `<ellipse rx="13" ry="30" cy="-24" transform="rotate(${j * 45})"/>`).join("")}</g><circle r="14" fill="#f5c04e"/></svg>`;
      document.body.appendChild(el); setTimeout(() => el.remove(), 3600);
    }
  }
  function openUpload() { if (!sending) form(); sheet.classList.add("on"); clearTimeout(timer); }
  function close() { sheet.classList.remove("on"); }
  sheet.addEventListener("click", (e) => { if (e.target === sheet && !sending) close(); });

  /* ---------- Photos from our guests ---------- */
  let GUESTS = [], gi = 0;
  const gg = document.getElementById("gg"), gv = document.getElementById("gv");
  async function loadGuests() {
    try {
      const j = await (await fetch(UPLOAD_API)).json();
      GUESTS = j.ok ? j.files : [];
    } catch (e) { GUESTS = null; }
    const n = GUESTS ? GUESTS.length : 0;
    document.querySelectorAll('[data-link="guests"] small').forEach((s) => (s.textContent = n ? `${n} shared so far` : "everything you shared"));
    drawGuests();
  }
  function drawGuests() {
    const g = document.getElementById("ggG");
    if (GUESTS === null) { g.innerHTML = `<p class="empty">Could not load the guest photos. Please try again in a moment.</p>`; return; }
    g.innerHTML = GUESTS.length ? GUESTS.map((p, k) => `<button type="button" data-i="${k}" aria-label="Open guest photo ${k + 1}"><img src="${thumbUrl(p.id, 500)}" alt="" loading="lazy" onerror="this.style.opacity=0">${p.mime.startsWith("video") ? '<span class="vid">▶ Video</span>' : ""}${p.by ? `<span class="by">${esc(p.by)}</span>` : ""}</button>`).join("")
      : `<p class="empty">No guest photos yet. Be the first to share!</p>`;
  }
  function openGuests() { gg.classList.add("on"); clearTimeout(timer); loadGuests(); document.getElementById("ggX").focus(); }
  document.getElementById("ggX").onclick = () => { gg.classList.remove("on"); draw(); };
  document.getElementById("ggUp").onclick = openUpload;
  document.getElementById("ggG").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const p = GUESTS[+b.dataset.i];
    if (p.mime.startsWith("video")) { window.open(`https://drive.google.com/file/d/${p.id}/view`, "_blank", "noopener"); return; }
    gi = +b.dataset.i; gv.classList.add("on"); drawGv();
  };
  const photosOnly = () => GUESTS.filter((p) => !p.mime.startsWith("video"));
  function drawGv() {
    const p = GUESTS[gi];
    document.getElementById("gvImg").src = thumbUrl(p.id, 2000);
    document.getElementById("gvN").textContent = `${photosOnly().indexOf(p) + 1} / ${photosOnly().length}`;
    document.getElementById("gvC").textContent = p.by ? `Shared by ${p.by}` : "Bella Luna's 7th Birthday";
    document.getElementById("gvDl").href = `https://drive.google.com/uc?export=download&id=${p.id}`;
  }
  function stepGv(d) { do { gi = (gi + d + GUESTS.length) % GUESTS.length; } while (GUESTS[gi].mime.startsWith("video")); drawGv(); }
  document.getElementById("gvX").onclick = () => gv.classList.remove("on");
  document.getElementById("gvP").onclick = () => stepGv(-1);
  document.getElementById("gvNx").onclick = () => stepGv(1);
  document.getElementById("gvM").addEventListener("click", (e) => { if (e.target.id === "gvM") gv.classList.remove("on"); });
  swipe(document.getElementById("gvM"), stepGv);

  document.addEventListener("keydown", (e) => {
    if (gv.classList.contains("on")) { e.stopImmediatePropagation(); if (e.key === "Escape") gv.classList.remove("on"); if (e.key === "ArrowLeft") stepGv(-1); if (e.key === "ArrowRight") stepGv(1); return; }
    if (sheet.classList.contains("on")) { e.stopImmediatePropagation(); if (e.key === "Escape" && !sending) close(); return; }
    if (gg.classList.contains("on")) { e.stopImmediatePropagation(); if (e.key === "Escape") document.getElementById("ggX").click(); }
  }, true);

  // Take over the Upload and Guest photos buttons.
  document.querySelectorAll('[data-link="upload"]').forEach((a) => { a.removeAttribute("target"); a.href = "#upload"; a.addEventListener("click", (e) => { e.preventDefault(); openUpload(); }); });
  document.querySelectorAll('[data-link="guests"]').forEach((a) => { a.removeAttribute("target"); a.href = "#guests"; a.addEventListener("click", (e) => { e.preventDefault(); openGuests(); }); });
  if (location.hash === "#upload") openUpload();
  loadGuests();
})();
