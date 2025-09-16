// Basic test file to verify PDF operations work
// This is a simple test that could be expanded with a proper test framework

import { PDFDocument } from 'pdf-lib';

async function createTestPDF() {
  const pdfDoc = await PDFDocument.create();
  
  // Add 3 test pages
  for (let i = 1; i <= 3; i++) {
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(`Page ${i}`, {
      x: 250,
      y: 200,
      size: 24,
    });
  }
  
  return await pdfDoc.save();
}

async function testPDFOperations() {
  try {
    console.log('Creating test PDF...');
    const testPdfBytes = await createTestPDF();
    console.log('✓ Test PDF created successfully');
    
    // Test loading the PDF
    console.log('Loading PDF for testing...');
    const loadedDoc = await PDFDocument.load(testPdfBytes);
    const pageCount = loadedDoc.getPageCount();
    console.log(`✓ PDF loaded successfully with ${pageCount} pages`);
    
    // Test splitting (extract first 2 pages)
    console.log('Testing PDF splitting...');
    const newDoc = await PDFDocument.create();
    const [page1, page2] = await newDoc.copyPages(loadedDoc, [0, 1]);
    newDoc.addPage(page1);
    newDoc.addPage(page2);
    const splitBytes = await newDoc.save();
    console.log('✓ PDF splitting test passed');
    
    console.log('All tests passed! ✅');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for potential use
export { testPDFOperations, createTestPDF };