import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seedLogisticsData() {
  console.log('Seeding logistics data...');

  try {
    // Sample logistics items
    const logisticsItems = [
      {
        name: 'Dell OptiPlex Desktop',
        description: 'Business desktop computer with Windows 11 Pro',
        category: 'IT Equipment',
        quantity: 15,
        minQuantity: 5,
        location: 'IT Storage Room A',
      },
      {
        name: 'Office Chairs (Ergonomic)',
        description: 'Adjustable ergonomic office chairs with lumbar support',
        category: 'Office Furniture',
        quantity: 3,
        minQuantity: 10,
        location: 'Warehouse Section B',
      },
      {
        name: 'Wireless Keyboards',
        description: 'Logitech wireless keyboards with number pad',
        category: 'IT Equipment',
        quantity: 25,
        minQuantity: 8,
        location: 'IT Storage Room A',
      },
      {
        name: 'Standing Desks',
        description: 'Height-adjustable standing desks',
        category: 'Office Furniture',
        quantity: 2,
        minQuantity: 5,
        location: 'Warehouse Section B',
      },
      {
        name: 'Laptop Docking Stations',
        description: 'USB-C docking stations for laptops',
        category: 'IT Equipment',
        quantity: 12,
        minQuantity: 6,
        location: 'IT Storage Room A',
      },
      {
        name: 'Printer Paper (A4)',
        description: '500-sheet reams of white A4 printer paper',
        category: 'Office Supplies',
        quantity: 50,
        minQuantity: 20,
        location: 'Supply Closet Main',
      },
      {
        name: 'Network Cables (Cat6)',
        description: '6ft Cat6 Ethernet cables',
        category: 'IT Equipment',
        quantity: 8,
        minQuantity: 15,
        location: 'IT Storage Room A',
      },
      {
        name: 'Conference Room Cameras',
        description: '4K webcams for video conferencing',
        category: 'IT Equipment',
        quantity: 4,
        minQuantity: 2,
        location: 'IT Storage Room B',
      },
      {
        name: 'Whiteboard Markers',
        description: 'Dry-erase markers (assorted colors)',
        category: 'Office Supplies',
        quantity: 1,
        minQuantity: 10,
        location: 'Supply Closet Main',
      },
      {
        name: 'Employee Badges',
        description: 'ID badges with lanyards',
        category: 'Security',
        quantity: 30,
        minQuantity: 10,
        location: 'HR Storage',
      }
    ];

    // Insert logistics items
    for (const item of logisticsItems) {
      await sql`
        INSERT INTO logistics_items (name, description, category, quantity, min_quantity, location, last_updated, created_at)
        VALUES (${item.name}, ${item.description}, ${item.category}, ${item.quantity}, ${item.minQuantity}, ${item.location}, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // Sample logistics requests
    const logisticsRequests = [
      {
        requesterId: '42726954',
        itemName: 'Ergonomic Office Chairs',
        description: 'Need 5 ergonomic chairs for new hires',
        quantity: 5,
        reason: 'New employee onboarding - expanding team',
        status: 'pending',
        priority: 'high',
        estimatedCost: 750.00,
      },
      {
        requesterId: '42726954',
        itemName: 'MacBook Pro 14-inch',
        description: 'Development laptop for software engineer',
        quantity: 2,
        reason: 'IT equipment for new developers',
        status: 'approved',
        priority: 'urgent',
        estimatedCost: 4000.00,
        actualCost: 3800.00,
        vendor: 'Apple Store Business',
        approvedBy: '42726954',
      },
      {
        requesterId: '42726954',
        itemName: 'Monitor Arms (Dual)',
        description: 'Adjustable dual monitor arms',
        quantity: 10,
        reason: 'Ergonomic workspace improvements',
        status: 'completed',
        priority: 'medium',
        estimatedCost: 1200.00,
        actualCost: 1150.00,
        vendor: 'Office Depot',
        approvedBy: '42726954',
        notes: 'Successfully installed for all workstations',
      },
      {
        requesterId: '42726954',
        itemName: 'Coffee Machine',
        description: 'Commercial-grade coffee machine for break room',
        quantity: 1,
        reason: 'Employee wellness and satisfaction',
        status: 'rejected',
        priority: 'low',
        estimatedCost: 2500.00,
        rejectionReason: 'Budget constraints this quarter',
      },
      {
        requesterId: '42726954',
        itemName: 'Video Conference Equipment',
        description: 'Complete setup for large conference room',
        quantity: 1,
        reason: 'Client meetings and remote collaboration',
        status: 'approved',
        priority: 'high',
        estimatedCost: 5000.00,
        vendor: 'TechPro Solutions',
        approvedBy: '42726954',
      },
      {
        requesterId: '42726954',
        itemName: 'Desk Organizers',
        description: 'Desktop organizers with multiple compartments',
        quantity: 20,
        reason: 'Office organization initiative',
        status: 'pending',
        priority: 'low',
        estimatedCost: 300.00,
      },
      {
        requesterId: '42726954',
        itemName: 'UPS Battery Backup',
        description: 'Uninterruptible power supply for servers',
        quantity: 3,
        reason: 'Critical infrastructure protection',
        status: 'approved',
        priority: 'urgent',
        estimatedCost: 1800.00,
        approvedBy: '42726954',
      }
    ];

    // Insert logistics requests
    for (const request of logisticsRequests) {
      const approvedAt = request.status === 'approved' || request.status === 'completed' ? 'NOW()' : null;
      const purchaseDate = request.status === 'completed' ? 'NOW() - INTERVAL \'7 days\'' : null;

      await sql`
        INSERT INTO logistics_requests (
          requester_id, item_name, description, quantity, reason, status, priority,
          estimated_cost, actual_cost, vendor, approved_by, approved_at, 
          purchase_date, rejection_reason, notes, created_at, updated_at
        )
        VALUES (
          ${request.requesterId}, ${request.itemName}, ${request.description}, 
          ${request.quantity}, ${request.reason}, ${request.status}, ${request.priority},
          ${request.estimatedCost}, ${request.actualCost || null}, ${request.vendor || null}, 
          ${request.approvedBy || null}, ${approvedAt}, ${purchaseDate}, 
          ${request.rejectionReason || null}, ${request.notes || null}, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `;
    }

    console.log('Logistics data seeded successfully!');
    console.log(`- Created ${logisticsItems.length} logistics items`);
    console.log(`- Created ${logisticsRequests.length} logistics requests`);
    console.log('- Includes items with low stock alerts for testing');
    console.log('- Includes requests with various statuses and priorities');

  } catch (error) {
    console.error('Error seeding logistics data:', error);
  }
}

seedLogisticsData();