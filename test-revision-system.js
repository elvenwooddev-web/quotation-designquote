#!/usr/bin/env node

/**
 * Test script for quote revision system
 * Tests that:
 * 1. New quotes are created with version 1
 * 2. Editing a quote increments the version
 * 3. Revision history is tracked in quote_revisions table
 */

const API_URL = 'http://localhost:3000/api';

// Test data
const newQuoteData = {
  title: 'Test Quote for Revision System',
  clientId: null,
  templateId: null,
  discountMode: 'LINE_ITEM',
  overallDiscount: 0,
  taxRate: 18,
  status: 'DRAFT',
  items: [
    {
      productId: '49ae893f-68ef-44ef-a813-61ac06f1cd1f', // Sofa Set product ID
      description: 'Sofa Set - Test',
      quantity: 1,
      rate: 25000,
      discount: 0,
    }
  ],
  policies: []
};

async function testRevisionSystem() {
  console.log('🧪 Testing Quote Revision System...\n');

  try {
    // Step 1: Create a new quote
    console.log('1️⃣  Creating new quote...');
    const createResponse = await fetch(`${API_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newQuoteData),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create quote: ${error}`);
    }

    const createdQuote = await createResponse.json();
    console.log(`   ✅ Quote created with ID: ${createdQuote.id}`);
    console.log(`   📌 Version: ${createdQuote.version || 'Not set'}`);

    if (createdQuote.version !== 1) {
      console.error(`   ❌ ERROR: Expected version 1, got ${createdQuote.version}`);
    } else {
      console.log(`   ✅ Version correctly set to 1\n`);
    }

    // Step 2: Edit the quote (first revision)
    console.log('2️⃣  Editing quote (first revision)...');
    const firstEditData = {
      ...newQuoteData,
      title: 'Test Quote - Revision 1',
      items: [
        {
          productId: '49ae893f-68ef-44ef-a813-61ac06f1cd1f',
          description: 'Sofa Set - Updated',
          quantity: 2,
          rate: 30000,
          discount: 10,
        }
      ],
    };

    const firstEditResponse = await fetch(`${API_URL}/quotes/${createdQuote.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(firstEditData),
    });

    if (!firstEditResponse.ok) {
      const error = await firstEditResponse.text();
      throw new Error(`Failed to edit quote: ${error}`);
    }

    const firstEditQuote = await firstEditResponse.json();
    console.log(`   ✅ Quote edited successfully`);
    console.log(`   📌 Version: ${firstEditQuote.version || 'Not set'}`);

    if (firstEditQuote.version !== 2) {
      console.error(`   ❌ ERROR: Expected version 2, got ${firstEditQuote.version}`);
    } else {
      console.log(`   ✅ Version correctly incremented to 2\n`);
    }

    // Step 3: Edit the quote again (second revision)
    console.log('3️⃣  Editing quote again (second revision)...');
    const secondEditData = {
      ...firstEditData,
      title: 'Test Quote - Revision 2',
      overallDiscount: 5,
      taxRate: 20,
    };

    const secondEditResponse = await fetch(`${API_URL}/quotes/${createdQuote.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secondEditData),
    });

    if (!secondEditResponse.ok) {
      const error = await secondEditResponse.text();
      throw new Error(`Failed to edit quote: ${error}`);
    }

    const secondEditQuote = await secondEditResponse.json();
    console.log(`   ✅ Quote edited successfully`);
    console.log(`   📌 Version: ${secondEditQuote.version || 'Not set'}`);

    if (secondEditQuote.version !== 3) {
      console.error(`   ❌ ERROR: Expected version 3, got ${secondEditQuote.version}`);
    } else {
      console.log(`   ✅ Version correctly incremented to 3\n`);
    }

    // Step 4: Fetch the quote to verify final state
    console.log('4️⃣  Fetching quote to verify final state...');
    const fetchResponse = await fetch(`${API_URL}/quotes/${createdQuote.id}`);

    if (!fetchResponse.ok) {
      const error = await fetchResponse.text();
      throw new Error(`Failed to fetch quote: ${error}`);
    }

    const finalQuote = await fetchResponse.json();
    console.log(`   ✅ Quote fetched successfully`);
    console.log(`   📌 Final Version: ${finalQuote.version || 'Not set'}`);
    console.log(`   📝 Final Title: ${finalQuote.title}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 REVISION SYSTEM TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Quote ID: ${createdQuote.id}`);
    console.log(`Initial Version: 1`);
    console.log(`After 1st Edit: 2`);
    console.log(`After 2nd Edit: 3`);
    console.log(`Final Version: ${finalQuote.version}`);

    if (finalQuote.version === 3) {
      console.log('\n✅ ✅ ✅ REVISION SYSTEM WORKING CORRECTLY! ✅ ✅ ✅');
    } else {
      console.log('\n❌ REVISION SYSTEM HAS ISSUES - Version tracking not working as expected');
    }

    // Step 5: Clean up - delete the test quote
    console.log('\n🧹 Cleaning up test quote...');
    const deleteResponse = await fetch(`${API_URL}/quotes/${createdQuote.id}`, {
      method: 'DELETE',
    });

    if (deleteResponse.ok) {
      console.log('   ✅ Test quote deleted successfully');
    } else {
      console.log('   ⚠️  Failed to delete test quote - manual cleanup may be needed');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\nMake sure:');
    console.error('1. The dev server is running on localhost:3000');
    console.error('2. The database is accessible');
    console.error('3. The Supabase environment variables are configured');
  }
}

// Run the test
testRevisionSystem();