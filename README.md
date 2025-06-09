# PropSync JavaScript Library

Centralized JavaScript files for PropSync pages with automatic compression and CDN delivery.

## 🚀 Quick Start

### Using the Scripts

Add these script tags to your pages **before the closing `</body>` tag**:

```html
<!-- For Page Template (Floor Plans A, B, C and PropSync Floor Plans Template) -->
<script src="https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-page-template.js"></script>

<!-- For List Pages A & B (with filtering) -->
<script src="https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-list-page-a-b.js"></script>

<!-- For List Page C (with accordion) -->
<script src="https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-list-page-c.js"></script>
```

## 📁 File Structure

```
src/                    # Source files (uncompressed)
├── propsync-page-template.js
├── propsync-list-page-a-b.js
└── propsync-list-page-c.js

dist/                   # Built files (compressed, ~60% smaller)
├── propsync-page-template.js
├── propsync-list-page-a-b.js
└── propsync-list-page-c.js
```

## 🛠 Development

### Building Scripts
```bash
npm install          # Install dependencies
npm run build        # Build all files
npm run build:watch  # Build and watch for changes
```

### Required CSS Classes

**For List Pages A & B (filtering):**
- `.bedroom-wrapper` → `.bedroom-value`
- `.price-range` → `.price-min-handler`, `.price-max-handler`, `.price-range-bar`, `.price-min`, `.price-max`
- `.sqr-range` → `.sqr-min-handler`, `.sqr-max-handler`, `.sqr-range-bar`, `.sqr-min`, `.sqr-max`
- `.button-filter`, `.button-reset`

**For All Page Types (cards):**
- `.card-wrapper` → `.bedroom-card-value`, `.bathroom-card-value`, `.sqr-min-card-value`, `.sqr-spacer`, `.sqr-max-card-value`, `.startingat`, `.price-min-dollar`, `.price-min-card-value`, `.price-spacer`, `.price-max-dollar`, `.price-max-card-value`

## 📊 Compression Stats

- **propsync-list-page-a-b.js**: 20.9KB → 8.2KB (61% smaller)
- **propsync-list-page-c.js**: 7.2KB → 3.1KB (57% smaller)
- **propsync-page-template.js**: 3.4KB → 1.5KB (57% smaller)
