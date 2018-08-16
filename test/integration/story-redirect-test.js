var assert = require('assert');
const express = require("express");
const React = require("react");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function pickComponent(pageType) {
  return ({data}) => <div data-page-type={pageType}>{data.text}</div>;
}

function createApp(opts = {}) {
  const app = express();
  isomorphicRoutes(app, Object.assign({
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null, assetPath: (file) => `/assets/${file}`},
    generateRoutes: () => [],
    pickComponent: pickComponent,
    loadErrorData: (err, config) => ({httpStatusCode: err.httpStatusCode, pageType: "not-found", data: {text: "foobar"}}),
    renderLayout: (res, {store, title, content}) => res.send(JSON.stringify({store: store.getState(), title, content})),
    redirectRootLevelStories: true
  }, opts));

  return app;
}

describe('Redirect Handler', function() {
  it("Redirects to a story on the root level", function(done) {
    const app = createApp({
      getClient: (hostname) => ({
        getConfig: () => Promise.resolve({foo: "bar"}),
        getStoryBySlug: (slug) => Promise.resolve({story: {slug: `section/${slug}`}}),
        getStaticData: () => Promise.resolve({}),
      })
    });

    supertest(app)
      .get("/story-slug")
      .expect("Location", "/section/story-slug")
      .expect(301, done);
  });

  it("Redirects to a story on the root level even if there is a trailing /", function(done) {
    const app = createApp({
      getClient: (hostname) => ({
        getConfig: () => Promise.resolve({foo: "bar"}),
        getStoryBySlug: (slug) => Promise.resolve({story: {slug: `section/${slug}`}})
      })
    });

    supertest(app)
      .get("/story-slug/")
      .expect("Location", "/section/story-slug")
      .expect(301, done);
  });

  it("Does not redirect if story is not found", function(done) {
    const app = createApp({
      getClient: (hostname) => ({
        getConfig: () => Promise.resolve({foo: "bar"}),
        getStoryBySlug: (slug) => Promise.reject({message: "Not Found"}),
        getStaticData: () => Promise.resolve({}),
      })
    });

    supertest(app)
      .get("/story-slug")
      .expect(404, done);
  });
});
