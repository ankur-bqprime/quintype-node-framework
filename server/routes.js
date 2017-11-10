const config = require("./publisher-config");
const {getClient} = require("./api-client");

const {generateServiceWorker} = require("./handlers/generate-service-worker");
const {handleIsomorphicShell, handleIsomorphicDataLoad, handleIsomorphicRoute} = require("./handlers/isomorphic-handler");

function withConfig(logError, f, staticParams) {
  return function(req, res, opts) {
    opts = Object.assign({}, opts, staticParams);
    const client = getClient(req.hostname);
    return client.getConfig()
      .then(c => f(req, res, Object.assign({}, opts, {config: c, client: client})))
      .catch(logError);
  }
}

exports.withConfig = withConfig;

exports.upstreamQuintypeRoutes = function upstreamQuintypeRoutes(app) {
  const apiProxy = require("http-proxy").createProxyServer({
    target: config.sketches_host
  });

  apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Host', getClient(req.hostname).getHostname());
  });

  const sketchesProxy = (req, res) => apiProxy.web(req, res);

  app.get("/ping", function(req, res) {
    getClient(req.hostname)
    .getConfig()
    .then(() => res.send("pong"))
    .catch(() =>
      res
      .status(503)
      .send({error: {message: "Config not loaded"}})
    );
  });

  app.all("/api/*", sketchesProxy);
  app.all("/login", sketchesProxy);
  app.all("/qlitics.js", sketchesProxy);
  app.all("/auth.form", sketchesProxy);
  app.all("/auth.callback", sketchesProxy);
  app.all("/auth", sketchesProxy);
  app.all("/admin/*", sketchesProxy);
  app.all("/sitemap.xml", sketchesProxy);
  app.all("/sitemap/*", sketchesProxy);
  app.all("/feed", sketchesProxy);
  app.all("/rss-feed", sketchesProxy);
  app.all("/stories.rss", sketchesProxy);
  app.all("/news_sitemap.xml", sketchesProxy);
}

exports.isomorphicRoutes = function isomorphicRoutes(app, {generateRoutes, logError, renderLayout, loadData, pickComponent, loadErrorData, loadSeoData}) {
  app.get("/service-worker.js", withConfig(logError, generateServiceWorker, {generateRoutes}));
  app.get("/shell.html", withConfig(logError, handleIsomorphicShell, {renderLayout}));
  app.get("/route-data.json", withConfig(logError, handleIsomorphicDataLoad, {generateRoutes, loadData, loadErrorData}));
  app.get("/*", withConfig(logError, handleIsomorphicRoute, {generateRoutes, loadData, renderLayout, pickComponent, loadErrorData, loadSeoData}));
}
