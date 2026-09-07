/**
 * @fileoverview EduAsas Clean Utility Script
 * @description Automatically purges development caches, build artifacts, 
 * TypeScript build info files, and temporary bundler folders.
 * @author Injinia Rollboy (EduAsas Tech)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pata path ya sasa ya mradi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Orodha ya mafaili na folda za taka (dev files & build artifacts) zinazopaswa kufutwa
// Orodha iliyoboreshwa ya mafaili na folda za taka (pamoja na zile za ndani ya node_modules)
const TARGETS_TO_CLEAN = [
    // TypeScript build info kwenye root
    '.tsbuildinfo',
    'tsconfig.tsbuildinfo',
    
    // Caches zilizojificha ndani ya node_modules
    path.join('node_modules', '.vite'),
    path.join('node_modules', '.cache'),
    path.join('node_modules', '.tsbuildinfo'),
    
    // Bundler & Framework Caches za nje
    '.turbo',
    '.next',
    'dist',
    'build',
    '.parcel-cache',
    
    // Logs na temporary files
    'npm-debug.log*',
    'yarn-error.log*',
    'pnpm-debug.log*'
];

/**
 * Kazi ya kufuta faili au folda kwa usalama
 */
function removeRecursive(targetPath) {
    if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        if (stats.isDirectory()) {
            fs.rmSync(targetPath, { recursive: true, force: true });
            console.log(`🗑️  Folder limefutwa: [ ${targetPath} ]`);
        } else {
            fs.unlinkSync(targetPath);
            console.log(`🗑️  Faili limefutwa:   [ ${targetPath} ]`);
        }
    }
}

console.log('🧹 Inaanzisha zoezi la kusafisha dev files na build info kwenye EduAsas...\n');

let deletedCount = 0;

// Zunguka kwenye orodha na ufute kilichopo
TARGETS_TO_CLEAN.forEach((target) => {
    // Angalia kama kuna wildcard (kama log files)
    if (target.includes('*')) {
        // Kwa ajili ya unyenyekevu, tafuta kwenye root directory
        const files = fs.readdirSync(__dirname);
        files.forEach((file) => {
            if (file.startsWith(target.replace('*', ''))) {
                removeRecursive(path.join(__dirname, file));
                deletedCount++;
            }
        });
    } else {
        const fullPath = path.join(__dirname, target);
        if (fs.existsSync(fullPath)) {
            removeRecursive(fullPath);
            deletedCount++;
        }
    }
});

console.log(`\n✨ Safishara imekamilika kikamilifu! Jumla ya vitu ${deletedCount} vimefutwa.`);