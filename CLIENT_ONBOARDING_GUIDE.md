# 🛍️ SplitSet - Client Onboarding Guide

Welcome to SplitSet! This guide will help you set up intelligent product splitting and analytics tracking for your Shopify store in under 10 minutes.

## 📋 What This App Does

SplitSet automatically:
- ✅ Splits your products into intelligent sets and variants
- ✅ Tracks orders with "splitter" tags for analytics
- ✅ Provides monthly analytics dashboard
- ✅ Calculates your usage billing (₹9 per order)

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Custom App in Shopify

1. **Go to your Shopify Admin**
   - Navigate to: `Settings` → `Apps and sales channels`

2. **Create Custom App**
   - Click `Develop apps` → `Create an app`
   - App name: `SplitSet Analytics`
   - App developer: `Your Store`

3. **Configure API Scopes**
   Click `Configure Admin API scopes` and enable:
   - ✅ `read_products` - Read product information
   - ✅ `write_products` - Create split set products
   - ✅ `read_orders` - Read order data for analytics
   - ✅ `read_fulfillments` - Check fulfillment status

4. **Install the App**
   - Click `Install app`
   - Copy the **Admin API access token** (starts with `shpat_`)

### Step 2: Register Your Store

1. **Visit our onboarding page**: `https://your-app-domain.com/onboard`

2. **Enter your store details**:
   ```
   Store Domain: your-store.myshopify.com
   Access Token: shpat_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Test connection** - The system will verify your token and scopes

4. **Complete registration** - You'll receive a confirmation email

### Step 3: Run Your First Product Split

1. **Access the dashboard**: `https://your-app-domain.com/dashboard`

2. **Select products to split**:
   - Choose main products you want to bundle
   - Configure bundle settings (discount, additional products)
   - Add "splitter" tag automatically

3. **Run the split**:
   - Click `Create Bundles`
   - Monitor progress in the dashboard
   - New bundle products will appear in your Shopify admin

## 📊 Understanding Analytics

### Monthly Billing Calculation
- **Rate**: ₹9 per fulfilled order containing splitter products
- **Tracking**: Orders tagged with "splitter" or containing products with splitter tags
- **Billing cycle**: Monthly, based on fulfilled orders only

### Dashboard Metrics
- **Total Orders**: Count of fulfilled orders via splitter this month
- **Total Items**: Sum of quantities in splitter orders
- **Revenue Impact**: Total orders × ₹9
- **Daily Chart**: Items sold per day via splitter products

### Example Calculation
```
Month: January 2024
- Fulfilled orders with splitter products: 45
- Total items sold via splitter: 127
- Your bill: 45 orders × ₹9 = ₹405
```

## 🏷️ How Product Tagging Works

### Automatic Tagging
When you use our app to split products:
- ✅ Original products get tagged with `splitter`
- ✅ Bundle products get tagged with `splitter, bundle`
- ✅ Orders containing these products are tracked automatically

### Manual Tagging (Optional)
If you create bundles manually, add the `splitter` tag to:
- Products you want tracked in analytics
- This ensures orders are counted in your monthly billing

## 🛠️ Store Management

### Adding Team Members
1. Go to `Settings` → `Team Management`
2. Invite team members with email addresses
3. Assign roles: `Admin`, `Manager`, or `Viewer`

### Updating API Token
If you need to rotate your access token:
1. Generate new token in Shopify Admin
2. Update in our dashboard: `Settings` → `API Configuration`
3. Test connection to verify

### Pausing/Resuming Service
- **Pause**: Stops new analytics collection (existing data preserved)
- **Resume**: Resumes analytics collection from pause date
- **Billing**: Only charged for active periods

## 📈 Best Practices

### Product Bundle Strategy
1. **Start small**: Test with 5-10 products initially
2. **Monitor performance**: Check which bundles sell best
3. **Iterate**: Adjust bundle composition based on data
4. **Seasonal updates**: Update bundles for holidays/seasons

### Analytics Optimization
1. **Tag consistently**: Ensure all bundle products have `splitter` tag
2. **Monitor daily**: Check dashboard for unusual patterns
3. **Monthly review**: Analyze trends and adjust strategy
4. **Compare periods**: Use month-over-month comparisons

## 🔧 Troubleshooting

### Common Issues

#### "Connection Failed" Error
**Symptoms**: Can't connect to Shopify store
**Solutions**:
1. Verify store domain format: `your-store.myshopify.com`
2. Check access token is copied correctly (no extra spaces)
3. Ensure all required scopes are enabled
4. Try generating a new access token

#### "No Analytics Data" Issue
**Symptoms**: Dashboard shows zero orders/items
**Solutions**:
1. Verify products have `splitter` tag
2. Check that orders are fulfilled (not just paid)
3. Ensure orders contain tagged products
4. Wait 30 minutes for data refresh

#### "High Bill" Concern
**Symptoms**: Monthly bill higher than expected
**Solutions**:
1. Review which products are tagged with `splitter`
2. Check if non-bundle products were accidentally tagged
3. Use our detailed analytics to see order breakdown
4. Contact support for billing review

### Self-Service Diagnostics

#### Check Store Health
Visit: `https://your-app-domain.com/api/stores/{your-store-id}/health`

Expected response:
```json
{
  "success": true,
  "data": {
    "storeId": 123,
    "shopDomain": "your-store.myshopify.com",
    "shopify": {
      "connected": true,
      "apiUsage": { "percentage": 25 }
    }
  }
}
```

#### Verify Analytics Tracking
1. Create a test order with a splitter product
2. Mark order as fulfilled in Shopify
3. Wait 30-60 minutes
4. Check dashboard for the new order

## 📞 Support

### Self-Help Resources
- **FAQ**: `https://your-app-domain.com/faq`
- **Video Tutorials**: `https://your-app-domain.com/tutorials`
- **API Documentation**: `https://your-app-domain.com/docs`

### Contact Support
- **Email**: support@your-company.com
- **Response Time**: 24 hours for general queries, 4 hours for urgent issues
- **Live Chat**: Available 9 AM - 6 PM IST on business days

### What to Include in Support Requests
1. **Store domain**: your-store.myshopify.com
2. **Issue description**: What you were trying to do
3. **Error messages**: Copy exact error text
4. **Screenshots**: If applicable
5. **Timeline**: When did the issue start?

## 💡 Advanced Features

### Bulk Operations
- **Bulk product splitting**: Process 100+ products at once
- **Batch analytics refresh**: Force refresh all analytics data
- **Bulk tagging**: Add/remove tags from multiple products

### API Access
For developers who want to integrate:
- **REST API**: Full CRUD operations on stores, products, analytics
- **Webhooks**: Real-time notifications for order events
- **Rate Limits**: 1000 requests per hour per store

### Custom Integrations
We support integrations with:
- **Email marketing**: Klaviyo, Mailchimp
- **Analytics**: Google Analytics, Facebook Pixel
- **Inventory management**: TradeGecko, Cin7

## 🔄 Offboarding Process

If you need to stop using our service:

### Data Export
1. **Analytics export**: Download CSV of all historical data
2. **Product tags**: Keep or remove `splitter` tags as needed
3. **Bundle products**: Keep or delete bundle products in Shopify

### Account Closure
1. **Final bill**: Prorated for the current month
2. **Data retention**: We keep data for 90 days for recovery
3. **Complete deletion**: After 90 days, all data is permanently deleted

---

## ✅ Onboarding Checklist

Print this checklist and check off each step:

### Pre-Setup
- [ ] Shopify store admin access confirmed
- [ ] Products to bundle identified
- [ ] Team members who need access listed

### Shopify Configuration
- [ ] Custom app created in Shopify
- [ ] Required API scopes enabled
- [ ] App installed and access token copied
- [ ] Token tested and working

### App Registration
- [ ] Store registered in our system
- [ ] Connection test passed
- [ ] Team members invited (if applicable)
- [ ] Dashboard access confirmed

### First Bundle Creation
- [ ] Products selected for bundling
- [ ] Bundle configuration completed
- [ ] Split operation successful
- [ ] Bundle products visible in Shopify
- [ ] Tags applied correctly

### Analytics Verification
- [ ] Test order created and fulfilled
- [ ] Order appears in analytics (wait 30-60 min)
- [ ] Dashboard showing correct data
- [ ] Monthly billing calculation understood

### Go-Live
- [ ] Team trained on dashboard usage
- [ ] Support contact information saved
- [ ] Monthly review process established
- [ ] Success! 🎉

**Total setup time**: 10-15 minutes
**Time to first analytics data**: 30-60 minutes after first fulfilled order
**Support availability**: 24/7 via email, business hours via chat

---

*Welcome to the SplitSet family! We're here to help you succeed.* 🚀
