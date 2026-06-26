const fs = require('fs');
const html = fs.readFileSync('_legacy/index.html', 'utf8');
const match = html.match(/tailwind\.config = ({[\s\S]*?})\n\s*</);
if (!match) { console.error('No match'); process.exit(1); }
const config = new Function('return (' + match[1] + ')')();

let css = '@import "tailwindcss";\n\n@theme {\n';

const colors = config.theme.extend.colors;
for(let k in colors) css += '  --color-' + k + ': ' + colors[k] + ';\n';

const spacing = config.theme.extend.spacing;
for(let k in spacing) css += '  --spacing-' + k + ': ' + spacing[k] + ';\n';

const fonts = config.theme.extend.fontFamily;
for(let k in fonts) css += '  --font-' + k + ': "' + fonts[k][0] + '";\n';

const fontSizes = config.theme.extend.fontSize;
for(let k in fontSizes) {
  css += '  --text-' + k + ': ' + fontSizes[k][0] + ';\n';
  css += '  --text-' + k + '--line-height: ' + fontSizes[k][1].lineHeight + ';\n';
  css += '  --text-' + k + '--font-weight: ' + fontSizes[k][1].fontWeight + ';\n';
  css += '  --text-' + k + '--letter-spacing: ' + fontSizes[k][1].letterSpacing + ';\n';
}

css += '}\n\n';
css += '.material-symbols-outlined { font-family: "Material Symbols Outlined"; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: "liga"; -webkit-font-smoothing: antialiased; }\n';
css += '.btn-primary { transition: background-color 100ms ease; }\n';
css += '.btn-primary:hover { background-color: var(--color-primary); }\n';
css += '.card-active-lock:focus-within { border-color: var(--color-primary); }\n';
css += '.card-active-lock:focus-within::after { content: ""; position: absolute; top: 0; right: 0; width: 4px; height: 4px; background-color: var(--color-primary); }\n';

fs.writeFileSync('src/app/globals.css', css);
console.log('Successfully generated globals.css for Tailwind v4');
