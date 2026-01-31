# Event Tester Client

Italiano | English

---

## 🇮🇹 Panoramica
Event Tester Client è una semplice web app statica pensata per:
- Monitorare eventi provenienti da endpoint SSE e da endpoint interrogati via polling
- Eseguire richieste REST ad endpoint configurabili
- Ispezionare e copiare rapidamente i body delle risposte

L'interfaccia offre tab per visualizzare: Eventi SSE, Eventi con Polling, Tutte le risposte e un Client REST. È presente anche una Dev Mode per attivare ulteriori endpoint di sviluppo.

### Funzionalità principali
- Tracciamento eventi SSE e Polling con contatori e lista eventi
- Vista "Tutte le risposte" cumulata (SSE, Polling, REST)
- Client REST integrato (endpoint, metodo, body JSON)
- Copia del body per singolo evento (SSE/Polling/REST)
- Pulisci log per il tab corrente
- Body dei log collassabili (espandi/comprimi)
- Dev Mode con endpoint dedicati, attivabile da toggle stile iOS

---

## Struttura del progetto
- `index.html`: struttura della pagina e toolbar (tab e toggle Dev Mode)
- `styles.css`: stile moderno dell'interfaccia (bottoni, liste, toggle iOS)
- `app.js`: logica dell'applicazione (SSE, Polling, REST, rendering UI)

---

## Come eseguirlo
È un client statico: basta aprire `index.html` in un browser moderno. Per test più realistici (CORS, path relativi, ecc.) si consiglia di servire i file con un piccolo server statico (es. nginx, http-server, ecc.).

---

## Configurazione: rotte ed endpoint
Tutta la configurazione principale si trova in `app.js`.

### 1) Default del Client REST
Cerca il blocco `REST_DEFAULTS`:

- `endpoint`: URL precompilato nel campo del client REST
- `method`: metodo HTTP di default (es. `POST`)
- `body`: JSON di esempio precompilato nel body

Per cambiare i default, modifica questi valori; al load, la UI verrà popolata con questi parametri.

### 2) Liste endpoint SSE e Polling (base)
Cerca i blocchi:
- `SSE_ENDPOINTS`: array di stringhe (URL SSE)
- `POLLING_ENDPOINTS`: array di oggetti `{ url, interval }` (ms)

Esempio:
```
const SSE_ENDPOINTS = [
  'http://localhost:84/prova',
  'http://localhost:84/prova',
];

const POLLING_ENDPOINTS = [
  { url: 'http://localhost:84/prova', interval: 5000 },
  { url: 'http://localhost:84/prova', interval: 5000 },
];
```
Gli endpoint base partono automaticamente all'avvio dell'app.

### 3) Liste endpoint Dev Mode
Per attivare ulteriori endpoint in modalità sviluppo, usa:
- `DEV_SSE_ENDPOINTS`: array di URL SSE DEV
- `DEV_POLLING_ENDPOINTS`: array `{ url, interval }` DEV

Esempio:
```
const DEV_SSE_ENDPOINTS = [
  'http://localhost:3001/event-stream',
];

const DEV_POLLING_ENDPOINTS = [
  { url: 'http://localhost:3001/test', interval: 5000 },
];
```
Questi endpoint vengono avviati/fermati dal toggle Dev Mode nella toolbar.

---

## Dev Mode
- Toggle stile iOS in alto a sinistra (“Dev mode”)
- Di default è disattivo
- Quando attivo: oltre agli endpoint base, parte anche la lista DEV (SSE e Polling)
- Quando disattivo: la lista DEV viene fermata (quella base resta attiva)

---

## Dettagli UI e utilizzo
- Tab
  - "Senza polling (SSE)": mostra solo eventi SSE
  - "Con polling": mostra risposte via polling
  - "Tutte le risposte": aggrega tutti gli eventi (SSE/Polling/REST)
  - "Client REST": pannello per inviare richieste HTTP e vedere la risposta
- Lista eventi
  - Ogni item mostra endpoint, fonte (badge SSE/POLLING/REST), orario e body
  - Body collassato: clicca la freccetta ▶ per espandere (▼) o comprimere
  - Bottone “Copia”: copia il body di quel singolo evento negli appunti
- Pulisci log
  - Bottone “Pulisci” nella card degli eventi: svuota gli elementi del tab corrente
- Client REST
  - Compila endpoint/metodo/body JSON e premi “Invia”
  - La risposta è mostrata formattata (se JSON) e può essere copiata/pulita

---

## Note tecniche
- SSE: ogni URL crea un `EventSource`; in caso di errori viene loggato in console
- Polling: ogni URL è interrogato a intervallo configurato (`setInterval`), con log su success/error
- Le risposte sono mantenute in 3 array: `sseEvents`, `pollingEvents`, `allResponses`
- Il rendering è client-side (DOM API), senza framework

---

## Troubleshooting
- CORS: se gli endpoint sono su un host/porta diversi, assicurati che il server consenta CORS
- Mixed content: se servi il client su `https`, usa endpoint `https`
- Formato body REST: il body deve essere JSON valido per i metodi che lo richiedono

---

## Extensibility
- Aggiungere filtri/ricerca nella lista eventi
- Esportazione dei log in JSON/CSV
- Evidenziare errori (status != 2xx) o parole chiave

---

## 🇬🇧 Overview
Event Tester Client is a simple static web app designed to:
- Monitor events from SSE endpoints and polling-based endpoints
- Send REST requests to configurable endpoints
- Inspect and copy response bodies quickly

The UI offers tabs for SSE, Polling, All responses, and a REST Client. A Dev Mode is available to enable additional development endpoints.

### Key features
- SSE and Polling event tracking with counters and event list
- "All responses" combined view (SSE, Polling, REST)
- Built-in REST client (endpoint, method, JSON body)
- Per-event body copy (SSE/Polling/REST)
- Clear logs per current tab
- Collapsible bodies (expand/collapse)
- Dev Mode with dedicated endpoints, iOS-style toggle

---

## Project structure
- `index.html`: page layout and toolbar (tabs and Dev Mode toggle)
- `styles.css`: modern UI styling (buttons, lists, iOS toggle)
- `app.js`: application logic (SSE, Polling, REST, UI rendering)

---

## How to run
It's a static client: simply open `index.html` in a modern browser. For realistic testing (CORS, relative paths), serve the files with a tiny static server (e.g., nginx, http-server, etc.).

---

## Configuration: routes and endpoints
All the main configuration lives in `app.js`.

### 1) REST Client defaults
Locate the `REST_DEFAULTS` block:

- `endpoint`: prefilled URL for the REST client
- `method`: default HTTP method (e.g., `POST`)
- `body`: example JSON prefilled in the textarea

Change these values to update the initial UI.

### 2) SSE and Polling endpoint lists (base)
Locate the blocks:
- `SSE_ENDPOINTS`: string array (SSE URLs)
- `POLLING_ENDPOINTS`: array of objects `{ url, interval }` (ms)

Example:
```
const SSE_ENDPOINTS = [
  'http://localhost:84/prova',
  'http://localhost:84/prova',
];

const POLLING_ENDPOINTS = [
  { url: 'http://localhost:84/prova', interval: 5000 },
  { url: 'http://localhost:84/prova', interval: 5000 },
];
```
Base endpoints start automatically when the app loads.

### 3) Dev Mode endpoint lists
To enable extra endpoints for development, use:
- `DEV_SSE_ENDPOINTS`: array of DEV SSE URLs
- `DEV_POLLING_ENDPOINTS`: array of `{ url, interval }` DEV entries

Example:
```
const DEV_SSE_ENDPOINTS = [
  'http://localhost:3001/event-stream',
];

const DEV_POLLING_ENDPOINTS = [
  { url: 'http://localhost:3001/test', interval: 5000 },
];
```
These endpoints are started/stopped through the Dev Mode toggle in the toolbar.

---

## Dev Mode
- iOS-style toggle on the top-left (“Dev mode”)
- Disabled by default
- When enabled: starts the DEV lists (SSE and Polling) alongside the base endpoints
- When disabled: stops the DEV lists (base endpoints remain active)

---

## UI details and usage
- Tabs
  - "Senza polling (SSE)": shows SSE events only
  - "Con polling": shows responses fetched via polling
  - "Tutte le risposte": aggregates all events (SSE/Polling/REST)
  - "Client REST": panel to send HTTP requests and see responses
- Event list
  - Each item shows endpoint, source badge (SSE/POLLING/REST), timestamp and body
  - Collapsed body: click the chevron ▶ to expand (▼) or collapse
  - “Copia” button: copies that single event body to clipboard
- Clear logs
  - “Pulisci” button in the events card: clears the items of the current tab
- REST Client
  - Fill in endpoint/method/JSON body and click “Invia”
  - Response is pretty-printed (if JSON) and can be copied/cleared

---

## Technical notes
- SSE: each URL creates an `EventSource`; errors are logged to console
- Polling: each URL is fetched at configured interval (`setInterval`), logging success/error
- Responses are kept in 3 arrays: `sseEvents`, `pollingEvents`, `allResponses`
- Rendering is client-side (DOM API), no framework

---

## Troubleshooting
- CORS: if endpoints are on a different host/port, ensure the server allows CORS
- Mixed content: if serving over `https`, use `https` endpoints
- REST body format: body must be valid JSON for methods requiring it

---

## Extensibility
- Add filters/search to the event list
- Export logs as JSON/CSV
- Highlight errors (non-2xx) or keywords
