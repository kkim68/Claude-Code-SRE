const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const distDir = './server/dist';
const dirs = ['./server/dist', './server/dist/db', './server/dist/middleware', './server/dist/routes']

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let code = fs.readFileSync(filePath, 'utf-8');

    // Pass 1 - Control Flow Flattening
    code = JavaScriptObfuscator.obfuscate(code, {
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: false,
      stringArray: false,
      rotateStringArray: false,
    }).getObfuscatedCode();

    // Pass 2 - RC4 String Array Encoding
    code = JavaScriptObfuscator.obfuscate(code, {
      controlFlowFlattening: false,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayShuffle: true,
      rotateStringArray: true,
      stringArrayThreshold: 1,
    }).getObfuscatedCode();

    // Pass 3 - Dead Code Injection
    code = JavaScriptObfuscator.obfuscate(code, {
      controlFlowFlattening: false,
      stringArray: false,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.5,
    }).getObfuscatedCode();

    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Obfuscated: ${file}`);
  }  
}