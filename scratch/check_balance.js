
const fs = require('fs');
const content = fs.readFileSync('/Users/ralphkaram/Desktop/robi-seo-site/src/app/[locale]/blog/[slug]/page.tsx', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;

for (let i = 0; i < 1305; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Simple counter (doesn't handle strings/comments but gives a hint)
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
    }
}

console.log(`At line 1305:`);
console.log(`Braces: ${braceCount}`);
console.log(`Parens: ${parenCount}`);
console.log(`Brackets: ${bracketCount}`);
