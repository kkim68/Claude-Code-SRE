1. Install Node.JS

-----------------------------------

2. Install javascript-obfuscator and typescript

$> npm install --save-dev javascript-obfuscator typescript


-----------------------------------

3. Server folder contains "Baseline" server source code.
   Install dependencies

$> npm install

-----------------------------------

4. Compile Type Script source codes without source map.
   Please refer to tsconfig.json file.

$> cd server && npx tsc

   Now we have compiles vanila javascript files.

-----------------------------------

5. Write 3-Pass Obfuscation script

[obfuscate.js file]

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

-----------------------------------

5. Perform Obfuscation

$> node obfuscate.js

-----------------------------------

6. Copy obfuscated codes into /server/dist folder in the original project

-----------------------------------

7. Make sure to remove original source codes and source maps before running /security-review

$> find ./dist -name "*.map" -delete

