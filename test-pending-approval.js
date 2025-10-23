const API_URL = 'http://localhost:3000/api';

async function createPendingApprovalQuote() {
  // Create a quote
  const createResponse = await fetch(`${API_URL}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Quote for Dashboard Pending Approvals',
      clientId: null,
      discountMode: 'LINE_ITEM',
      overallDiscount: 0,
      taxRate: 18,
      items: [{
        productId: '49ae893f-68ef-44ef-a813-61ac06f1cd1f',
        description: 'Sofa Set',
        quantity: 2,
        rate: 45000,
        discount: 5,
      }],
      policies: []
    }),
  });

  const quote = await createResponse.json();
  console.log('Created quote:', quote.id, 'Status:', quote.status);

  // Request approval
  const approvalResponse = await fetch(`${API_URL}/quotes/${quote.id}/request-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = await approvalResponse.json();
  console.log('Requested approval. New status:', result.quote.status);
  console.log('\n✅ Quote with PENDING_APPROVAL status created!');
  console.log('Check your dashboard - it should now show 1 pending approval');
}

createPendingApprovalQuote().catch(console.error);
