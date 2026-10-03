const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const htmlPath = path.join(publicDir, 'index.html');
const cssPath = path.join(publicDir, 'styles.css');
const jsPath = path.join(publicDir, 'app.js');
const imgPath = path.join(publicDir, 'assets', 'suzuki_alto_fleet.jpg');

let html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const imgBase64 = fs.readFileSync(imgPath).toString('base64');
const dataUri = 'data:image/jpeg;base64,' + imgBase64;

// Replace stylesheet link with inline CSS
html = html.replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`);

// Replace image src with base64 data URI
html = html.replace('assets/suzuki_alto_fleet.jpg', dataUri);

// Replace app.js script tag with inline JS
html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

const destFile = 'D:\\alto\\Work';
fs.writeFileSync(destFile, html, 'utf8');
console.log(`Successfully bundled single-file application into ${destFile} (Total size: ${html.length} bytes)`);
