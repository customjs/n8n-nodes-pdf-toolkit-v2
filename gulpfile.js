const { src, dest, parallel } = require("gulp");

function copyNodeIcons() {
  return src("nodes/**/*.svg").pipe(dest("dist/nodes/"));
}

function copyCredentialIcons() {
  return src("credentials/**/*.svg").pipe(dest("dist/credentials/"));
}

exports["build:icons"] = parallel(copyNodeIcons, copyCredentialIcons);
