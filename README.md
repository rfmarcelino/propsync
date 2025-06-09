# PropSync JavaScript Library

A unified JavaScript solution for PropSync pages with automatic compression and CDN delivery.

## 🚀 Quick Start

### Using the Script

Add this script tag to your pages **before the closing `</body>` tag**:

```html
<!-- Unified PropSync Script for All Page Types -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync.js"></script>
```

## 📁 File Structure

```
src/
└── propsync.js      # Source file (uncompressed)

dist/
└── propsync.js      # Built file (compressed)
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
The build process is **fully automated**! When you push changes to `src/propsync.js`:

1. **GitHub Actions** automatically runs `npm run build`
2. The **compressed file** is generated in `dist/`
3. The **file is committed** back to the repository
4. **jsDelivr CDN** serves the latest compressed file within minutes

### Local Development
```bash
npm install          # Install dependencies
npm run watch        # Watch for file changes and build automatically
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
1. **Edit** the `src/propsync.js` file
2. **Push** to the master branch
3. **GitHub Actions** automatically builds and commits to the repo
4. **jsDelivr CDN** serves the updated file within minutes

### For Local Development
1. **Clone** the repository
2. **Run** `npm install`
3. **Run** `npm run watch` to watch for changes
4. **Edit** the `src/propsync.js` file and see the build output in `dist/`

## 🔧 jsDelivr CDN Features

### Version Control
```html
<!-- Always use latest (recommended for production) -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync.js"></script>

<!-- Pin to specific version/tag -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@v1.0.0/dist/propsync.js"></script>

<!-- Pin to specific commit -->
<script src="https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@abc1234/dist/propsync.js"></script>
```

### CORS Solution
jsDelivr automatically includes proper CORS headers - no additional attributes needed!

### Quick Test
```javascript
// Test in browser console
fetch('https://cdn.jsdelivr.net/gh/rfmarcelino/propsync@master/dist/propsync.js')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```
