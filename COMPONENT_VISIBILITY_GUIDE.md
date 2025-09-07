# Component Product Visibility Feature

## 🎯 Overview
This feature automatically hides split/component products from your storefront so customers can only see and access the main bundle products. Component products remain functional for bundle operations but are invisible to website visitors.

## 🔧 How It Works

### Automatic Hiding During Bundle Creation
When you process a set product (e.g., "3-Piece Coord Set"), the system:

1. **Creates component products** (e.g., "Top", "Bottom", "Jacket")
2. **Automatically sets them as DRAFT/UNPUBLISHED**
3. **Adds hidden-component tags** for identification
4. **Keeps them functional** for bundle cart operations

### Component Product Status
- ✅ **Status**: `draft` (not `active`)
- ✅ **Published**: `false` 
- ✅ **Published At**: `null`
- ✅ **Tags**: Include `hidden-component`, `component`, `auto-generated`

## 🎛️ Manual Control

### Settings Page Controls
Navigate to **Settings** → **Component Product Visibility**:

- **Hide All Component Products**: Makes all existing component products invisible
- **View Status**: See how many components are hidden vs visible
- **Bulk Operations**: Hide or show multiple components at once

### API Endpoints
```javascript
// Hide specific component products
POST /api/component-visibility/hide
{ "componentIds": [123, 456, 789] }

// Show specific component products  
POST /api/component-visibility/show
{ "componentIds": [123, 456, 789] }

// Hide ALL component products
POST /api/component-visibility/hide-all

// Get visibility status for a bundle
GET /api/component-visibility/status/:bundleId

// Bulk update visibility
POST /api/component-visibility/bulk-update
{ "componentIds": [123, 456], "visible": false }
```

## 🛍️ Customer Experience

### What Customers See
- ✅ **Main bundle product**: "3-Piece Coord Set" (visible in search, browse, collections)
- ❌ **Component products**: "Top", "Bottom", "Jacket" (completely hidden)

### What Customers Get in Cart
- ✅ **Individual components**: Each component added as separate line item
- ✅ **Correct variants**: Size/color selection synchronized across components
- ✅ **Bundle properties**: Items tagged as part of bundle for tracking

### Search & Browse Behavior
- ❌ **Component products don't appear** in:
  - Site search results
  - Collection pages  
  - Product browsing
  - Related product suggestions
  - Shopify's product feeds

## 🔄 Bundle Functionality

### Still Works Perfectly
- ✅ **Bundle display**: Components show on main product page
- ✅ **Variant synchronization**: Size selection works across all components
- ✅ **Cart transformation**: Individual components added to cart
- ✅ **Inventory management**: Stock levels tracked per component
- ✅ **Order fulfillment**: Components appear in orders normally

### Admin Access
- ✅ **Shopify Admin**: You can still see and manage component products
- ✅ **App interface**: Components visible in Set Manager and Analytics
- ✅ **API access**: Full CRUD operations available for components
- ✅ **Inventory tracking**: Stock levels and variants fully accessible

## 🚀 Implementation Details

### Automatic Process
```javascript
// When processing a set product:
1. Create component products
2. Set status: 'draft'
3. Set published: false
4. Add hidden tags
5. Configure bundle metafields
6. Hide from storefront
```

### Manual Override
If you need components visible for any reason:
```javascript
// Make components visible
await componentVisibilityService.showComponentProducts([componentId1, componentId2]);

// Hide components again
await componentVisibilityService.hideComponentProducts([componentId1, componentId2]);
```

## 📊 Benefits

### For Customers
- ✅ **Cleaner browsing experience** - no confusing component products
- ✅ **Clear product selection** - only see complete bundles
- ✅ **Simplified search results** - find what they actually want
- ✅ **Better product discovery** - focus on main offerings

### For Store Owners
- ✅ **Professional appearance** - organized product catalog
- ✅ **Reduced customer confusion** - clear product hierarchy
- ✅ **Better SEO** - avoid duplicate/similar product listings
- ✅ **Maintained functionality** - all bundle features work perfectly

## 🛠️ Troubleshooting

### If Components Are Still Visible
1. Check product status in Shopify Admin
2. Use "Hide All Component Products" in Settings
3. Verify tags include "hidden-component"
4. Ensure published_at is null

### If Bundle Functionality Breaks
1. Component products must exist (even if hidden)
2. Check metafield configuration on main product
3. Verify variant mappings are correct
4. Test cart transformation manually

## 📝 Best Practices

1. **Always hide component products** after creating bundles
2. **Use "Hide All" feature** periodically to catch any visible components
3. **Monitor visibility status** in Settings dashboard
4. **Test bundle functionality** after hiding components
5. **Keep component products as draft** unless specifically needed visible

This feature ensures your customers have a clean, professional shopping experience while maintaining all the powerful bundle functionality behind the scenes! 🎉
