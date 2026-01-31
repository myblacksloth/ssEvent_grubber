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

// File principale del server Node.js: contiene la configurazione di Express, alcune rotte di test e una rotta SSE.
// server.js
// Importa il framework web Express dalla dipendenza installata via npm.
const express = require("express");
// Crea un'istanza dell'applicazione Express su cui definire middleware e rotte.
const app = express();
// Definisce la porta su cui il server HTTP rimarrà in ascolto.
const PORT = 3000;

// Registra un middleware statico che serve file dalla cartella 'public' (se esiste).
app.use(express.static("public"));
// Parse JSON bodies
// Abilita il parsing automatico del corpo delle richieste con Content-Type: application/json.
app.use(express.json());

// Simple test route
// Definisce una rotta GET '/test' che risponde con alcune informazioni di diagnostica.
app.get("/test", (req, res) => {
  // Consente richieste CORS da qualsiasi origine (utile in fase di sviluppo/test).
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Disabilita la cache per far sì che ogni richiesta riceva dati freschi.
  res.setHeader("Cache-Control", "no-cache");
  // Invia un oggetto JSON con timestamp ISO, epoch in millisecondi e un numero casuale.
  res.json({
    now: new Date().toISOString(),
    epochMs: Date.now(),
    random: Math.random(),
  });
});

// Route SSE
// Definisce una rotta GET '/event-stream' che utilizza Server-Sent Events per inviare eventi periodici al client.
app.get("/event-stream", (req, res) => {
  // Imposta l'header Content-Type necessario per SSE.
  res.setHeader("Content-Type", "text/event-stream");
  // Disabilita la cache per mantenere la connessione e i dati aggiornati.
  res.setHeader("Cache-Control", "no-cache");
  // Mantiene viva la connessione HTTP (necessario per stream SSE).
  res.setHeader("Connection", "keep-alive");

  // **Header CORS**
  // Permette l'accesso da qualsiasi origine; in produzione limitare al dominio consentito.
  res.setHeader("Access-Control-Allow-Origin", "*"); // Permette tutte le origini, in produzione metti il dominio frontend
  // Indica che le credenziali potrebbero essere inviate (cookie, ecc.) se necessario.
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Se usi cookie/autenticazioni

  // Funzione che costruisce e invia un evento SSE al client.
  const sendEvent = () => {
    // const data = `data: ${new Date().toISOString()}\n\n`;
    // oppure
    // Prepara i dati dell'evento: un timestamp, un messaggio e un numero casuale.
    const eventData = {
      time: new Date().toISOString(),
      message: "Hello from server",
      randomNumber: Math.floor(Math.random() * 100),
    };
    // Serializza l'evento in formato testuale SSE (prefisso 'data:' e doppio newline per terminare l'evento).
    const data = `data: ${JSON.stringify(eventData)}\n\n`;
    //
    // poi ci dovrebbe essere id, data e event
    // Scrive l'evento sullo stream di risposta senza chiudere la connessione.
    res.write(data);
  };

  // Invia un evento ogni 2 secondi
  // Pianifica l'invio periodico degli eventi SSE con intervallo di 2000 ms.
  const interval = setInterval(sendEvent, 2000);

  // Pulisce l'intervallo se la connessione viene chiusa
  // Quando il client chiude la connessione, interrompe l'intervallo e chiude la risposta.
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

// Preflight for /apitest
// Gestisce la richiesta preflight CORS (metodo OPTIONS) per la rotta '/apitest'.
app.options("/apitest", (req, res) => {
  // Consente qualsiasi origine.
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Indica i metodi permessi in seguito alla preflight.
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  // Indica gli header permessi per la richiesta effettiva.
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Risponde senza contenuto, come previsto per una preflight (204 No Content).
  res.sendStatus(204);
});

// Test POST route: /apitest
// Definisce una rotta POST '/apitest' che semplicemente riecheggia il corpo ricevuto.
app.post("/apitest", (req, res) => {
  // CORS + cache headers like other routes
  // Consente la chiamata da qualsiasi origine.
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Disabilita la cache della risposta.
  res.setHeader("Cache-Control", "no-cache");

  // Logga a console il corpo JSON ricevuto nella richiesta.
  console.log("POST /apitest body:", req.body);

  // Risponde con un JSON che conferma la ricezione e include il payload e un timestamp.
  return res.json({
    ok: true,
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Avvia il server HTTP in ascolto sulla porta definita e logga l'URL di servizio.
app.listen(PORT, () => {
  console.log(`Server SSE avviato su http://localhost:${PORT}`);
});
