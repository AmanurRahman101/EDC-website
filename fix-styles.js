const fs = require('fs');
let p = fs.readFileSync('src/app/page.tsx', 'utf8');

p = p.replace(/style="font-variation-settings: 'FILL' 1;"/g, "style={{ fontVariationSettings: '\"FILL\" 1' }}");
p = p.replace(/style="background-image: repeating-linear-gradient\(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%\); background-size: 10px 10px;"/g, "style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}");

fs.writeFileSync('src/app/page.tsx', p);
console.log('Fixed inline styles');
