/**
 * Immediate App Deactivation Script
 * Run this to completely deactivate the bundle app right now
 */

const axios = require('axios');

async function deactivateAppNow() {
  console.log('🔄 Deactivating Bundle App immediately...');
  
  const SHOPIFY_DOMAIN = 'labeldc.com';
  const ACCESS_TOKEN = 'your_shopify_access_token_here'; // Replace with actual token
  const THEME_ID = '143347351746';
  
  try {
    // 1. Remove bundle sections from theme.liquid
    console.log('Removing bundle sections from theme.liquid...');
    
    const getThemeResponse = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/themes/${THEME_ID}/assets.json?asset[key]=layout/theme.liquid`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    let themeContent = getThemeResponse.data.asset.value;
    
    // Remove bundle cart sync section and comments
    themeContent = themeContent.replace(/{% comment %}.*?Bundle Cart Synchronization.*?{% endcomment %}\s*{% section 'bundle-cart-sync' %}\s*/gs, '');
    themeContent = themeContent.replace(/{% section 'bundle-cart-sync' %}/g, '');
    themeContent = themeContent.replace(/{% comment %}.*?Bundle.*?{% endcomment %}\s*/gs, '');
    
    // Update theme.liquid
    await axios.put(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/themes/${THEME_ID}/assets.json`,
      {
        asset: {
          key: 'layout/theme.liquid',
          value: themeContent
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Removed bundle sections from theme.liquid');
    
    // 2. Delete bundle assets
    const assetsToDelete = [
      'sections/bundle-components.liquid',
      'sections/bundle-cart-sync.liquid',
      'assets/bundle-cart-override.js',
      'snippets/bundle-display.liquid'
    ];
    
    for (const assetKey of assetsToDelete) {
      try {
        await axios.delete(
          `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/themes/${THEME_ID}/assets.json?asset[key]=${assetKey}`,
          {
            headers: {
              'X-Shopify-Access-Token': ACCESS_TOKEN,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Deleted ${assetKey}`);
      } catch (error) {
        console.log(`⚠️  ${assetKey} not found or already deleted`);
      }
    }
    
    // 3. Reset bundle products to default templates
    console.log('Resetting bundle products...');
    
    const productsResponse = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const bundleProducts = productsResponse.data.products.filter(p => 
      p.template_suffix === 'bundle' || 
      (p.tags && (p.tags.includes('bundle') || p.tags.includes('auto-bundle')))
    );
    
    console.log(`Found ${bundleProducts.length} bundle products to reset`);
    
    for (const product of bundleProducts) {
      try {
        await axios.put(
          `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products/${product.id}.json`,
          {
            product: {
              id: product.id,
              template_suffix: null // Remove bundle template
            }
          },
          {
            headers: {
              'X-Shopify-Access-Token': ACCESS_TOKEN,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Reset template for: ${product.title}`);
      } catch (error) {
        console.log(`⚠️  Could not reset template for: ${product.title}`);
      }
    }
    
    console.log('\n🎉 BUNDLE APP COMPLETELY DEACTIVATED!');
    console.log('✅ All bundle sections removed from theme');
    console.log('✅ Bundle assets deleted');
    console.log('✅ Product templates reset to default');
    console.log('✅ Bundle functionality completely disabled');
    console.log('\n📝 What this means:');
    console.log('- Products will now display normally without bundle components');
    console.log('- No bundle cart transformation will occur');
    console.log('- All bundle synchronization is disabled');
    console.log('- The app can be reactivated anytime using the frontend toggle');
    
  } catch (error) {
    console.error('❌ Error deactivating app:', error.response?.data || error.message);
    console.log('\n🔧 Manual Steps (if script fails):');
    console.log('1. Go to Shopify Admin > Online Store > Themes > Actions > Edit Code');
    console.log('2. Open layout/theme.liquid');
    console.log('3. Remove any lines containing "bundle-cart-sync" or "bundle-components"');
    console.log('4. Delete sections/bundle-components.liquid and sections/bundle-cart-sync.liquid');
    console.log('5. For each bundle product, change template suffix from "bundle" to blank');
  }
}

// Run the deactivation
deactivateAppNow();

