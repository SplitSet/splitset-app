/**
 * Fix for admin tracking deployment issue
 * This migration ensures all required tables exist, creating them only if missing
 * This replaces the problematic 007_create_admin_tracking.js that wasn't deploying properly
 */

exports.up = async function(knex) {
  console.log('🔧 Running admin tracking deployment fix...');
  
  const tablesToCreate = [
    {
      name: 'split_products',
      create: (table) => {
        table.increments('id').primary();
        table.integer('store_id').unsigned().references('id').inTable('stores').onDelete('CASCADE');
        table.string('product_id').notNullable(); // Shopify product ID
        table.string('original_product_id').nullable(); // Original product this was split from
        table.string('title').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.string('split_type').defaultTo('manual'); // manual, auto, bulk
        table.json('metadata').nullable(); // Store additional split information
        table.timestamps(true, true);
        
        table.index(['store_id', 'created_at']);
        table.index(['product_id']);
        table.index(['original_product_id']);
      }
    },
    {
      name: 'products',
      create: (table) => {
        table.increments('id').primary();
        table.integer('store_id').unsigned().references('id').inTable('stores').onDelete('CASCADE');
        table.string('shopify_id').notNullable();
        table.string('title').notNullable();
        table.string('handle').notNullable();
        table.string('vendor').nullable();
        table.string('product_type').nullable();
        table.decimal('price', 10, 2).nullable();
        table.text('description').nullable();
        table.json('images').nullable();
        table.json('variants').nullable();
        table.string('status').defaultTo('active');
        table.timestamps(true, true);
        
        table.unique(['store_id', 'shopify_id']);
        table.index(['store_id', 'status']);
        table.index(['handle']);
      }
    },
    {
      name: 'orders',
      create: (table) => {
        table.increments('id').primary();
        table.integer('store_id').unsigned().references('id').inTable('stores').onDelete('CASCADE');
        table.string('shopify_id').notNullable();
        table.string('order_number').notNullable();
        table.decimal('total_price', 10, 2).notNullable();
        table.string('currency', 3).defaultTo('USD');
        table.string('financial_status').nullable();
        table.string('fulfillment_status').nullable();
        table.json('customer_info').nullable();
        table.timestamp('order_date').notNullable();
        table.timestamps(true, true);
        
        table.unique(['store_id', 'shopify_id']);
        table.index(['store_id', 'order_date']);
        table.index(['financial_status']);
      }
    },
    {
      name: 'order_line_items',
      create: (table) => {
        table.increments('id').primary();
        table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
        table.string('product_id').notNullable(); // Shopify product ID
        table.string('variant_id').nullable(); // Shopify variant ID
        table.string('title').notNullable();
        table.integer('quantity').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.json('properties').nullable(); // Line item properties
        table.timestamps(true, true);
        
        table.index(['order_id']);
        table.index(['product_id']);
        table.index(['created_at']);
      }
    },
    {
      name: 'admin_sessions',
      create: (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.string('session_id').notNullable();
        table.string('ip_address').nullable();
        table.string('user_agent').nullable();
        table.json('accessed_resources').nullable();
        table.timestamp('last_activity').defaultTo(knex.fn.now());
        table.timestamps(true, true);
        
        table.index(['user_id', 'session_id']);
        table.index(['last_activity']);
      }
    }
  ];

  let tablesCreated = 0;
  let tablesSkipped = 0;

  for (const tableConfig of tablesToCreate) {
    const exists = await knex.schema.hasTable(tableConfig.name);
    
    if (!exists) {
      console.log(`  Creating table: ${tableConfig.name}`);
      await knex.schema.createTable(tableConfig.name, tableConfig.create);
      tablesCreated++;
    } else {
      console.log(`  Table already exists: ${tableConfig.name} ✓`);
      tablesSkipped++;
    }
  }

  console.log(`✅ Admin tracking fix complete: ${tablesCreated} created, ${tablesSkipped} already existed`);
};

exports.down = async function(knex) {
  console.log('🔄 Rolling back admin tracking deployment fix...');
  
  const tablesToDrop = ['admin_sessions', 'order_line_items', 'orders', 'products', 'split_products'];
  
  for (const tableName of tablesToDrop) {
    const exists = await knex.schema.hasTable(tableName);
    if (exists) {
      console.log(`  Dropping table: ${tableName}`);
      await knex.schema.dropTable(tableName);
    }
  }
  
  console.log('✅ Admin tracking rollback complete');
};
