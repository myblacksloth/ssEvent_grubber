/*
 * ssEvent_grubber
 * Copyright (C) 2026 Antonio Maulucci (https://github.com/myblacksloth)
 *
 * Questo programma è software libero: puoi ridistribuirlo e/o modificarlo
 * secondo i termini della GNU Affero General Public License come pubblicata
 * dalla Free Software Foundation, versione 3 della Licenza.
 *
 * Questo programma è distribuito nella speranza che sia utile, ma SENZA
 * ALCUNA GARANZIA; senza neppure la garanzia implicita di COMMERCIABILITÀ
 * o di IDONEITÀ PER UN PARTICOLARE SCOPO. Vedi la GNU Affero General Public License
 * per maggiori dettagli.
 *
 * Dovresti aver ricevuto una copia della GNU Affero General Public License
 * insieme a questo programma. In caso contrario, vedi <https://www.gnu.org/licenses/>.
 */

// modificare le rotte dove indicato editqui

// Stato e UI per la tracciatura eventi
const sseEvents = []; // lista di mappe { orario, evento, endpoint }
const pollingEvents = []; // lista di mappe { orario, evento, endpoint }
const allResponses = []; // lista di mappe { orario, evento, endpoint, tipo }
let currentView = "sse";

// --- REST defaults centralizzati (modifica qui quando cambia server) ---
// PLACHEOLDER PER IL CLIENT REST
// editqui
const REST_DEFAULTS = {
  endpoint: "http://localhost:8080/api/toprocess",
  method: "POST",
  body: {
    placeholder: "ciao",
    mail: "ciao@server.com",
    list: [{ elemento: "1" }],
  },
};

const btnSSE = document.getElementById("btnSSE");
const btnPolling = document.getElementById("btnPolling");
const btnRest = document.getElementById("btnRest");
const btnAll = document.getElementById("btnAll");
const listEl = document.getElementById("eventList");
const emptyStateEl = document.getElementById("emptyState");
const badgeCountEl = document.getElementById("badgeCount");
const listTitleEl = document.getElementById("listTitle");
const statsEl = document.getElementById("stats");
const eventsCard = document.getElementById("eventsCard");
const restCard = document.getElementById("restCard");
const btnClearLogs = document.getElementById("btnClearLogs");
const toggleDevModeEl = document.getElementById("toggleDevMode");
// REST UI refs
const restEndpointEl = document.getElementById("restEndpoint");
const restMethodEl = document.getElementById("restMethod");
const restBodyEl = document.getElementById("restBody");
const restSendBtn = document.getElementById("btnSendRest");
const restOutputEl = document.getElementById("restOutput");
const restStatusEl = document.getElementById("restStatus");
const btnClearRest = document.getElementById("btnClearRest");
const btnCopyRest = document.getElementById("btnCopyRest");

function tryFormatJson(str) {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch {
    return str;
  }
}

function renderList() {
  const data =
    currentView === "sse"
      ? sseEvents
      : currentView === "polling"
        ? pollingEvents
        : allResponses;
  listEl.innerHTML = "";
  if (!data.length) {
    emptyStateEl.style.display = "";
    badgeCountEl.textContent = "0";
  } else {
    emptyStateEl.style.display = "none";
    badgeCountEl.textContent = String(data.length);
    const frag = document.createDocumentFragment();
    data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "item";
      const time = document.createElement("div");
      time.className = "time";
      time.textContent = item.orario;
      const payload = document.createElement("div");
      payload.className = "payload";
      const ep = document.createElement("div");
      ep.className = "endpoint";
      // toggle container
      const toggle = document.createElement("button");
      toggle.className = "chevron btn-icon";
      toggle.setAttribute("aria-expanded", "false");
      toggle.title = "Espandi/Comprimi";
      toggle.innerHTML = "\u25B6"; // ▶ right-pointing triangle
      const epText = document.createElement("span");
      epText.textContent = (item.endpoint || "") + (item.tipo ? ` ` : "");
      ep.appendChild(toggle);
      ep.appendChild(epText);
      if (item.tipo) {
        const badge = document.createElement("span");
        badge.className =
          "source-tag " +
          (item.tipo === "SSE"
            ? "source-sse"
            : item.tipo === "POLLING"
              ? "source-poll"
              : "source-rest");
        badge.textContent = item.tipo;
        ep.appendChild(badge);
      }
      const pre = document.createElement("pre");
      pre.textContent = tryFormatJson(item.evento);
      pre.style.display = "none"; // collapsed by default
      const actions = document.createElement("div");
      actions.className = "item-actions";
      const copyBtn = document.createElement("button");
      copyBtn.className = "btn btn-sm";
      copyBtn.textContent = "Copia";
      copyBtn.title = "Copia il body di questa risposta";
      copyBtn.addEventListener("click", async () => {
        const ok = await copyToClipboard(String(item.evento ?? ""));
        const original = copyBtn.textContent;
        copyBtn.textContent = ok ? "Copiato!" : "Errore";
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 1200);
      });
      actions.appendChild(copyBtn);
      toggle.addEventListener("click", () => {
        const isOpen = pre.style.display !== "none";
        pre.style.display = isOpen ? "none" : "";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.innerHTML = isOpen ? "\u25B6" : "\u25BC"; // ▶ to ▼
      });
      payload.appendChild(ep);
      payload.appendChild(pre);
      payload.appendChild(actions);
      li.appendChild(time);
      li.appendChild(payload);
      frag.appendChild(li);
    });
    listEl.appendChild(frag);
  }
  statsEl.textContent = `SSE: ${sseEvents.length} • Polling: ${pollingEvents.length} • Tutte: ${allResponses.length}`;
  listTitleEl.textContent =
    currentView === "sse"
      ? "Eventi SSE"
      : currentView === "polling"
        ? "Eventi Polling"
        : "Tutte le risposte";
}

function renderIfSelected(kind) {
  if (
    (kind === "sse" && currentView === "sse") ||
    (kind === "polling" && currentView === "polling") ||
    (kind === "all" && currentView === "all")
  ) {
    renderList();
  } else {
    // aggiorna solo i contatori se la vista non corrisponde
    statsEl.textContent = `SSE: ${sseEvents.length} • Polling: ${pollingEvents.length} • Tutte: ${allResponses.length}`;
  }
}

function setView(view) {
  currentView = view;
  btnSSE.classList.toggle("active", view === "sse");
  btnPolling.classList.toggle("active", view === "polling");
  btnRest.classList.toggle("active", view === "rest");
  if (btnAll) btnAll.classList.toggle("active", view === "all");
  // show/hide cards
  if (eventsCard)
    eventsCard.style.display =
      view === "sse" || view === "polling" || view === "all" ? "" : "none";
  if (restCard) restCard.style.display = view === "rest" ? "" : "none";
  if (view === "sse" || view === "polling" || view === "all") {
    renderList();
  }
}

btnSSE.addEventListener("click", () => setView("sse"));
btnPolling.addEventListener("click", () => setView("polling"));
btnRest.addEventListener("click", () => setView("rest"));
if (btnAll) btnAll.addEventListener("click", () => setView("all"));
if (btnClearLogs) {
  btnClearLogs.addEventListener("click", () => {
    // Pulisce i log del tab corrente
    if (currentView === "sse") {
      sseEvents.length = 0;
    } else if (currentView === "polling") {
      pollingEvents.length = 0;
    } else if (currentView === "all") {
      allResponses.length = 0;
    }
    renderList();
  });
}

// (tab-level copy removed; copy is implemented per-item)

// Primo render
renderList();

// ---- REST client logic ----
function safePrettyJson(value) {
  if (value == null || value === "") return "";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

async function sendRestRequest() {
  const url = restEndpointEl.value.trim();
  const method = (restMethodEl.value || "GET").toUpperCase();
  let body = undefined;
  const headers = {};
  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  ) {
    const raw = restBodyEl.value.trim();
    if (raw) {
      try {
        body = JSON.stringify(JSON.parse(raw)); // ensure valid JSON
        headers["Content-Type"] = "application/json";
      } catch (e) {
        restStatusEl.textContent = "Body non valido (JSON)";
        restOutputEl.textContent = e.message;
        return;
      }
    }
  }
  restStatusEl.textContent = "Invio...";
  restOutputEl.textContent = "";
  try {
    const res = await fetch(url, { method, headers, body });
    const ct = res.headers.get("content-type") || "";
    let text;
    if (ct.includes("application/json")) {
      const data = await res.json();
      text = JSON.stringify(data, null, 2);
    } else {
      text = await res.text();
    }
    restStatusEl.textContent = `${res.status} ${res.statusText}`;
    restOutputEl.textContent = text;

    // Log nel tab "Tutte" come REST
    allResponses.push({
      orario: new Date().toLocaleString(),
      evento: text,
      endpoint: url + ` [${method}]`,
      tipo: "REST",
    });
    renderIfSelected("all");
  } catch (err) {
    restStatusEl.textContent = "Errore";
    restOutputEl.textContent = String(err);

    allResponses.push({
      orario: new Date().toLocaleString(),
      evento: String(err),
      endpoint: url + ` [${method}]`,
      tipo: "REST",
    });
    renderIfSelected("all");
  }
}

restSendBtn.addEventListener("click", sendRestRequest);
if (btnClearRest) {
  btnClearRest.addEventListener("click", () => {
    restStatusEl.textContent = "—";
    restOutputEl.textContent = "";
  });
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    return true;
  } catch {
    return false;
  }
}

if (btnCopyRest) {
  btnCopyRest.addEventListener("click", async () => {
    const txt = restOutputEl.textContent || "";
    const ok = await copyToClipboard(txt);
    const original = btnCopyRest.textContent;
    btnCopyRest.textContent = ok ? "Copiato!" : "Errore copia";
    setTimeout(() => {
      btnCopyRest.textContent = original;
    }, 1200);
  });
}
restMethodEl.addEventListener("change", () => {
  const m = restMethodEl.value.toUpperCase();
  const needsBody = ["POST", "PUT", "PATCH", "DELETE"].includes(m);
  restBodyEl.disabled = !needsBody;
  restBodyEl.style.opacity = needsBody ? "1" : "0.6";
});

// Defaults already in HTML; auto-call once on load with defaults
window.addEventListener("DOMContentLoaded", () => {
  // Applica i default centralizzati a UI e placeholder
  if (restEndpointEl) {
    restEndpointEl.placeholder = REST_DEFAULTS.endpoint;
    restEndpointEl.value = REST_DEFAULTS.endpoint;
  }
  if (restMethodEl) {
    restMethodEl.value = (REST_DEFAULTS.method || "GET").toUpperCase();
  }
  if (restBodyEl) {
    const defaultBodyText = JSON.stringify(REST_DEFAULTS.body ?? {}, null, 0);
    restBodyEl.placeholder = defaultBodyText;
    restBodyEl.value = defaultBodyText;
  }

  // ensure UI state after applying defaults
  restMethodEl.dispatchEvent(new Event("change"));
  // rimosso auto-call: la chiamata REST avverrà solo al click su "Invia"
});

// HANDLERS DEGLI EVENTI

// --- Config liste di endpoint + wiring generico ---
const DEFAULT_POLL_INTERVAL = 5000;

// editqui
const SSE_ENDPOINTS = [
  "http://localhost:8080/event/event1",
  "http://localhost:8080/event/event2",
  "http://localhost:8080/event/event3",
];

// editqui
const POLLING_ENDPOINTS = [
  {
    url: "http://localhost:8080/api/toprocess",
    interval: DEFAULT_POLL_INTERVAL,
  },
  {
    url: "http://localhost:8080/api/processed",
    interval: DEFAULT_POLL_INTERVAL,
  },
  {
    url: "http://localhost:9180/event/event1",
    interval: DEFAULT_POLL_INTERVAL,
  },
  {
    url: "http://localhost:8080/event/event2",
    interval: DEFAULT_POLL_INTERVAL,
  },
  {
    url: "http://localhost:8080/api/api1",
    interval: DEFAULT_POLL_INTERVAL,
  },
];

// --- Dev Mode endpoints (stessa struttura) ---
// editqui (DEV): popola con i tuoi endpoint di sviluppo
// editqui
const DEV_SSE_ENDPOINTS = [
  // es: 'http://localhost:3001/event-stream'
  "http://localhost:3000/event-stream",
];

// editqui (DEV): popola con i tuoi endpoint di sviluppo
// editqui
const DEV_POLLING_ENDPOINTS = [
  // es: { url: 'http://localhost:3001/test', interval: DEFAULT_POLL_INTERVAL }
  { url: "http://localhost:3000/test", interval: DEFAULT_POLL_INTERVAL },
];

// Stato e risorse attive per avviare/fermare facilmente
const activeBaseSSE = [];
const activeBasePoll = [];
const activeDevSSE = [];
const activeDevPoll = [];
let devMode = false; // di default disattiva

function logSSE(url, data) {
  const entry = {
    orario: new Date().toLocaleString(),
    evento: data,
    endpoint: url,
  };
  sseEvents.push(entry);
  allResponses.push({ ...entry, tipo: "SSE" });
  renderIfSelected("sse");
  renderIfSelected("all");
}

function logPOLL(url, data) {
  const entry = {
    orario: new Date().toLocaleString(),
    evento: data,
    endpoint: url,
  };
  pollingEvents.push(entry);
  allResponses.push({ ...entry, tipo: "POLLING" });
  renderIfSelected("polling");
  renderIfSelected("all");
}

function startSSE(urls, bag) {
  urls.forEach((url) => {
    try {
      const es = new EventSource(url);
      es.onmessage = (e) => {
        const now = new Date().toLocaleString();
        console.log(`[${now}] Evento SSE ricevuto da ${url}:`, e.data);
        logSSE(url, e.data);
      };
      es.onerror = (err) => {
        const now = new Date().toLocaleString();
        console.error(`[${now}] Errore SSE ${url}:`, err);
      };
      bag.push(es);
    } catch (err) {
      const now = new Date().toLocaleString();
      console.error(`[${now}] Impossibile inizializzare SSE ${url}:`, err);
    }
  });
}

function stopSSE(bag) {
  while (bag.length) {
    const es = bag.pop();
    try {
      es.close();
    } catch {}
  }
}

function startPolling(items, bag) {
  items.forEach(({ url, interval = DEFAULT_POLL_INTERVAL }) => {
    const fetchOnce = () => {
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then((data) => {
          const now = new Date().toLocaleString();
          console.log(`[${now}] [POLLING] Risposta da ${url}:`, data);
          logPOLL(url, data);
        })
        .catch((error) => {
          const now = new Date().toLocaleString();
          console.error(`[${now}] Errore polling ${url}:`, error);
        });
    };
    const id = setInterval(fetchOnce, interval);
    bag.push(id);
    fetchOnce();
  });
}

function stopPolling(bag) {
  while (bag.length) {
    const id = bag.pop();
    clearInterval(id);
  }
}

function startBaseEndpoints() {
  startSSE(SSE_ENDPOINTS, activeBaseSSE);
  startPolling(POLLING_ENDPOINTS, activeBasePoll);
}

function stopBaseEndpoints() {
  stopSSE(activeBaseSSE);
  stopPolling(activeBasePoll);
}

function startDevEndpoints() {
  startSSE(DEV_SSE_ENDPOINTS, activeDevSSE);
  startPolling(DEV_POLLING_ENDPOINTS, activeDevPoll);
}

function stopDevEndpoints() {
  stopSSE(activeDevSSE);
  stopPolling(activeDevPoll);
}

// Avvio iniziale: solo base (devMode=false di default)
startBaseEndpoints();

// Toggle Dev Mode wiring
if (toggleDevModeEl) {
  toggleDevModeEl.checked = false;
  toggleDevModeEl.addEventListener("change", (e) => {
    devMode = !!toggleDevModeEl.checked;
    if (devMode) {
      startDevEndpoints();
    } else {
      stopDevEndpoints();
    }
  });
}
