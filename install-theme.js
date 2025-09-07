#!/usr/bin/env node

/**
 * Command-line script to automatically install bundle display in Shopify theme
 * Run: node install-theme.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function installTheme() {
  console.log('🚀 Starting automatic theme installation...\n');
  
  try {
    // Check current installation status
    console.log('📋 Checking current installation status...');
    const statusResponse = await axios.get(`${API_URL}/api/theme/check-installation`);
    
    if (statusResponse.data.installed) {
      console.log(`✅ Bundle display is already installed in theme: ${statusResponse.data.theme}`);
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to reinstall? (y/n): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Installation cancelled.');
        process.exit(0);
      }
    }
    
    // Perform installation
    console.log('\n📦 Installing bundle display components...');
    const installResponse = await axios.post(`${API_URL}/api/theme/install-bundle-display`);
    
    if (installResponse.data.success) {
      console.log('\n✅ Installation successful!');
      console.log(`   Theme: ${installResponse.data.details.theme}`);
      console.log(`   Snippet: ${installResponse.data.details.snippetInstalled ? '✅ Installed' : '❌ Failed'}`);
      console.log(`   Template: ${installResponse.data.details.templateUpdated ? '✅ Updated' : '⚠️  Manual update required'}`);
      
      if (!installResponse.data.details.templateUpdated) {
        console.log('\n⚠️  MANUAL STEP REQUIRED:');
        console.log('   Add the following code to your product template (product.liquid):');
        console.log('\n   {% if product.metafields.bundle_app.is_bundle == "true" %}');
        console.log('     {% include "bundle-display" %}');
        console.log('   {% endif %}\n');
      }
      
      console.log('\n🎉 Bundle display has been installed in your theme!');
      console.log('   Processed bundle products will now display their components.');
    } else {
      console.error('❌ Installation failed:', installResponse.data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during installation:', error.response?.data?.error || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to the backend server.');
      console.error('   Please ensure the server is running:');
      console.error('   cd backend && npm start');
    }
    
    process.exit(1);
  }
}

// Run the installation
installTheme().catch(console.error);
