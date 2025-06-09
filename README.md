# PropSync JavaScript Library

Centralized JavaScript files for PropSync pages with automatic compression and CDN delivery.

## 🚀 Quick Start

### Using the Scripts

Add these script tags to your pages **before the closing `</body>` tag**:

```html
<!-- For Page Template (Floor Plans A, B, C and PropSync Floor Plans Template) -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync-page-template.js"></script>

<!-- For List Pages A & B (with filtering) -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync-list-page-a-b.js"></script>

<!-- For List Page C (with accordion) -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync-list-page-c.js"></script>
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

## 🌐 jsDelivr CDN (GitHub)

- **Global CDN**: Fast delivery worldwide with edge caching
- **HTTPS**: Secure delivery by default
- **CORS Ready**: Full CORS support out of the box
- **Automatic Updates**: Files update within minutes after git push
- **Version Control**: Can access specific commits, branches, or tags
- **High Performance**: Optimized for speed and reliability
- **Free**: No cost for open source projects

## 🛠 Development

### Automated Building (GitHub Actions + jsDelivr)
The build process is **fully automated**! When you push changes to `src/` files:

1. **GitHub Actions** automatically runs `npm run build`
2. **Compressed files** are generated in `dist/`
3. **Files are committed** back to the repository
4. **jsDelivr CDN** serves the latest compressed files within minutes

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
3. **GitHub Actions** automatically builds and commits to repo
4. **jsDelivr CDN** serves updated files within minutes

### For Local Development
1. **Clone** the repository
2. **Run** `npm install`
3. **Run** `npm run dev` to watch for changes
4. **Edit** files in `src/` and see builds in `dist/`

## 🔧 jsDelivr CDN Features

### Version Control
```html
<!-- Always use latest (recommended for production) -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync-page-template.js"></script>

<!-- Pin to specific version/tag -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@v1.0.0/dist/propsync-page-template.js"></script>

<!-- Pin to specific commit -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@abc1234/dist/propsync-page-template.js"></script>
```

### CORS Solution
jsDelivr automatically includes proper CORS headers - no additional attributes needed!

### Quick Test
```javascript
// Test in browser console
fetch('https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync-page-template.js')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

## 📊 Compression Stats

- **propsync-list-page-a-b.js**: 20.9KB → 8.2KB (61% smaller)
- **propsync-list-page-c.js**: 7.2KB → 3.1KB (57% smaller)
- **propsync-page-template.js**: 3.4KB → 1.5KB (57% smaller)
