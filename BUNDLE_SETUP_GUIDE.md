# Bundle Display & Cart Transform Setup Guide

## Overview
This guide explains how to set up the bundle display on your Shopify product pages and enable cart transformation to add component products as individual line items.

## What's Been Implemented

### 1. Backend Changes
- **Bundle Configuration**: Stores component products with their details in metafields
- **Display Service**: Generates HTML/JSON for displaying bundles like FastBundle
- **Cart Transform Config**: Enables automatic addition of components to cart
- **Price Updates**: Bundle price reflects total of all components

### 2. Metafields Created
When a bundle is processed, these metafields are added to the original product:
- `bundle_app.is_bundle`: Marks product as a bundle
- `bundle_app.bundle_config`: Complete bundle configuration
- `bundle_app.component_products`: List of component products with details
- `bundle_app.cart_transform_config`: Settings for cart transformation

### 3. Product Updates
- **Price**: Updated to total bundle price
- **Tags**: Added `bundle`, `auto-bundle`, `cart-transform`, `fast-bundle`
- **Description**: Kept original (no HTML injection)

## Setup Instructions

### Step 1: Theme Integration

Add the bundle display script to your product template:

1. Go to **Shopify Admin > Online Store > Themes**
2. Click **Actions > Edit code**
3. Find your product template (usually `templates/product.liquid` or `sections/product-template.liquid`)
4. Add this code where you want the bundle to display (usually after product form):

```liquid
{% if product.metafields.bundle_app.is_bundle == 'true' %}
  {% include 'bundle-display' %}
{% endif %}
```

### Step 2: Create Bundle Display Snippet

1. In theme editor, go to **Snippets**
2. Click **Add a new snippet**
3. Name it `bundle-display`
4. Copy the contents from `/backend/scripts/bundle-display.liquid`

### Step 3: Cart Transform App Installation

For cart transformation to work (adding components as line items), you need to install a Cart Transform app:

#### Option A: Use Shopify Functions (Recommended)
1. Install Shopify CLI: `npm install -g @shopify/cli`
2. In your app directory, run: `shopify app generate extension`
3. Choose "Cart Transform" 
4. Deploy the function from `/backend/shopify-functions/cart-transform.js`

#### Option B: Use Third-Party Cart Transform App
1. Install a cart transform app from Shopify App Store
2. Configure it to read the `bundle_app.cart_transform_config` metafield
3. Set it to add component products based on the configuration

### Step 4: Alternative - JavaScript Cart Addition

If cart transform isn't available, the bundle display script includes JavaScript to add items:

```javascript
// This is already included in bundle-display.liquid
// It adds all components to cart when "Add Bundle to Cart" is clicked
```

## Testing the Bundle

### 1. Process a Set Product
```bash
curl -X POST http://localhost:5000/api/sets/process/{PRODUCT_ID}
```

### 2. Check Product in Shopify Admin
- Product should have updated price (sum of components)
- Tags should include `bundle`, `cart-transform`
- Metafields should be populated

### 3. View Product Page
- Bundle components should display with:
  - Product thumbnails
  - Names and prices
  - Variant selector (only on first product)
  - Total bundle price

### 4. Test Cart Addition
- Select variant on first product (others auto-sync)
- Click "Add Bundle to Cart"
- Should redirect to cart with all components as separate line items

## Customization

### Styling
Edit the CSS in `bundle-display.liquid`:

```css
.bundle-products-container {
  /* Container styles */
}

.bundle-product-item {
  /* Individual product styles */
}

.bundle-product-thumbnail {
  /* Thumbnail styles */
}
```

### Variant Synchronization
Control variant sync behavior:

```javascript
// In bundle-display.liquid
if (bundleConfig.cartTransform.synchronizeVariants) {
  // Hide other selectors
  // Sync selections
}
```

### Price Display
Customize price formatting:

```liquid
{{ shop.money_format | replace: '{{amount}}', price_value }}
```

## Troubleshooting

### Bundle Not Displaying
1. Check metafields are properly set:
   ```
   GET /admin/api/2023-10/products/{PRODUCT_ID}/metafields.json
   ```
2. Verify theme integration code is in place
3. Check browser console for JavaScript errors

### Cart Transform Not Working
1. Ensure cart transform app/function is installed
2. Check metafield `cart_transform_config` exists
3. Verify component product IDs are valid
4. Check Shopify Functions logs if using that method

### Variant Sync Issues
1. Ensure all components have matching variant options
2. Check JavaScript console for errors
3. Verify first product has variant selector visible

## API Endpoints

### Process Single Set
```
POST /api/sets/process/{productId}
```

### Check Bundle Status
```
GET /api/sets/check/{productId}
```

### Find All Set Products
```
GET /api/sets/find-all
```

## Bundle Structure Example

```json
{
  "originalProductId": 123456789,
  "displayAsBundle": true,
  "cartTransform": {
    "enabled": true,
    "synchronizeVariants": true
  },
  "bundleProducts": [
    {
      "id": 987654321,
      "title": "Product Top",
      "price": "2400.00",
      "componentType": "Top",
      "variantMapping": {
        "enabled": true,
        "autoSelect": true
      }
    },
    {
      "id": 987654322,
      "title": "Product Bottom",
      "price": "2400.00",
      "componentType": "Bottom",
      "variantMapping": {
        "enabled": true,
        "hideVariants": true
      }
    }
  ]
}
```

## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Verify metafields in Shopify Admin
3. Review server logs for processing errors
4. Test with a simple 2-piece set first

## Next Steps

1. **Install theme integration** (bundle-display.liquid)
2. **Set up cart transform** (Shopify Functions or app)
3. **Process a test product** through Set Manager
4. **Verify display and cart functionality**
5. **Customize styling** to match your theme

The bundle system is now ready to display components like FastBundle and add them as individual line items to the cart!
