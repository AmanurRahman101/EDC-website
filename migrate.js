const fs = require('fs');
let html = fs.readFileSync('_legacy/index.html', 'utf8');

// Extract the body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) process.exit(1);

let bodyHtml = bodyMatch[1];

// Convert HTML to JSX
bodyHtml = bodyHtml.replace(/class=/g, 'className=');
bodyHtml = bodyHtml.replace(/for=/g, 'htmlFor=');
bodyHtml = bodyHtml.replace(/<!--[\s\S]*?-->/g, ''); // remove comments
bodyHtml = bodyHtml.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
bodyHtml = bodyHtml.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
bodyHtml = bodyHtml.replace(/<br>/g, '<br />');

// Since we placed the body flex classes in layout.tsx, we just need to return the children
const pageTsx = `
export default function Home() {
  return (
    <>
      ${bodyHtml}
    </>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', pageTsx);
console.log('Successfully generated page.tsx');
