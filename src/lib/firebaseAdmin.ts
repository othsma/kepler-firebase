/**
 * This file contains utility functions for initializing and seeding the Firebase database.
 * In a production environment, these functions would typically be run in a secure admin context.
 */

import { 
  addCustomer, 
  addRepair, 
  addProduct, 
  addTechnician,
  type Customer,
  type Repair,
  type Product,
  type Technician
} from './firebase';

// Sample data for seeding the database
const sampleCustomers: Omit<Customer, 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'John Doe',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    address: '123 Main St, Anytown, USA'
  },
  {
    name: 'Jane Smith',
    phone: '987-654-3210',
    email: 'jane.smith@example.com',
    address: '456 Oak Ave, Somewhere, USA'
  },
  {
    name: 'Robert Johnson',
    phone: '555-123-4567',
    email: 'robert.johnson@example.com',
    address: '789 Pine Rd, Nowhere, USA'
  }
];

const sampleTechnicians: Omit<Technician, 'tech_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Mike Wilson',
    specialization: ['Mobile Phones', 'Tablets'],
    availability: true,
    email: 'mike.wilson@techrepair.com',
    phone: '555-789-1234'
  },
  {
    name: 'Sarah Lee',
    specialization: ['Laptops', 'Desktops'],
    availability: true,
    email: 'sarah.lee@techrepair.com',
    phone: '555-456-7890'
  },
  {
    name: 'David Chen',
    specialization: ['Game Consoles', 'Smart Watches'],
    availability: false,
    email: 'david.chen@techrepair.com',
    phone: '555-234-5678'
  }
];

const sampleProducts: Omit<Product, 'product_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'iPhone Screen Replacement Kit',
    category: 'Repair Parts',
    quantity: 25,
    price: 49.99,
    supplier: 'Tech Parts Inc.',
    description: 'Replacement screen for iPhone models 11, 12, and 13',
    sku: 'IP-SCRN-1113'
  },
  {
    name: 'Samsung Battery Pack',
    category: 'Repair Parts',
    quantity: 15,
    price: 29.99,
    supplier: 'Samsung Parts',
    description: 'Replacement battery for Samsung Galaxy S10, S20, and S21',
    sku: 'SG-BAT-1021'
  },
  {
    name: 'Universal Laptop Charger',
    category: 'Accessories',
    quantity: 30,
    price: 39.99,
    supplier: 'Power Solutions',
    description: 'Compatible with most laptop brands, includes multiple tips',
    sku: 'ACC-CHRG-UNI'
  },
  {
    name: 'Anti-Static Wrist Strap',
    category: 'Tools',
    quantity: 50,
    price: 9.99,
    supplier: 'Tech Tools',
    description: 'Prevents static damage when working on electronic devices',
    sku: 'TL-ANTST-01'
  }
];

// Function to seed the database with sample data
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seeding...');
    
    // Add sample customers
    const customerIds: string[] = [];
    for (const customer of sampleCustomers) {
      const customerId = await addCustomer(customer);
      if (customerId) {
        customerIds.push(customerId);
        console.log(`Added customer: ${customer.name} with ID: ${customerId}`);
      }
    }
    
    // Add sample technicians
    const technicianIds: string[] = [];
    for (const technician of sampleTechnicians) {
      const technicianId = await addTechnician(technician);
      if (technicianId) {
        technicianIds.push(technicianId);
        console.log(`Added technician: ${technician.name} with ID: ${technicianId}`);
      }
    }
    
    // Add sample products
    for (const product of sampleProducts) {
      const productId = await addProduct(product);
      if (productId) {
        console.log(`Added product: ${product.name} with ID: ${productId}`);
      }
    }
    
    // Add sample repairs
    if (customerIds.length > 0 && technicianIds.length > 0) {
      const sampleRepairs: Omit<Repair, 'repair_id' | 'created_date'>[] = [
        {
          customer_id: customerIds[0],
          device_type: 'Mobile Phone',
          brand: 'Apple',
          model: 'iPhone 13',
          issue_description: 'Cracked screen and battery not holding charge',
          status: 'in-progress',
          cost: 149.99,
          technician_id: technicianIds[0],
          tasks: ['Screen Replacement', 'Battery Replacement'],
          passcode: '1234'
        },
        {
          customer_id: customerIds[1],
          device_type: 'Laptop',
          brand: 'Dell',
          model: 'XPS 15',
          issue_description: 'Not powering on, possible motherboard issue',
          status: 'pending',
          cost: 299.99,
          technician_id: technicianIds[1],
          tasks: ['Diagnostic', 'Motherboard Repair']
        },
        {
          customer_id: customerIds[2],
          device_type: 'Game Console',
          brand: 'Sony',
          model: 'PlayStation 5',
          issue_description: 'Overheating and shutting down during gameplay',
          status: 'completed',
          cost: 89.99,
          technician_id: technicianIds[2],
          tasks: ['Cleaning', 'Thermal Paste Replacement'],
          notes: 'Customer requested rush service'
        }
      ];
      
      for (const repair of sampleRepairs) {
        const repairId = await addRepair(repair);
        if (repairId) {
          console.log(`Added repair for ${repair.device_type} ${repair.brand} with ID: ${repairId}`);
        }
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Export the function for use in development environments
export default {
  seedDatabase
};