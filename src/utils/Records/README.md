# Records Export Utilities

This directory contains utilities for exporting data in different formats, specifically Excel and PDF.

## PdfGenerator

The `PdfGenerator` class provides functionality to generate landscape PDF reports with auto-fitting tables, similar to the `ExcelGenerator` but optimized for PDF output.

### Features

- **Landscape Orientation**: Automatically generates PDFs in landscape mode for better table visibility
- **Auto-fit Tables**: Automatically adjusts font size and column widths to fit content horizontally
- **Master Headers**: Includes "MARANATHA" branding and custom titles
- **Filter Display**: Shows applied filters in the PDF header
- **Footer Support**: Supports totals and other footer data
- **Page Numbers**: Automatically adds page numbers to each page
- **Responsive Design**: Handles tables with many columns by reducing font size

### Usage

```typescript
import { PdfGenerator } from '@/utils/Records/PdfGenerator';

// Basic usage
const base64Data = await PdfGenerator.generatePdfFrom({
    filters: [
        {
            id: 'date_range',
            name: 'Date Range',
            isRequired: true,
            type: 'daterange',
            value: {
                name: 'Date Range',
                value: {
                    start: '2024-01-01T00:00:00.000Z',
                    end: '2024-01-31T23:59:59.999Z'
                }
            }
        }
    ],
    data: {
        headers: [
            { key: 'id', title: 'ID' },
            { key: 'name', title: 'Product Name' },
            { key: 'price', title: 'Price' }
        ],
        body: [
            { id: 1, name: 'Product A', price: 25.99 },
            { id: 2, name: 'Product B', price: 15.50 }
        ],
        footer: {
            totals: {
                items: [
                    { key: 'price', value: 41.49 }
                ]
            }
        }
    },
    title: 'Product Report'
});

// Use with Toolbox.share for downloading
Toolbox.share('report.pdf', base64Data);
```

### Data Structure

#### IRecordFilter
```typescript
interface IRecordFilter {
    id: string;
    name: string;
    isRequired: boolean;
    type: string;
    options?: any[];
    value?: any;
}
```

#### IRecordData
```typescript
interface IRecordData {
    headers: Array<{ key: string; title: string }>;
    body: any[];
    footer?: {
        totals?: {
            items: Array<{ key: string; value: any }>;
        };
    };
    rules?: any;
    query: any;
}
```

### Methods

#### `generatePdfFrom(options)`
Generates a PDF from the provided data structure.

**Parameters:**
- `options.filters`: Array of filter objects to display in header
- `options.data`: Data structure containing headers, body, and optional footer
- `options.title`: Title to display in the PDF header

**Returns:** Promise that resolves to base64 string of the PDF

#### `generateCustomPdfFrom(callback)`
Generates a custom PDF using a callback function for advanced customization.

**Parameters:**
- `callback`: Function that receives a jsPDF instance for custom manipulation

**Returns:** Promise that resolves to base64 string of the PDF

### Auto-fitting Algorithm

The PDF generator automatically adjusts the layout to fit content:

1. **Font Size Calculation**: Starts with base font size (12pt) and reduces based on number of columns
2. **Column Width Optimization**: Calculates optimal column widths based on content length
3. **Content Truncation**: Truncates very long content to prevent layout issues
4. **Minimum Constraints**: Ensures minimum font size (6pt) and column width (12mm) for readability

### Integration with Existing Code

The PdfGenerator is designed to be a drop-in replacement for ExcelGenerator in many cases:

```typescript
// Instead of ExcelGenerator.generateExcelFrom
const excelData = await ExcelGenerator.generateExcelFrom(options);

// Use PdfGenerator.generatePdfFrom
const pdfData = await PdfGenerator.generatePdfFrom(options);
```

### Limitations

- **Cell Merging**: jsPDF autoTable doesn't support cell merging like Excel. Merging rules are logged as warnings.
- **Complex Formatting**: Limited compared to Excel's rich formatting capabilities
- **Large Datasets**: Very large datasets may require pagination optimization

### Testing

Use the provided test file `PdfGenerator.test.ts` to test the functionality:

```typescript
import { testPdfGeneration, testPdfGenerationWithManyColumns } from '@/utils/Records/PdfGenerator.test';

// Test basic functionality
await testPdfGeneration();

// Test with many columns
await testPdfGenerationWithManyColumns();
```

## ExcelGenerator

The `ExcelGenerator` class provides functionality to generate Excel files with similar data structures. See the main ExcelGenerator.ts file for detailed documentation.
