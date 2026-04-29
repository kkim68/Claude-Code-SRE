const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const baseDir = './server/dist';

const files = [
  'index.js',
  'middleware/auth.js',
  'routes/auth.js',
  'routes/reviews.js',
  'routes/watchlist.js',
  'db/init.js',
];

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let code = fs.readFileSync(filePath, 'utf-8');

  // Layer 1 - Control Flow Flattening + Hexadecimal Identifiers
  code = JavaScriptObfuscator.obfuscate(code, {
    target: 'node',
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    identifierNamesGenerator: 'hexadecimal',
  }).getObfuscatedCode();
  console.log(`Layer 1 done: ${file}`);

  // Layer 2 - RC4 String Array Encoding
  code = JavaScriptObfuscator.obfuscate(code, {
    target: 'node',
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 0.85,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    splitStrings: true,
    splitStringsChunkLength: 4,
    stringArrayWrappersCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayWrappersChainedCalls: true,
    transformObjectKeys: true,
  }).getObfuscatedCode();
  console.log(`Layer 2 done: ${file}`);

  // Layer 3 - Dead Code Injection
  code = JavaScriptObfuscator.obfuscate(code, {
    target: 'node',
    compact: true,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
  }).getObfuscatedCode();
  console.log(`Layer 3 done: ${file}`);

  fs.writeFileSync(filePath, code, 'utf-8');
}