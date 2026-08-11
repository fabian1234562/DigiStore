import fs from 'fs';
const path = require('path');

with open(path + '/src/lib/store.ts', 'r') as f: content = f.read();

lines = content.split('\n');
let writeStart = 0; let writeBuffer = ''; let changes = 0; let imgCount = 0;
const svgData: Record<string, string> = {};

for (const line of lines) {
  if (line.trim().length === 0) continue;
  writeBuffer += line + '\n';
  if (line.includes("image: ''")) {
    const imgId = line.trim().split("image: '")[1];
    if (imgId === '') {
      writeBuffer += line + '\n';
      changes++;
    } else {
      // Check if we have SVG data for this platform
      const plat = line.split("platform: '")[1]?.trim();
      const svgKey = plat.replace(/[^a-zA-Z0-9]/g, '');
      if (svgData[svgKey]) {
        // Replace image: '' with data:imageUri
        writeBuffer += line.replace(\`image: ''\`, `image: 'data:image/png;charset=utf-8;base64,${svgData[svgKey]}'\n`);
        imgCount++;
      } else {
        writeBuffer += line + '\n';
        changes++;
      }
  }
}

with open(path + '/src/lib/store.ts', 'w') as f:
  f.write(writeBuffer);
console.log(`Updated ${changes} lines, added ${imgCount} SVG data URIs`);
console.log('Total products:', content.split("id: '").length);
