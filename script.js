// ---------- tiny DOM helpers ----------
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ---------- state ----------
const state = { current: null, favs: [] };
let deepLinked = false; // guard to avoid random overwrite when an id is present

// ---------- elements ----------
const statusEl   = $("#status");
const favListEl  = $("#favList");
const favCountEl = $("#favCount");

// dialogs & toast
const shareDlg = $("#shareDialog");
const printDlg = $("#printDialog");
const toastEl  = $("#toast");
const dialogEl = $("#detailsDialog");

// search helpers
const resultsEl  = $("#results");
const searchForm = $("#searchForm");
const searchInput= $("#searchInput");
const randomBtn  = $("#randomBtn");
const datalist   = $("#nameSuggestions");
const resultCountEl = $("#resultCount");

// download favorites (HTML file)
const downloadBtn = $("#downloadFavs");

// ---------- helpers: dialog hygiene ----------
function closeAllDialogs(){
  [shareDlg, printDlg, dialogEl].forEach(d => { try{ d?.open && d.close(); }catch{} });
}

// ---------- keyboard shortcuts ----------
function isTypingTarget(el){ return (el && /^(input|textarea|select)$/i.test(el.tagName)) || el?.isContentEditable; }
window.addEventListener("keydown", (e) => {
  if (isTypingTarget(document.activeElement)) return;

  if (e.key === "Escape"){
    closeAllDialogs();
  } else if (e.key.toLowerCase() === "r"){
    if (!$("#pane-random").hidden) $("#newBtn")?.click();
    else { setTab("random"); $("#newBtn")?.click(); }
  } else if (e.key === "/" || e.key.toLowerCase() === "s"){
    e.preventDefault();
    setTab("search");
    $("#searchInput")?.focus();
  }
});

// ---------- tabs ----------
const tabs = $$(".tab");
tabs.forEach(btn => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
function setTab(name){
  tabs.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  $("#pane-random").hidden = name !== "random";
  $("#pane-search").hidden = name !== "search";
  status("");                    // clear status
  updateSaveButtons();           // keep Save/Saved correct when switching
  try { localStorage.setItem("cf:tab", name); } catch {}
}
let bootTab = "random";
try { bootTab = localStorage.getItem("cf:tab") || "random"; } catch {}
setTab(bootTab);

// ======== favorites helpers ========
function persistFavs(){ try{ localStorage.setItem("cf:favs", JSON.stringify(state.favs)); }catch{} }
function loadFavs(){ try{ state.favs = JSON.parse(localStorage.getItem("cf:favs") || "[]"); }catch{ state.favs = []; } }
function isSaved(id){ return state.favs.some(x => x.idDrink === id); }
function minify(d){
  const pairs = [];
  for(let i=1;i<=15;i++){
    const ing=d[`strIngredient${i}`], meas=d[`strMeasure${i}`];
    if(ing) pairs.push({ ing, meas: (meas||"").trim() });
  }
  return {
    idDrink:d.idDrink, strDrink:d.strDrink, strDrinkThumb:d.strDrinkThumb,
    strCategory:d.strCategory, strAlcoholic:d.strAlcoholic, strGlass:d.strGlass,
    pairs, strInstructions:d.strInstructions
  };
}
function dedupeAndCap(){
  const seen = new Set();
  state.favs = state.favs.filter(x => seen.has(x.idDrink) ? false : (seen.add(x.idDrink), true)).slice(0,20);
}
function setCurrent(drink){
  state.current = drink || null;
  updateSaveButtons();
}

// ---------- favorites UI ----------
loadFavs(); renderFavs();

const clearFavsBtn = $("#clearFavs");
let lastFavsSnapshot = null; // for undo (Clear all)

clearFavsBtn?.addEventListener("click", () => {
  if (!state.favs.length) return;

  lastFavsSnapshot = JSON.parse(JSON.stringify(state.favs));

  state.favs = [];
  persistFavs();
  renderFavs();
  updateSaveButtons();
  updateSearchSaveButtons();

  showActionToast({
    message: "Removed all saved drinks.",
    actionLabel: "Undo",
    ms: 3000,
    onAction: () => {
      if (!lastFavsSnapshot) return;
      state.favs = lastFavsSnapshot;
      lastFavsSnapshot = null;
      persistFavs();
      renderFavs();
      updateSaveButtons();
      updateSearchSaveButtons();
      showToast("Restored favorites.", 1500);
    }
  });
});

function renderFavs(){
  favListEl.innerHTML = "";
  favCountEl.textContent = String(state.favs.length);

  for(const f of state.favs){
    const li = document.createElement("li");
    li.className = "fav-item";
    // make each favorite item look like a "card" to Cypress
    li.setAttribute("data-testid", "cocktail-card");
    li.innerHTML = `
      <img class="fav-thumb" src="${f.strDrinkThumb}" alt="${f.strDrink}">
      <div class="grow fav-title" data-testid="cocktail-name">${f.strDrink}</div>
      <div class="fav-actions">
        <button class="btn btn-open" data-id="${f.idDrink}">Open</button>
        <button class="btn btn-remove" data-id="${f.idDrink}" data-testid="favorite-button">Remove</button>
      </div>
    `;
    favListEl.appendChild(li);
  }

  favListEl.querySelectorAll(".btn-open").forEach(btn => {
    btn.addEventListener("click", () => {
      const f = state.favs.find(x => x.idDrink === btn.dataset.id);
      if (!f) return;
      openDrink(f);
    });
  });
  // Single-remove with 3s Undo
  favListEl.querySelectorAll(".btn-remove").forEach(btn => {
    btn.addEventListener("click", () => removeFavWithUndo(btn.dataset.id));
  });
}

// Download favorites as an HTML file (no print dialog)
downloadBtn?.addEventListener("click", () => {
  if (!state.favs.length){
    showToast("No favorites to download.", 1800);
    return;
  }

  const makeSection = (f) => {
    // Build ingredient lines from saved pairs or fields
    const lines = [];
    if (Array.isArray(f.pairs) && f.pairs.length){
      f.pairs.forEach(p => lines.push([p.meas, p.ing].filter(Boolean).join(" ").trim()));
    } else {
      for(let i=1;i<=15;i++){
        const ing=f[`strIngredient${i}`], meas=f[`strMeasure${i}`];
        if(ing){ lines.push(meas ? `${(meas||"").trim()} ${ing}`.trim() : ing); }
      }
    }
    const meta = [f.strCategory,f.strAlcoholic,f.strGlass].filter(Boolean).join(" • ");
    return `
      <section class="recipe">
        <div class="hdr">
          <img src="${f.strDrinkThumb}" alt="${escapeHtml(f.strDrink||"Drink")}">
          <div>
            <h2>${escapeHtml(f.strDrink||"")}</h2>
            <div class="meta">${escapeHtml(meta)}</div>
          </div>
        </div>
        <div class="cols">
          <div class="box">
            <h3>Ingredients</h3>
            <ul>${lines.map(i=>`<li>${escapeHtml(i)}</li>`).join("")}</ul>
          </div>
          <div class="box">
            <h3>Instructions</h3>
            <p>${escapeHtml(f.strInstructions||"—")}</p>
          </div>
        </div>
      </section>
    `;
  };

  const html = `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Cocktail Finder — Favorites</title>
  <style>
    body{font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111;background:#fff;margin:0;padding:16px}
    .sheet{max-width:900px;margin:0 auto}
    header{display:flex;justify-content:space-between;align-items:center;margin:0 0 10px}
    header h1{font:700 26px/1.2 "Playfair Display",Georgia,serif;margin:0}
    header .muted{color:#64748b}
    .recipe{border-top:1px solid #e5e7eb;padding-top:10px;margin-top:10px}
    .hdr{display:grid;grid-template-columns:160px 1fr;gap:14px;align-items:center}
    .hdr img{width:100%;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.12)}
    .hdr h2{font:700 22px/1.2 "Playfair Display",Georgia,serif;margin:.1rem 0 .25rem}
    .meta{color:#475569}
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px}
    .box{background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:10px}
    ul{margin:.25rem 0 .5rem 1.25rem}
    @media (max-width:700px){ .hdr{grid-template-columns:1fr} .cols{grid-template-columns:1fr} }
  </style></head><body>
  <div class="sheet">
    <header>
      <h1>Favorites</h1>
      <div class="muted">${new Date().toLocaleDateString()}</div>
    </header>
    ${state.favs.map(makeSection).join("")}
    <p class="muted" style="text-align:center;margin-top:12mm">Exported from Cocktail Finder</p>
  </div>
  </body></html>`;

  try{
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const stamp= new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `cocktail-favorites-${stamp}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Downloading favorites…");
  }catch(e){
    console.error(e);
    showToast("Unable to download. Check pop-up/download settings.", 2500);
  }
});

function removeFavWithUndo(id){
  const idx = state.favs.findIndex(x => x.idDrink === id);
  if (idx < 0) return;

  const removed = state.favs.splice(idx, 1)[0];
  persistFavs();
  renderFavs();
  if (state.current && state.current.idDrink === id) updateSaveButtons();
  updateSearchSaveButtons();

  showActionToast({
    message: "Removed 1 saved drink.",
    actionLabel: "Undo",
    ms: 3000,
    onAction: () => {
      state.favs.splice(Math.min(idx, state.favs.length), 0, removed);
      persistFavs();
      renderFavs();
      if (state.current && state.current.idDrink === removed.idDrink) updateSaveButtons();
      updateSearchSaveButtons();
      showToast("Restored 1 saved drink.", 1500);
    }
  });
}

function toggleSave(drink){
  if(!drink) return;
  const i = state.favs.findIndex(x => x.idDrink === drink.idDrink);
  if(i >= 0) state.favs.splice(i,1);
  else state.favs.unshift(minify(drink));
  dedupeAndCap();
  persistFavs();
  renderFavs();
  updateSaveButtons();
  updateSearchSaveButtons();
  showToast(i >= 0 ? "Removed from favorites." : "Saved to favorites.");
}

// ================= utilities =================
function ingredientsList(d){
  const list = [];
  for(let i=1;i<=15;i++){
    const ing=d[`strIngredient${i}`], meas=d[`strMeasure${i}`];
    if(ing){ list.push(meas ? `${(meas||"").trim()} ${ing}`.trim() : ing); }
  }
  return list;
}
function copyRecipeText(d){
  return [
    `${d.strDrink}`,
    `${[d.strCategory,d.strAlcoholic,d.strGlass].filter(Boolean).join(" • ")}`,
    ``,
    `Ingredients:`, ...ingredientsList(d).map(x=>` - ${x}`),
    ``,
    `Instructions:`, d.strInstructions || "—"
  ].join("\r\n");
}

// robust clipboard (covers iOS Safari and HTTP)
async function copyText(text){
  try{
    if (navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    showToast("Copied to clipboard.");
  }catch{
    status("Unable to copy. You can select and copy manually.");
  }
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

// ---------- status + toast ----------
function status(text=""){ statusEl.textContent = text; if(!text) hideToast(); }
let toastTimer;

function showToast(msg, ms=2000){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, ms);
}
function hideToast(){ toastEl.classList.remove("show"); toastEl.innerHTML = ""; }

// Toast with action (Undo)
function showActionToast({ message, actionLabel="Undo", onAction, ms=3000 }){
  toastEl.innerHTML = `
    <span>${message}</span>
    <button id="toastActionBtn" class="btn-ghost small" type="button">${actionLabel}</button>
  `;
  toastEl.classList.add("show");

  const btn = $("#toastActionBtn", toastEl);
  let used = false;
  const cleanup = () => { if (used) return; used = true; hideToast(); };
  btn?.addEventListener("click", () => {
    if (used) return;
    used = true;
    try { onAction?.(); } finally { hideToast(); }
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(cleanup, ms);
}

// ================= RANDOM MODE =================
const cardEl  = $("#card");
const imgEl   = $("#thumb");
const titleEl = $("#title");
const metaEl  = $("#meta");
const ingList = $("#ingredients");
const instrEl = $("#instructions");

$("#newBtn").addEventListener("click", loadRandom);
$("#saveBtn").addEventListener("click", () => state.current && toggleSave(state.current));
$("#copyBtn").addEventListener("click", () => state.current && copyText(copyRecipeText(state.current)));
$("#shareBtn").addEventListener("click", () => state.current && shareCurrent(state.current));
$("#printBtn").addEventListener("click", () => state.current && printCurrent(state.current));

async function loadRandom(){
  if (deepLinked && !state.current) {
    status("Couldn’t load that drink. Try again or tap New Drink.");
    return;
  }
  status("Loading a delicious idea…");
  cardEl.hidden = true;
  try{
    const res  = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const d    = data.drinks?.[0]; if(!d) throw new Error("No drink");
    renderRandomCard(d);
    status("Press “New Drink” to shuffle again.");
  }catch(err){
    console.error(err);
    status("Couldn’t load a drink. Please try again.");
  }
}

function setUrlId(id){
  const url = new URL(location.href);
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  history.replaceState(null, "", url);
}

function renderRandomCard(d){
  imgEl.src = d.strDrinkThumb; imgEl.alt = d.strDrink || "Drink";
  titleEl.textContent = d.strDrink || "—";
  metaEl.textContent  = [d.strCategory,d.strAlcoholic,d.strGlass].filter(Boolean).join(" • ");
  instrEl.textContent = d.strInstructions || "—";
  ingList.innerHTML = "";
  for(const item of ingredientsList(d)){
    const li = document.createElement("li"); li.textContent = item; ingList.appendChild(li);
  }
  cardEl.hidden = false;
  setCurrent(d);
  setUrlId(d.idDrink);
}

function updateSaveButtons(){
  const saved = state.current && isSaved(state.current.idDrink);
  const mainBtn = $("#saveBtn");
  const dlgBtn  = $("#dSaveBtn");
  const label   = saved ? "⭐ Saved" : "⭐ Save";
  if (mainBtn) mainBtn.textContent = label;
  if (dlgBtn)  dlgBtn.textContent  = label;
}

// ================= SEARCH MODE =================
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = searchInput.value.trim(); if(!term) return;
  await doSearch(term);
});

// load last search term into input on boot
try {
  const last = localStorage.getItem("cf:lastTerm");
  if (last) searchInput.value = last;
} catch {}

// Run a search if the user chooses a suggestion from the datalist
function isFromSuggestions(term){
  return Array.from(datalist.options).some(
    opt => opt.value.trim().toLowerCase() === term.trim().toLowerCase()
  );
}
searchInput.addEventListener("change", async () => {
  const term = searchInput.value.trim();
  if (!term) return;
  if (isFromSuggestions(term)) await doSearch(term);
});

randomBtn.addEventListener("click", async () => {
  try{
    const res  = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const arr = data.drinks ? [data.drinks[0]] : [];
    renderSearchCards(arr);
    resultCountEl.textContent = arr.length ? `Results: ${arr.length}` : "Results: 0";
  }catch(err){
    console.error(err);
    resultCountEl.textContent = "";
    status("Couldn’t load a random pick. Try again.");
  }
});

// simple typeahead
searchInput.addEventListener("input", async (e) => {
  const v = e.target.value.trim();
  if (!v) { datalist.innerHTML=""; return; }
  try{
    const res  = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(v)}`);
    const data = await res.json();
    const items = (data.drinks||[]).slice(0,12);
    datalist.innerHTML = items.map(d => `<option value="${d.strDrink}"></option>`).join("");
  }catch{}
});

async function doSearch(term){
  status(`Searching for “${term}”…`);
  try{
    const res  = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`);
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const items = data.drinks || [];
    renderSearchCards(items);
    resultCountEl.textContent = items.length ? `Results: ${items.length}` : `Results: 0`;
    try { localStorage.setItem("cf:lastTerm", term); } catch {}
    status(items.length ? "" : "No results. Try another search.");
  }catch(err){
    console.error(err);
    resultCountEl.textContent = "";
    status("Something went wrong. Please try again.");
  }
}

function renderSearchCards(items){
  resultsEl.innerHTML = "";
  if(!items.length){ resultsEl.innerHTML = `<p class="muted">No results.</p>`; return; }

  const frag = document.createDocumentFragment();
  for(const d of items){
    const card = document.createElement("article");
    card.className="card-sm";
    // make search result look like a cocktail card to Cypress
    card.setAttribute("data-testid", "cocktail-card");
    card.innerHTML = `
      <img src="${d.strDrinkThumb}" alt="${d.strDrink}"/>
      <div class="pad">
        <h3 class="card-title" style="margin:0 0 .25rem" data-testid="cocktail-name">${d.strDrink}</h3>
        <p class="muted">${[d.strCategory,d.strAlcoholic].filter(Boolean).join(" • ")}</p>
        <div class="inline-actions">
          <button class="btn open">Open</button>
          <button class="btn save" data-id="${d.idDrink}" data-testid="favorite-button">⭐ Save</button>
        </div>
      </div>
    `;
    $(".open", card).onclick = () => openDetails(d);
    $(".save", card).onclick = () => { toggleSave(d); updateSearchSaveButtons(); };
    frag.appendChild(card);
  }
  resultsEl.appendChild(frag);
  updateSearchSaveButtons();
}
function updateSearchSaveButtons(){
  $$("#results .card-sm .btn.save").forEach(btn => {
    const id = btn.dataset.id;
    btn.textContent = isSaved(id) ? "⭐ Saved" : "⭐ Save";
  });
}

// ---------- Details dialog ----------
$("#closeDialog").addEventListener("click", () => dialogEl.close());
$("#dSaveBtn").addEventListener("click", () => state.current && toggleSave(state.current));
$("#dCopyBtn").addEventListener("click", () => state.current && copyText(copyRecipeText(state.current)));
$("#dShareBtn").addEventListener("click", () => state.current && shareCurrent(state.current));
$("#dPrintBtn").addEventListener("click", () => state.current && printCurrent(state.current));

function openDetails(d){
  setCurrent(d);
  $("#dTitle").textContent = d.strDrink || "—";
  $("#dImg").src = d.strDrinkThumb; $("#dImg").alt = d.strDrink || "Drink";
  $("#dMeta").textContent = [d.strCategory,d.strAlcoholic,d.strGlass].filter(Boolean).join(" • ");
  const ul = $("#dIngredients"); ul.innerHTML = "";
  for(const item of ingredientsList(d)){ const li=document.createElement("li"); li.textContent=item; ul.appendChild(li); }
  $("#dInstructions").textContent = d.strInstructions || "—";
  try{
    if(typeof dialogEl.showModal === "function") dialogEl.showModal();
    else dialogEl.show();
  }catch(e){
    dialogEl.setAttribute("open",""); // ensure visible
  }
  updateSaveButtons();
  setUrlId(d.idDrink);
}

function openDrink(f){
  let d = { ...f };
  if (f.pairs){
    f.pairs.forEach((p,i)=>{
      d[`strIngredient${i+1}`] = p.ing;
      d[`strMeasure${i+1}`]    = p.meas;
    });
  }
  if(!$("#pane-random").hidden){
    renderRandomCard(d);
  }else{
    openDetails(d);
  }
  setUrlId(d.idDrink);
}

// ---------- Deep link boot ----------
function shareUrlFor(d){
  const url = new URL(location.href);
  url.searchParams.set("id", d.idDrink);
  return url.toString();
}

async function boot(){
  const id = new URL(location.href).searchParams.get("id");
  if (id){
    deepLinked = true;
    try{
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`);
      if(!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const d = data.drinks?.[0];
      if (d){
        setTab("random");
        renderRandomCard(d);
        return;
      }
      status("Couldn’t load that drink. Try again or tap New Drink.");
      return;
    }catch(e){
      console.warn("Deep link failed", e);
      status("Couldn’t load that drink. Try again or tap New Drink.");
      return;
    }
  }
  await loadRandom();
}
boot();

// ---------- Share (multi-option; no 'Copy link') ----------
$("#shareClose")?.addEventListener("click", ()=> shareDlg.close());

function shareTargets(d){
  const url = shareUrlFor(d);
  return {
    email: `mailto:?subject=${encodeURIComponent(d.strDrink + " — Cocktail Finder")}&body=${encodeURIComponent(copyRecipeText(d)+"\r\n\r\n"+url)}`,
    sms:   `sms:?&body=${encodeURIComponent(d.strDrink + " — " + url)}`,
    wa:    `https://wa.me/?text=${encodeURIComponent(d.strDrink + " — " + url)}`,
    tg:    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(d.strDrink)}`,
    x:     `https://twitter.com/intent/tweet?text=${encodeURIComponent(d.strDrink)}&url=${encodeURIComponent(url)}`,
    fb:    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };
}

$("#shareEmail")?.addEventListener("click", ()=>{ if(!state.current) return; location.href = shareTargets(state.current).email; shareDlg.close(); });
$("#shareSMS")?.addEventListener("click",   ()=>{ if(!state.current) return; location.href = shareTargets(state.current).sms;   shareDlg.close(); });
$("#shareWhatsApp")?.addEventListener("click", ()=>{ if(!state.current) return; window.open(shareTargets(state.current).wa, "_blank"); shareDlg.close(); });
$("#shareTelegram")?.addEventListener("click", ()=>{ if(!state.current) return; window.open(shareTargets(state.current).tg, "_blank"); shareDlg.close(); });
$("#shareX")?.addEventListener("click", ()=>{ if(!state.current) return; window.open(shareTargets(state.current).x, "_blank"); shareDlg.close(); });
$("#shareFB")?.addEventListener("click", ()=>{ if(!state.current) return; window.open(shareTargets(state.current).fb, "_blank"); shareDlg.close(); });

function openShareSheet(d){
  const url = shareUrlFor(d);
  const text = copyRecipeText(d);
  if (navigator.share){
    navigator.share({ title: `${d.strDrink} — Cocktail Finder`, text, url }).catch(()=>{});
    return;
  }
  $("#sharePreview").textContent = url;
  try{
    shareDlg.showModal();
  }catch{
    closeAllDialogs();
    try{ shareDlg.showModal(); }catch{ shareDlg.setAttribute("open",""); }
  }
}

function shareCurrent(d){
  if (dialogEl.open) dialogEl.close(); // avoid double modal
  openShareSheet(d);
}

// ---------- Print ----------
$("#pClose")?.addEventListener("click", ()=> printDlg.close());
$("#pPrint")?.addEventListener("click", ()=>{
  const d = state.current; if(!d) return;
  const ings = ingredientsList(d);
  const html = `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${d.strDrink} — Print</title>
  <style>
    @page{size:Letter;margin:14mm}
    body{font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;color:#111}
    .sheet{max-width:900px;margin:0 auto}
    h1{font:700 28px/1.2 "Playfair Display",Georgia,serif;margin:0 0 6px}
    .meta{color:#475569;margin-bottom:10px}
    .grid{display:grid;grid-template-columns:320px 1fr;gap:12mm;align-items:start}
    img{width:100%;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.15)}
    .box{background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:6mm}
    @media (max-width:620px){.grid{grid-template-columns:1fr}}
  </style></head><body>
  <div class="sheet">
    <h1>${escapeHtml(d.strDrink||"")}</h1>
    <div class="meta">${escapeHtml([d.strCategory,d.strAlcoholic,d.strGlass].filter(Boolean).join(" • "))}</div>
    <div class="grid">
      <img src="${d.strDrinkThumb}" alt="${escapeHtml(d.strDrink||"Drink")}">
      <div class="box">
        <h2>Ingredients</h2>
        <ul>${ings.map(i=>`<li>${escapeHtml(i)}</li>`).join("")}</ul>
        <h2>Instructions</h2>
        <p>${escapeHtml(d.strInstructions||"—")}</p>
      </div>
    </div>
    <p style="text-align:center;color:#64748b;margin-top:10mm">Printed from Cocktail Finder</p>
  </div>
  <script>onload=()=>setTimeout(()=>print(),50)<\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html); w.document.close();
});

function printCurrent(d){
  $("#pTitle").textContent = d.strDrink || "Print";
  $("#pMeta").textContent  = [d.strCategory,d.strAlcoholic,d.strGlass].filter(Boolean).join(" • ");
  $("#pImg").src = d.strDrinkThumb; $("#pImg").alt = d.strDrink || "Drink";
  const ul = $("#pIngredients"); ul.innerHTML = ingredientsList(d).map(i=>`<li>${escapeHtml(i)}</li>`).join("");
  $("#pInstructions").textContent = d.strInstructions || "—";
  try{
    printDlg.showModal();
  }catch{
    closeAllDialogs();
    try{ printDlg.showModal(); }catch{ printDlg.setAttribute("open",""); }
  }
}
