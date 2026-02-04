import { readFileSync, writeFileSync } from 'fs';

const fixes = [
  ['server/_core/sdk.ts', 'parse'],
  ['server/_core/vite.ts', 'type Server'],
  ['server/_core/vite.ts', 'createServer'],
  ['server/agents/scribe.ts', 'fillPromptTemplate'],
  ['server/b2b-router.ts', 'invokeLLM'],
  ['server/cache.test.ts', 'CacheTTL'],
  ['server/db.ts', 'contacts'],
  ['server/db.ts', 'type Achievement'],
  ['server/db.ts', 'type Skill'],
  ['server/db.ts', 'type JobDescription'],
];

console.log('Removing unused imports...');
let count = 0;

fixes.forEach(([file, importName]) => {
  try {
    let content = readFileSync(file, 'utf-8');
    const before = content;
    
    const escaped = importName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(`\\s*,?\\s*${escaped}\\s*,?`, 'g'), '');
    content = content.replace(/{\s*,/g, '{');
    content = content.replace(/,\s*}/g, '}');
    
    if (content !== before) {
      writeFileSync(file, content);
      count++;
    }
  } catch (e) {}
});

console.log(`Removed ${count} unused imports`);
