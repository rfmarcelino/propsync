# Webflow CSS Class Mapping Guide

## 🎯 Required Classes for Floor Plans A Page

### Filter Section Classes

#### Bedroom Filter
- **Each bedroom option container** → Add class: `bedroom-wrapper`
- **The number inside each option** (1, 2, 3, etc.) → Add class: `bedroom-value`
- **The checkbox input** → Keep existing, script will find it automatically

#### Filter Buttons
- **"Filter" button** → Add class: `button-filter`
- **Reset button** (if you have one) → Add class: `button-reset`

#### Price Range Slider
- **Price slider container** → Add class: `price-range`
- **Left handle** → Add class: `price-min-handler`
- **Right handle** → Add class: `price-max-handler`
- **The bar between handles** → Add class: `price-range-bar`
- **Min price display** (shows $) → Add class: `price-min`
- **Max price display** (shows $) → Add class: `price-max`

#### Area Range Slider
- **Area slider container** → Add class: `sqr-range`
- **Left handle** → Add class: `sqr-min-handler`
- **Right handle** → Add class: `sqr-max-handler`
- **The bar between handles** → Add class: `sqr-range-bar`
- **Min area display** (shows sqft) → Add class: `sqr-min`
- **Max area display** (shows sqft) → Add class: `sqr-max`

### Floor Plan Cards Classes

#### Each Floor Plan Card
- **Each floor plan card container** → Add class: `card-wrapper`

#### Data Elements in Each Card
Based on "Yale1Bed/1Bath/821-821Sqft Starting at$1778-$1778":

- **Bedroom count** (the "1" in "1Bed") → Add class: `bedroom-card-value`
- **Bathroom count** (the "1" in "1Bath") → Add class: `bathroom-card-value`
- **Min square footage** (first "821") → Add class: `sqr-min-card-value`
- **Max square footage** (second "821") → Add class: `sqr-max-card-value`
- **Spacer between sqft values** (the "-") → Add class: `sqr-spacer`
- **Min price** (first "$1778") → Add class: `price-min-card-value`
- **Max price** (second "$1778") → Add class: `price-max-card-value`
- **Spacer between prices** (the "-") → Add class: `price-spacer`
- **"Starting at" text** → Add class: `startingat`
- **Dollar signs** → Add classes: `price-min-dollar`, `price-max-dollar`

### Results Count (Optional)
- **"Showing X results"** → Add attribute: `fs-cmsfilter-element="results-count"`
- **"of Y items"** → Add attribute: `fs-cmsfilter-element="items-count"`

## 🔧 Implementation Steps

1. **Add the script** (you've done this):
   ```html
   <script src="https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-list-page-a-b.js"></script>
   ```

2. **Add classes to filter elements** in Webflow Designer

3. **Add classes to each floor plan card** in Webflow Designer

4. **Test the functionality** by opening browser console and checking for errors

## 🧪 Testing Checklist

After adding classes, test:
- [ ] Console shows "Initializing filters..." message
- [ ] Bedroom filters show/hide based on available options
- [ ] Price slider works and updates display
- [ ] Area slider works and updates display
- [ ] Filter button applies filters
- [ ] Cards show/hide based on filter criteria
- [ ] Results count updates

## 🚨 Common Issues

- **Missing container classes**: Ensure parent containers have the right classes
- **Text parsing**: Make sure price/sqft values are in separate elements
- **Slider structure**: Range sliders need specific HTML structure
- **Case sensitivity**: CSS classes are case-sensitive
