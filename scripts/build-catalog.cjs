'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, loadMaster, renderOutputs } = require('./catalog-data.cjs');
try {
  // Validate before writing. Protected guides contain public lock shells only.
  const outputs = renderOutputs(loadMaster());
  const check = process.argv.includes('--check');
  for (const [name, content] of outputs) {
    const target = path.join(ROOT, 'dist', name);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
        throw new Error(`Generated output is stale: ${name}. Run npm run build.`);
      }
    } else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
      fs.writeFileSync(target, content, 'utf8');
    }
  }
  console.log(`${check ? 'Verified' : 'Built'} ${outputs.size} generated files; protected guides use metadata-only lock shells.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
