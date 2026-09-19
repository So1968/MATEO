const net = require("node:net");
const http = require("node:http");

const LOOPBACK_HOST = "127.0.0.1";
const LOCAL_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

// Les API de Vogue Marry sont des services locaux. Si un serveur Node est lancé
// avec seulement un port, on force explicitement la boucle locale au lieu de
// laisser Node écouter sur toutes les interfaces réseau.
const originalListen = net.Server.prototype.listen;
net.Server.prototype.listen = function vogueLocalListen(...args) {
  if (typeof args[0] === "number" || /^\d+$/.test(String(args[0] || ""))) {
    const second = args[1];
    const hostIsAlreadySpecified = typeof second === "string" && !/^\d+$/.test(second);
    if (!hostIsAlreadySpecified) args.splice(1, 0, LOOPBACK_HOST);
  } else if (args[0] && typeof args[0] === "object" && !args[0].host) {
    args[0] = { ...args[0], host: LOOPBACK_HOST };
  }
  return originalListen.apply(this, args);
};

// Une page web distante ne doit pas pouvoir piloter les API locales depuis le
// navigateur. Les appels sans Origin restent autorisés pour curl et les outils
// locaux ; les appels navigateur sont limités aux origines loopback.
const originalEmit = http.Server.prototype.emit;
http.Server.prototype.emit = function vogueLocalRequestGuard(eventName, req, res, ...rest) {
  if (eventName === "request" && req && res) {
    const origin = String(req.headers?.origin || "").trim();
    if (origin && !LOCAL_ORIGIN.test(origin)) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Vary", "Origin");
      res.end(JSON.stringify({ error: "Accès refusé : API Vogue Marry locale uniquement." }));
      return true;
    }
  }
  return originalEmit.call(this, eventName, req, res, ...rest);
};
