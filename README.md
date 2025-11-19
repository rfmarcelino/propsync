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

**For List Pages A & B (filtering with checkboxes/sliders):**
- `.bedroom-wrapper` → `.bedroom-value`
- `.price-range` → `.price-min-handler`, `.price-max-handler`, `.price-range-bar`, `.price-min`, `.price-max`
- `.sqr-range` → `.sqr-min-handler`, `.sqr-max-handler`, `.sqr-range-bar`, `.sqr-min`, `.sqr-max`
- `.button-filter`, `.button-reset`
- `.items-summary` → `.results-count` (total before filter), `.items-count` (after filter)

**For Tab-Based Filtering (alternative to checkboxes/sliders):**
- `.propsync-tabs` → Container for tab elements
  - Automatically generates tabs based on available apartment types
  - Creates "View All" tab (active by default) and individual tabs for each bedroom count
  - Tab structure: `.tab__link` → `.button-text`
  - Active tab has `.active` class
  - **Note:** Tab filtering and checkbox/slider filtering are mutually exclusive - only one type will be active

**For All Page Types (cards):**
- `.card-wrapper` → `.bedroom-card-value`, `.bathroom-card-value`, `.sqr-min-card-value`, `.sqr-spacer`, `.sqr-max-card-value`, `.startingat`, `.price-min-dollar`, `.price-min-card-value`, `.price-spacer`, `.price-max-dollar`, `.price-max-card-value`

**For Availability Display (optional, for any card):**
- `.availability-wrapper` → `.available-items` (count), `.available-text` (label), `.available-sold-out` (sold out text)
  - If `.available-items` = 0: Shows `.available-sold-out`, hides others
  - If `.available-items` > 9: Replaces with "9+", shows `.available-text`
  - If `.available-items` = 1-9: Shows count and `.available-text`, hides `.available-sold-out`

**For Price Sold Out Handling:**
- If `.price-min-card-value` < 0 (e.g., -1): Replaced with "Sold Out", hides dollar signs, spacer, max price, and "Starting at" text

## 🏷️ Automatic Text Replacement

**Studio Label Replacement:**
- Automatically replaces "0 Bedroom" with "Studio" throughout the page
- Applies to all `.bedroom-card-value` elements with value "0"
- Hides sibling elements containing "Bedroom" text when replacement occurs
- Works across all page types (list pages, accordions, cards)

## 📑 Tab-Based Filtering

When `.propsync-tabs` is present on the page, the script automatically generates a tab-based filter system.

### How It Works
1. **Automatic Tab Generation**: Creates tabs dynamically based on unique bedroom counts found in `.card-wrapper` elements
2. **Tab Labels**:
   - "Studio" for 0 bedrooms
   - "1 Bedroom" for 1 bedroom
   - "X Bedroom" for other counts
3. **View All Tab**: Always includes a "View All" tab (active by default) that shows all cards
4. **Single Active Tab**: Only one tab can be active at a time - clicking a tab removes `.active` from others and adds it to the clicked tab
5. **Exclusive Mode**: When tabs are present, checkbox/slider filtering is disabled (they never co-exist)

### Example HTML Structure
```html
<div class="propsync-tabs">
  <!-- Tabs are automatically generated -->
  <!-- "View All" tab will be created with .active class -->
  <!-- Individual tabs for each bedroom type will be added -->
</div>
```

### Tab Markup (Generated)
```html
<div class="propsync-tabs">
  <div class="tab__link active" data-bedroom-filter="all">
    <div class="button-text">View All</div>
  </div>
  <div class="tab__link" data-bedroom-filter="0">
    <div class="button-text">Studio</div>
  </div>
  <div class="tab__link" data-bedroom-filter="1">
    <div class="button-text">1 Bedroom</div>
  </div>
  <!-- More tabs for other bedroom counts... -->
</div>
```

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

## 🐛 Debugging - Filter Class Diagnostics

If filtering isn't working, the script will automatically log diagnostics to help identify missing CSS classes.

### What Gets Logged
When the page loads and if at least **2 filter-related classes are found**, the script checks for missing classes.

**Important:** If the ONLY missing class is `.button-filter`, no warning is shown because:
- ✅ Auto-submit mode automatically handles this
- ✅ Filtering will still work perfectly
- ✅ `.button-filter` is completely optional

The diagnostic only shows warnings if OTHER required classes are missing, which indicates a real configuration issue.

### How to Check
1. Open browser **Developer Tools** (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. If there are real issues, you'll see `🔍 PropSync Filter Diagnostics:`
4. Missing classes will be listed with `❌ Missing required classes:`

### Example Output (Actual Problem)
```
🔍 PropSync Filter Diagnostics:
   Found 24/27 required classes
   ❌ Missing required classes:
      - .price-min-handler
      - .price-max-handler
      - .price-range-bar
```

### Silent Success Case
If only `.button-filter` is missing, you'll see:
```
✅ PropSync filtering initialized with 3 cards
📱 Auto-submit mode enabled (button-filter missing)
```

This means everything is working perfectly with auto-submit enabled!

## ⚡ Auto-Submit Filters (Fallback Mode)

If the **`.button-filter`** button is missing from your page, the script automatically enables **auto-submit mode**.

### How It Works
Instead of requiring users to click a filter button, filters are applied automatically when:
- ✅ A bedroom checkbox is checked/unchecked
- ✅ A price range slider is dragged
- ✅ A square footage slider is dragged

### When It Activates
Auto-submit is automatically enabled if:
1. Filter elements exist on the page (at least 2 required classes found)
2. The `.button-filter` element is **missing**

### Key Features
- **Filtering Always Works**: Even without `.button-filter` or `.button-reset` buttons
- **Bedroom Wrapper Visibility**: Correctly shows/hides bedroom options based on available cards
- **Immediate Feedback**: Filters apply instantly as users interact with controls

### Console Indicator
When auto-submit activates, you'll see:
```
📱 Auto-submit mode enabled (button-filter missing)
```

When tab filtering activates, you'll see:
```
📑 Tab filtering mode enabled
```

## 🎯 Filtering Modes Summary

The script supports three filtering modes:

1. **Standard Filtering** (with `.button-filter`): Users click filter button to apply changes
2. **Auto-Submit Filtering** (without `.button-filter`): Filters apply automatically on interaction
3. **Tab Filtering** (with `.propsync-tabs`): Tab-based filtering replaces checkbox/slider system

**Important:** Tab filtering and checkbox/slider filtering are mutually exclusive. If `.propsync-tabs` is present, only tab filtering will be active.
