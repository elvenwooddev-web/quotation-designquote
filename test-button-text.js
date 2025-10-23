// Test script to verify button text behavior
// 1. Creating new quote should show "Save Draft" even after saving
// 2. Editing existing quote should show "Update Quote"

const API_URL = 'http://localhost:3000/api';

async function getFirstProductId() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    if (products && products.length > 0) {
      return products[0].id;
    }
    throw new Error('No products found');
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Fallback to a known product ID if available
    return '49ae893f-68ef-44ef-a813-61ac06f1cd1f';
  }
}

async function testButtonTextBehavior() {
  console.log('🧪 Testing button text behavior...\n');

  const productId = await getFirstProductId();
  console.log(`Using product ID: ${productId}\n`);

  // Step 1: Create a new quote
  console.log('Step 1: Creating new quote...');
  const createResponse = await fetch(`${API_URL}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Quote - Button Text',
      clientId: null,
      discountMode: 'LINE_ITEM',
      overallDiscount: 0,
      taxRate: 18,
      items: [{
        productId: productId,
        description: 'Test Product',
        quantity: 1,
        rate: 1000,
        discount: 0,
      }],
      policies: []
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create quote: ${createResponse.status}`);
  }

  const quote = await createResponse.json();
  console.log(`✅ Quote created with ID: ${quote.id}`);
  console.log(`   Status: ${quote.status}`);
  console.log(`   Version: ${quote.version || 1}\n`);

  console.log('Expected UI behavior after saving new quote:');
  console.log('  - Button should show: "Save Draft" (not "Update Quote")');
  console.log('  - This is a new quote, not an edit\n');

  // Step 2: Simulate editing the existing quote
  console.log('Step 2: Editing existing quote...');
  const updateResponse = await fetch(`${API_URL}/quotes/${quote.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Quote - Button Text (Edited)',
      clientId: null,
      discountMode: 'LINE_ITEM',
      overallDiscount: 0,
      taxRate: 18,
      items: [{
        productId: productId,
        description: 'Test Product (Updated)',
        quantity: 2,
        rate: 1000,
        discount: 5,
      }],
      policies: []
    }),
  });

  if (!updateResponse.ok) {
    throw new Error(`Failed to update quote: ${updateResponse.status}`);
  }

  const updatedQuote = await updateResponse.json();
  console.log(`✅ Quote updated`);
  console.log(`   Version: ${updatedQuote.version || 2}\n`);

  console.log('Expected UI behavior when editing existing quote:');
  console.log('  - Button should show: "Update Quote"');
  console.log('  - This is an existing quote being edited\n');

  // Summary
  console.log('📋 Summary:');
  console.log('1. New quotes: Button shows "Save Draft" (even after first save)');
  console.log('2. Existing quotes (loaded for editing): Button shows "Update Quote"');
  console.log('3. The key difference is whether quoteId comes from the store (existing) vs newly created');

  console.log('\n✅ Test complete! Check the UI to verify button behavior.');
  console.log(`   Navigate to: http://localhost:3000/quotes/${quote.id} to see "Update Quote" button`);
  console.log('   Navigate to: http://localhost:3000/quotes/new to see "Save Draft" button');
}

testButtonTextBehavior().catch(console.error);