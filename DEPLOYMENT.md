# Deployment Guide for AI PDF Agent

## Quick Start for Testing

1. **Build the extension**:
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Test the extension**:
   - Open any PDF file in Chrome (try a simple PDF from the web)
   - Click the AI PDF Agent icon in the toolbar
   - The side panel should open with PDF manipulation options

## File Structure after Build

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
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Testing PDFs

Good test PDFs to try:
- Any PDF from Mozilla's PDF.js examples
- Simple single-page PDFs from the web
- Multi-page documents like research papers

## Common Issues

1. **PDF not detected**: Some embedded PDFs don't work. Try opening the PDF directly in a new tab.

2. **Build warnings about Tailwind**: These are cosmetic and don't affect functionality.

3. **Large bundle size**: The pdf.js and pdf-lib libraries are large but necessary for PDF manipulation.

## Production Deployment

For production deployment to Chrome Web Store:
1. Update version in `manifest.json` and `package.json`
2. Build with `npm run build`
3. Create a ZIP of the `dist` folder
4. Upload to Chrome Web Store Developer Dashboard