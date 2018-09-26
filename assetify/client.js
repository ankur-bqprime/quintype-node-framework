// istanbul ignore file

const {setAssetifyFn} = require("../assetify");

function getAssetCdn() {
  const script = global.document.getElementById("app-js");
  if(script && script.src)
    return new URL(script.src).host;
}

const assetCdn = `//${getAssetCdn() || "fea.assettype.com"}`;

function appendCDN(path) {
  if(path.startsWith("/"))
    return `${assetCdn}${path}`;
  else
    return path;
}

module.exports = function() {
  setAssetifyFn(appendCDN);
}
