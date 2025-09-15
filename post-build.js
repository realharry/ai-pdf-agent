#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, 'dist');
const srcSidepanelPath = join(distPath, 'src', 'sidepanel', 'index.html');
const targetSidepanelPath = join(distPath, 'sidepanel', 'index.html');

try {
  // Check if the HTML file was created in the wrong location
  if (existsSync(srcSidepanelPath)) {
    console.log('Moving HTML file from src/sidepanel to sidepanel...');
    
    // Read the HTML content
    let htmlContent = readFileSync(srcSidepanelPath, 'utf8');
    
    // Fix the script and CSS paths to be relative
    htmlContent = htmlContent.replace(/src="\/sidepanel\/([^"]+)"/g, 'src="./$1"');
    htmlContent = htmlContent.replace(/href="\/assets\/([^"]+)"/g, 'href="../assets/$1"');
    
    // Write to the correct location
    writeFileSync(targetSidepanelPath, htmlContent);
    console.log('HTML file moved and paths fixed.');
    
    // Remove the incorrect src directory
    rmSync(join(distPath, 'src'), { recursive: true, force: true });
    console.log('Cleaned up incorrect src directory.');
  } else {
    console.log('HTML file is already in the correct location.');
  }
} catch (error) {
  console.error('Post-build script failed:', error);
  process.exit(1);
}