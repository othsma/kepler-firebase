# Repair Shop Management System - Firebase Implementation

This project implements a comprehensive Firebase database structure for a repair shop management system. The implementation includes collections for customers, repairs, products, and technicians, along with proper data validation, security rules, and indexes.

## Database Structure

### Collections

1. **customers**
   - name (string, required)
   - phone (string, required)
   - email (string, optional, validated format)
   - address (string)
   - createdAt (timestamp)
   - updatedAt (timestamp)

2. **repairs**
   - repair_id (string, auto-generated)
   - customer_id (string, required)
   - device_type (string, required)
   - brand (string, required)
   - model (string, required)
   - issue_description (string)
   - status (string: 'pending', 'in-progress', 'completed')
   - created_date (timestamp)
   - cost (number, positive)
   - technician_id (string, optional)
   - tasks (array of strings)
   - notes (string, optional)
   - passcode (string, optional)
   - updatedAt (timestamp)

3. **products**
   - product_id (string, auto-generated)
   - name (string, required)
   - category (string, required)
   - quantity (number, positive)
   - price (number, positive)
   - supplier (string, required)
   - description (string, optional)
   - sku (string, optional)
   - createdAt (timestamp)
   - updatedAt (timestamp)

4. **technicians**
   - tech_id (string, auto-generated)
   - name (string, required)
   - specialization (array of strings, required)
   - availability (boolean)
   - email (string, validated format)
   - phone (string, required)
   - createdAt (timestamp)
   - updatedAt (timestamp)

## Features

### Data Validation

- Required fields are checked for existence and non-empty values
- Email formats are validated using regex
- Numeric values (price, quantity) are validated to be positive
- Status fields are validated against allowed values
- Arrays are checked for minimum length requirements

### Security Rules

- Authentication is required for all operations
- Role-based access control for admin and staff
- Read access is granted to authenticated users
- Write operations are restricted based on user roles
- Data validation is enforced at the database level

### Indexes

Indexes are created for frequently queried fields:
- repair status + created_date
- customer_id + created_date
- technician_id + status
- customer names
- product category + name
- technician availability + specialization

## Setup Instructions

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore database
3. Copy your Firebase configuration to `.env` file (use `.env.example` as a template)
4. Deploy the security rules from `src/lib/firebaseRules.txt` to your Firebase project
5. Deploy the indexes from `src/lib/firebaseIndexes.json` to your Firebase project

## Usage

The Firebase implementation provides the following functionality:

- CRUD operations for customers, repairs, products, and technicians
- Data validation to ensure data integrity
- Security rules to protect data access
- Indexes for efficient querying
- Authentication for user management

## React Hooks

Custom React hooks are provided for easy integration with React components:

- `useAuth()` - Authentication state and functions
- `useCustomers()` - Fetch all customers
- `useRepairs()` - Fetch all repairs
- `useRepairsByStatus(status)` - Fetch repairs by status
- `useRepairsByCustomerId(customerId)` - Fetch repairs for a specific customer
- `useProducts()` - Fetch all products
- `useProductsByCategory(category)` - Fetch products by category
- `useTechnicians()` - Fetch all technicians
- `useAvailableTechnicians()` - Fetch only available technicians

## Development

For development purposes, a seeding utility is provided in `src/lib/firebaseAdmin.ts`. This can be used to populate the database with sample data.