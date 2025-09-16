# AI PDF Agent - Chrome Extension

AI PDF Agent is a Chrome extension that allows users to manipulate PDF files open in the browser. Users can split, delete, reorder, and append pages from multiple PDFs. It's built with React, TypeScript, Vite, Shadcn UI components, and Tailwind CSS using Chrome Extensions Manifest V3.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Setup
- Install dependencies: `npm install` -- takes ~16 seconds. Set timeout to 60+ seconds.
- Build the extension: `npm run build` -- takes ~10 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
  - This runs TypeScript compilation, Vite build, and post-build script to position files correctly
  - Expected warning about `bg-background` from Tailwind CSS is harmless
  - Creates a complete Chrome extension in the `dist/` folder

### Development Commands
- Start dev server: `npm run dev` -- starts Vite dev server on http://localhost:5173/ for React component development
- Build for production: `npm run build` -- NEVER CANCEL. Set timeout to 120+ seconds.
- Post-build script: `npm run post-build` -- runs automatically after build, fixes HTML paths and file positioning
- Lint (BROKEN): `npm run lint` -- ESLint v9 config issue, use `.eslintrc.cjs` with older ESLint or migrate config

### Chrome Extension Testing
- Load extension in Chrome:
  1. Build the extension first with `npm run build`
  2. Open Chrome and navigate to `chrome://extensions/`
  3. Enable "Developer mode" in top right
  4. Click "Load unpacked" and select the `dist` folder
- Test with any PDF file opened directly in Chrome browser tab (not embedded PDFs)
- Click the extension icon to open the side panel interface

## Validation Scenarios

**CRITICAL**: Always run these validation steps after making changes to ensure the extension works correctly:

### PDF Operations Validation
Run the comprehensive test: 
```bash
node --input-type=module --eval "import('./test/pdf-operations.test.js').then(m => m.testPDFOperations()).catch(console.error)"
```
Expected output: "All tests passed! ✅"

### Manual Chrome Extension Testing
1. Build the extension: `npm run build`
2. Load in Chrome following steps above
3. Open a test PDF (try: any PDF from web, research papers, multi-page documents)
4. Click extension icon - side panel should open with PDF manipulation options
5. Test operations: split pages (enter "1,3" to extract pages 1 and 3), delete pages, reorder pages
6. Verify downloads work correctly
7. **CRITICAL**: Extension only works with PDFs opened directly in browser tabs, NOT embedded PDFs

### Build Validation
After any changes, always run:
- `npm run build` -- must complete without errors (warnings about chunk size are expected)
- Verify `dist/` folder contains: `background.js`, `content.js`, `sidepanel/index.html`, `manifest.json`, `icons/`, `assets/`, `pdf.worker.min.js`

## Common Issues and Workarounds

### ESLint Configuration Issue
- `npm run lint` fails with ESLint v9 configuration error
- Workaround: Use external linting tools or migrate to new ESLint config format
- **DO NOT** add this to CI workflows until resolved

### PDF Detection Limitations
- Only works with PDFs directly accessible in browser tabs
- Some embedded PDFs may not be detected
- Large PDFs (>50MB) may cause performance issues

### Build Warnings
- Large bundle size warnings are expected due to pdf.js and pdf-lib libraries
- Tailwind CSS `bg-background` warning is cosmetic and doesn't affect functionality

## Project Structure

### Key Directories
```
src/
├── background/          # Chrome extension background service worker
├── content/            # Content script for PDF detection and data extraction
├── sidepanel/          # React app for the side panel UI (main interface)
├── components/ui/      # Reusable Shadcn UI components (Button, Card, Input, etc.)
├── lib/               # Core functionality (pdf-operations.ts, utils.ts)
└── types/             # TypeScript type definitions
```

### Important Files
- `public/manifest.json` -- Chrome extension manifest (copied to dist during build)
- `vite.config.ts` -- Build configuration with custom plugins for PDF.js worker
- `post-build.js` -- Script that fixes file paths and positioning after Vite build
- `test/pdf-operations.test.js` -- Functional tests for PDF manipulation
- `tailwind.config.js` -- UI styling configuration

### Build Output Structure
```
dist/
├── manifest.json           # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script
├── sidepanel/
│   ├── index.html        # Side panel HTML
│   └── sidepanel.*.js    # Side panel React app
├── assets/
│   └── *.css            # Styles
├── icons/               # Extension icons (16, 32, 48, 128px)
└── pdf.worker.min.js    # PDF.js worker for PDF processing
```

## Development Workflow

### Making Changes
1. Always run `npm install` first on fresh clone
2. Make code changes in `src/` directory
3. Test with `npm run build` -- NEVER CANCEL, wait for completion
4. Load extension in Chrome and test with real PDFs
5. Run validation: `node --input-type=module --eval "import('./test/pdf-operations.test.js').then(m => m.testPDFOperations()).catch(console.error)"`
6. Verify all functionality works before committing

### Testing Different Components
- **React UI**: Use `npm run dev` for component development
- **Background script**: Changes require extension reload in Chrome
- **Content script**: Changes require extension reload and page refresh
- **PDF operations**: Run test file for functional validation

### Performance Considerations
- Extension bundle is large (~1.1MB) due to PDF.js and pdf-lib dependencies
- PDF processing happens client-side in the browser
- Large PDFs may require longer processing times

## Dependencies and Technology Stack

### Core Dependencies
- **React 19** with TypeScript for UI
- **Vite 7** for build tooling and dev server  
- **pdf-lib** for PDF manipulation (split, merge, reorder)
- **pdfjs-dist** for PDF parsing and rendering
- **Tailwind CSS + Shadcn/ui** for styling and components

### Build Tools
- **TypeScript** compiler for type checking
- **ESLint** for code linting (currently has config issues)
- **PostCSS + Autoprefixer** for CSS processing
- **Chrome Extensions Manifest V3** for extension APIs

### File Processing
- PDF.js worker runs in separate thread for performance
- All PDF operations happen client-side (no server required)
- Generated PDFs maintain original quality

## Timing Expectations
- `npm install`: ~16 seconds
- `npm run build`: ~10 seconds (NEVER CANCEL - set 120+ second timeout)
- PDF operations test: ~2 seconds
- Chrome extension reload: ~1 second
- Processing 10-page PDF: ~2-5 seconds

**CRITICAL**: Always set appropriate timeouts and never cancel builds or long-running operations. Chrome extension development requires patience for reloading and testing cycles.