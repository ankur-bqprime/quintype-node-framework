import { SERVICE_WORKER_UPDATED } from '@quintype/components';

export function registerServiceWorker({enableServiceWorker = false, serviceWorkerLocation = "/service-worker.js", navigator = global.navigator}) {
  if(enableServiceWorker && navigator.serviceWorker) {
    return navigator.serviceWorker.register(serviceWorkerLocation)
  } else {
    return Promise.resolve(null)
  }
}

export function setupServiceWorkerUpdates(serviceWorkerPromise, app, store, page) {
  if(!serviceWorkerPromise)
    return Promise.resolve();
  console.log("setup service worker ------------>");
  return serviceWorkerPromise
    .then(registration => {
      if(!registration)
        return;

      if(registration.update) {
        console.log("added updateServiceWorker --------------->");
        app.updateServiceWorker = () => registration.update().then(() => store.dispatch({type: SERVICE_WORKER_UPDATED}));
      }
      app.updateServiceWorker = () => registration.update().then(() => store.dispatch({type: SERVICE_WORKER_UPDATED}));
      checkForServiceWorkerUpdates(app, page);

      return registration;
    });
}

export function checkForServiceWorkerUpdates(app, page = {}) {
  app.updateServiceWorker && app.updateServiceWorker();
  console.log("coming in checkForServiceWorkerUpdates ------------>");
  if((page.appVersion && app.getAppVersion && app.getAppVersion() < page.appVersion)) {
    console && console.log("Updating the Service Worker");
    app.updateServiceWorker && app.updateServiceWorker();
  }

  /* Check if the config is updated and update the service worker if true */
  else if(global && global.qtVersion) {
    const {qtVersion: {configVersion = 0, pbConfigVersion = 0} = {}} = global;
    const {config:{'theme-attributes': pageThemeAttributes = {}, 'pagebuilder-config': pbConfig} = {}} = page;
    if((pageThemeAttributes['cache-burst'] || 0) > parseInt(configVersion) || (pbConfig.version || 0) > parseInt(pbConfigVersion)) {
      console.log(`updating service worker due to config change`);
      app.updateServiceWorker && app.updateServiceWorker();
    }
  }


  return page;
}
