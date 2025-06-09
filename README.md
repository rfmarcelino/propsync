# PropSync JavaScript Library

Centralized JavaScript files for PropSync pages with automatic compression and CDN delivery.

## 🚀 Quick Start

### Using the Scripts

Add these script tags to your pages **before the closing `</body>` tag**:

```html
<!-- For Page Template (Floor Plans A, B, C and PropSync Floor Plans Template) -->
<script src="https://products.pages.omibee.com/propsync/propsync-page-template.js"></script>

<!-- For List Pages A & B (with filtering) -->
<script src="https://products.pages.omibee.com/propsync/propsync-list-page-a-b.js"></script>

<!-- For List Page C (with accordion) -->
<script src="https://products.pages.omibee.com/propsync/propsync-list-page-c.js"></script>
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

public/                 # GitLab Pages deployment (auto-generated)
├── propsync-page-template.js
├── propsync-list-page-a-b.js
└── propsync-list-page-c.js
```

## 🌐 GitLab Pages CDN Benefits

- **Global CDN**: Files served from edge locations worldwide
- **HTTPS**: Secure delivery by default
- **Caching**: Automatic browser and CDN caching
- **High Availability**: 99.9% uptime guarantee
- **Fast**: Optimized for static file delivery

## 🛠 Development

### Automated Building (GitLab CI + Pages)
The build process is **fully automated**! When you push changes to `src/` files:

1. **GitLab CI** automatically runs `npm run build`
2. **Compressed files** are generated in `dist/`
3. **Files are deployed** to GitLab Pages CDN
4. **CDN links** are immediately updated and cached globally

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Watch and build changes automatically
npm run build        # Build once (manual)
```

### Required CSS Classes

**For List Pages A & B (filtering):**
- `.bedroom-wrapper` → `.bedroom-value`
- `.price-range` → `.price-min-handler`, `.price-max-handler`, `.price-range-bar`, `.price-min`, `.price-max`
- `.sqr-range` → `.sqr-min-handler`, `.sqr-max-handler`, `.sqr-range-bar`, `.sqr-min`, `.sqr-max`
- `.button-filter`, `.button-reset`

**For All Page Types (cards):**
- `.card-wrapper` → `.bedroom-card-value`, `.bathroom-card-value`, `.sqr-min-card-value`, `.sqr-spacer`, `.sqr-max-card-value`, `.startingat`, `.price-min-dollar`, `.price-min-card-value`, `.price-spacer`, `.price-max-dollar`, `.price-max-card-value`

## 🔄 Workflow

### For Developers
1. **Edit** files in `src/` directory
2. **Push** to master/main branch
3. **GitLab CI** automatically builds and deploys to Pages
4. **CDN links** are immediately available globally

### For Local Development
1. **Clone** the repository
2. **Run** `npm install`
3. **Run** `npm run dev` to watch for changes
4. **Edit** files in `src/` and see builds in `dist/`

## 📊 Compression Stats

- **propsync-list-page-a-b.js**: 20.9KB → 8.2KB (61% smaller)
- **propsync-list-page-c.js**: 7.2KB → 3.1KB (57% smaller)
- **propsync-page-template.js**: 3.4KB → 1.5KB (57% smaller)
