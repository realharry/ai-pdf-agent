# AI PDF Agent

AI PDF Agent is a Chrome extension that allows users to manipulate PDF files which are open in the browser. Users can split, delete, reorder, and append pages from multiple PDFs. Its side panel UI features an option to download the modified PDFs. It's built with React, Shadcn UI components, and Tailwind CSS.

## Features

- **PDF Detection**: Automatically detects PDF files in the current browser tab
- **Split Pages**: Extract specific pages from a PDF into a new document
- **Delete Pages**: Remove unwanted pages from a PDF
- **Reorder Pages**: Rearrange pages in any order you specify
- **Extract Pages**: Create a new PDF with only selected pages
- **Download Results**: All modified PDFs can be downloaded instantly

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components
- **PDF.js** - PDF parsing and rendering
- **pdf-lib** - PDF manipulation and generation
- **Chrome Extensions Manifest V3** - Latest Chrome extension format

## Installation

### For Development

1. Clone the repository:
```bash
git clone https://github.com/realharry/ai-pdf-agent.git
cd ai-pdf-agent
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

**Note**: You may see a Tailwind CSS warning about `bg-background` during the build. This is expected and doesn't affect functionality. The build process includes a post-build script that correctly positions all files for the Chrome extension.

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder from your project

### For Users

1. Download the latest release from the releases page
2. Extract the ZIP file
3. Follow step 4 from the development instructions above

## Usage

1. **Navigate to a PDF**: Open any PDF file in your Chrome browser (local file or web URL)

2. **Open the Side Panel**: Click the AI PDF Agent extension icon in your browser toolbar

3. **Perform Operations**:
   - **Split/Extract Pages**: Enter page numbers like "1,3,5-8" to work with specific pages
   - **Delete Pages**: Select pages to remove from the PDF
   - **Reorder Pages**: Specify the new order like "3,1,2,4-6"

4. **Download**: All operations automatically trigger a download of the modified PDF

## Page Number Format

When specifying pages, use this format:
- Single pages: `1,3,5`
- Page ranges: `1-5,8-10`
- Mixed: `1,3,5-8,12`

Page numbers are 1-indexed (first page is page 1).

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── background/          # Chrome extension background script
├── content/            # Content script for PDF detection
├── sidepanel/          # React app for the side panel UI  
├── components/ui/      # Reusable UI components
├── lib/               # Utility functions and PDF operations
└── types/             # TypeScript type definitions
```

## Browser Permissions

The extension requires these permissions:
- `activeTab` - Access the current tab to detect PDFs
- `sidePanel` - Display the side panel interface
- `storage` - Store user preferences (future feature)
- Host permissions for PDF access on all URLs

## Limitations

- Only works with PDFs that are directly accessible (some embedded PDFs may not work)
- Large PDFs may take longer to process
- Generated PDFs maintain the quality of the original

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

**Extension not detecting PDF**: Make sure the PDF is loaded directly in the browser tab, not embedded in another webpage.

**Build errors**: Try deleting `node_modules` and running `npm install` again.

**Permission errors**: Ensure all required permissions are granted when installing the extension.
