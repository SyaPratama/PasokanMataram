import fs from 'fs';
import path from 'path';

const candidatePaths = [
  path.resolve('node_modules/next/dist/compiled/@next/font/dist/google/loader.js'),
  path.resolve('apps/web/node_modules/next/dist/compiled/@next/font/dist/google/loader.js'),
];

for (const targetFile of candidatePaths) {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');
    const target = '/\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1]';
    const replacement = '(/\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl) || [, "woff2"])[1]';
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log(`[patch-next-font] Patched ${targetFile}`);
    }
  }
}
