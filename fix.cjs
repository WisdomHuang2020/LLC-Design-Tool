const fs = require('fs');
const path = require('path');
const file = path.join('src', 'pages', 'Derivations.tsx');
let content = fs.readFileSync(file, 'utf-8');

// Replace HTML entities
content = content.replace(/&gt;/g, '>').replace(/&lt;/g, '<');

// Wrap text-only lines containing { or } in {'...'}
const lines = content.split('\n');
const result = [];

for (let line of lines) {
  const stripped = line.trimStart();
  const indent = line.slice(0, line.length - stripped.length);
  
  // Skip JSX tags, imports, comments, code
  const skipPrefixes = ['<', 'import ', '//', '/*', 'const ', 'function ', 'export ', 'interface ', 'type ', 'let ', 'var ', 'return', '}', '{', '  >', '  })', '  )', '  />', '  </', '  {/*'];
  if (skipPrefixes.some(p => stripped.startsWith(p))) {
    result.push(line);
    continue;
  }
  
  // Skip already wrapped
  if (stripped.startsWith("{'") && stripped.endsWith("'}")) {
    result.push(line);
    continue;
  }
  
  // If line has { or } and no JSX tags, wrap in {'...'}
  if ((stripped.includes('{') || stripped.includes('}')) && !stripped.includes('<') && !stripped.includes('>')) {
    const escaped = stripped.replace(/'/g, "\\'");
    result.push(indent + "{'" + escaped + "'}");
    continue;
  }
  
  result.push(line);
}

fs.writeFileSync(file, result.join('\n'), 'utf-8');
console.log('Fixed Derivations.tsx');
