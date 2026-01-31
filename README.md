# Event Tester

Italiano | English

---

## 🇮🇹 Panoramica
Event Tester è un piccolo progetto pensato per testare e osservare eventi e risposte da servizi web in modo semplice e veloce.

Include:
- Un client web statico per monitorare eventi SSE e risposte via polling, oltre a un semplice client REST.
- Un server Node.js con endpoint di test e uno stream SSE per simulare scenari reali o di sviluppo.
- Esempi di configurazione Nginx (opzionali) per instradare richieste e gestire SSE.

Obiettivo: fornire un ambiente leggero per sperimentare integrazioni frontend/back-end, verificare CORS, e osservare flussi di eventi in tempo reale.

### Struttura del progetto
- `Client/` – Web app statica per visualizzare eventi e inviare richieste REST. Vedi `Client/README.md`.
- `Server/node/` – Server di test in Node.js (Express) con endpoint JSON e SSE. Vedi `Server/node/README.md`.

Per comprendere bene il funzionamento dei singoli componenti (endpoint, UI, configurazioni), consulta i rispettivi README:
- Client: [Client/README.md](Client/README.md)
- Server (Node): [Server/node/README.md](Server/node/README.md)

### Avvio rapido (generico)
- Client: apri `Client/index.html` in un browser moderno oppure servi la cartella `Client/` con un semplice server statico.
- Server: nella cartella `Server/node`, installa le dipendenze e avvia il server Node.js; consulta i dettagli nel relativo README.

---

## 🇬🇧 Overview
Event Tester is a small project to quickly test and observe events and responses from web services.

It includes:
- A static web client to monitor SSE events and polling responses, plus a simple REST client.
- A Node.js server exposing test endpoints and an SSE stream to simulate real/development scenarios.
- Optional Nginx configuration samples to route requests and handle SSE.

Goal: provide a lightweight environment to experiment with frontend/back-end integrations, validate CORS, and observe real-time event flows.

### Project structure
- `Client/` – Static web app to visualize events and send REST requests. See `Client/README.md`.
- `Server/node/` – Node.js (Express) test server with JSON and SSE endpoints. See `Server/node/README.md`.

For a deeper understanding of each component (endpoints, UI, configuration), read the respective READMEs:
- Client: [Client/README.md](Client/README.md)
- Server (Node): [Server/node/README.md](Server/node/README.md)

### Quick start (generic)
- Client: open `Client/index.html` in a modern browser or serve the `Client/` folder with a simple static server.
- Server: in `Server/node`, install dependencies and start the Node.js server; see its README for details.

