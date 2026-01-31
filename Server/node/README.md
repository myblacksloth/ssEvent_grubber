# Event Tester Server (Node.js)

Guida bilingue IT/EN per il piccolo server Express che espone endpoint di test e uno stream SSE per eventi.

---

## 🇮🇹 Italiano

### Cos'è e cosa fa
Questo server è una semplice applicazione Node.js/Express che fornisce:
- Servizio statico opzionale dalla cartella `public/` (se presente)
- Endpoint di test JSON: `GET /test`
- Stream SSE (Server-Sent Events): `GET /event-stream`
- Endpoint di echo via POST: `POST /apitest` (con preflight `OPTIONS /apitest`)

È utile per testare integrazioni frontend (fetch/SSE), CORS e proxy (ad es. Nginx).

### Requisiti
- Node.js (consigliato ≥ 18.x)
- npm (incluso in Node.js)

### Installazione
Nella cartella `Server/node`:

```bash
npm install
```

### Avvio
```bash
node index.js
```
Per impostazione predefinita il server ascolta su `http://localhost:3000`.

### Configurazione
- Porta
  - Predefinita: `3000`. È definita in `index.js` come `const PORT = 3000;`
  - Per cambiarla, modifica quel valore e riavvia il server.
- CORS
  - Gli endpoint impostano `Access-Control-Allow-Origin: *` (tutte le origini). In produzione limita l'origine sostituendo `*` con il dominio del tuo frontend.
- Statici
  - Se crei una cartella `public/`, i file al suo interno saranno serviti come statici all'URL radice.
- Proxy Nginx (opzionale)
  - È fornito un esempio in `nginx-section.conf` che:
    - ascolta sulla porta `83`
    - inoltra `/(root)` e `/event-stream` al backend `http://localhost:3000`
    - disabilita il buffering per SSE e aumenta i timeout
  - Passi tipici:
    1. Copia il blocco `server { ... }` nel file di configurazione di Nginx (o includilo)
    2. Adatta `listen`, `server_name` e host/porta del backend se necessario
    3. Testa la configurazione e ricarica Nginx

### API
- `GET /test`
  - Risposta JSON con timestamp ISO, `epochMs` e numero casuale. Header: CORS aperto e `Cache-Control: no-cache`.
  - Esempio (curl):
    ```bash
    curl http://localhost:3000/test
    ```
- `GET /event-stream` (SSE)
  - Stream con `Content-Type: text/event-stream`, CORS aperto e connessione keep-alive. Invia un evento ogni 2s con payload:
    ```json
    { "time": "ISO string", "message": "Hello from server", "randomNumber": 0..99 }
    ```
  - Consumo lato browser:
    ```html
    <script>
      const es = new EventSource('http://localhost:3000/event-stream');
      es.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        console.log('SSE', data);
      };
      es.onerror = (err) => console.error('SSE error', err);
    </script>
    ```
- `OPTIONS /apitest`
  - Preflight per CORS con metodi/headers consentiti.
- `POST /apitest`
  - Echo del body ricevuto con `{ ok: true, received: <body>, timestamp: <ISO> }` e `Cache-Control: no-cache`.
  - Esempio (curl):
    ```bash
    curl -X POST http://localhost:3000/apitest \
      -H 'Content-Type: application/json' \
      -d '{"foo":"bar"}'
    ```

Se usi Nginx dell'esempio, gli URL diventano `http://localhost:83/...`.

### Struttura
```
Server/node/
  index.js            # server Express
  package.json        # dipendenze (express ^5.1.0)
  nginx-section.conf  # esempio di configurazione Nginx per proxy + SSE
  README.md           # questa guida
```

### Troubleshooting
- Porta occupata: cambia `PORT` in `index.js`.
- CORS bloccato: sostituisci `*` con il tuo dominio negli header CORS.
- SSE che si interrompe dietro proxy: assicurati `proxy_buffering off`, `proxy_read_timeout` e `proxy_send_timeout` elevati.

---

## 🇬🇧 English

### What it is
A minimal Node.js/Express server providing:
- Optional static serving from `public/` (if present)
- JSON test endpoint: `GET /test`
- Server-Sent Events stream: `GET /event-stream`
- Echo endpoint: `POST /apitest` (with `OPTIONS /apitest` preflight)

Handy for frontend integration testing (fetch/SSE), CORS, and reverse proxy setups.

### Requirements
- Node.js (recommended ≥ 18.x)
- npm

### Install
In `Server/node`:
```bash
npm install
```

### Run
```bash
node index.js
```
Default listen address is `http://localhost:3000`.

### Configuration
- Port
  - Default `3000`, defined in `index.js` as `const PORT = 3000;` — edit and restart to change.
- CORS
  - Endpoints set `Access-Control-Allow-Origin: *`. Restrict to your frontend origin in production.
- Static files
  - Create a `public/` folder to serve files from the root path.
- Nginx reverse proxy (optional)
  - See `nginx-section.conf`: listens on `83`, proxies `/` and `/event-stream` to `http://localhost:3000`, disables buffering for SSE, extends timeouts.
  - Typical steps: copy/integrate the `server { ... }` block, adjust `listen/server_name` and backend host:port, test and reload Nginx.

### API
- `GET /test`
  - JSON with ISO timestamp, `epochMs`, and a random number. Headers: open CORS and `Cache-Control: no-cache`.
  - Example (curl):
    ```bash
    curl http://localhost:3000/test
    ```
- `GET /event-stream` (SSE)
  - `Content-Type: text/event-stream`, open CORS, keep-alive. Emits every 2s:
    ```json
    { "time": "ISO string", "message": "Hello from server", "randomNumber": 0..99 }
    ```
  - Browser consumption:
    ```html
    <script>
      const es = new EventSource('http://localhost:3000/event-stream');
      es.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        console.log('SSE', data);
      };
      es.onerror = (err) => console.error('SSE error', err);
    </script>
    ```
- `OPTIONS /apitest`
  - CORS preflight for the POST endpoint.
- `POST /apitest`
  - Echos request body as `{ ok: true, received: <body>, timestamp: <ISO> }`, with `Cache-Control: no-cache`.
  - Example (curl):
    ```bash
    curl -X POST http://localhost:3000/apitest \
      -H 'Content-Type: application/json' \
      -d '{"foo":"bar"}'
    ```

When using the provided Nginx sample, URLs are `http://localhost:83/...`.

### Layout
```
Server/node/
  index.js            # Express server
  package.json        # dependency: express ^5.1.0
  nginx-section.conf  # Nginx proxy + SSE sample config
  README.md           # this guide
```

### Troubleshooting
- Port in use: change `PORT` in `index.js`.
- CORS blocked: replace `*` with your allowed origin(s).
- SSE cuts off behind proxy: ensure `proxy_buffering off` and generous read/send timeouts.

---

Suggerimento/Tip: you may add an npm start script in `package.json` for convenience:
```json
{
  "scripts": { "start": "node index.js" }
}
```
Così puoi avviare con/Then you can run: `npm start`.
