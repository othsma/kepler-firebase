import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { isValid, parseISO } from 'date-fns';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Collection references
const customersCollection = collection(db, 'customers');
const repairsCollection = collection(db, 'repairs');
const productsCollection = collection(db, 'products');
const techniciansCollection = collection(db, 'technicians');

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateDate = (date: string): boolean => {
  try {
    return isValid(parseISO(date));
  } catch (error) {
    return false;
  }
};

const validatePositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0;
};

const validateRequired = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

// Customer functions
interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const validateCustomer = (customer: Customer): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(customer.name)) errors.push('Name is required');
  if (!validateRequired(customer.phone)) errors.push('Phone is required');
  
  if (customer.email && !validateEmail(customer.email)) {
    errors.push('Email format is invalid');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const addCustomer = async (customer: Customer): Promise<string | null> => {
  const validation = validateCustomer(customer);
  
  if (!validation.valid) {
    console.error('Customer validation failed:', validation.errors);
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  try {
    const customerData = {
      ...customer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(customersCollection, customerData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    return null;
  }
};

const updateCustomer = async (customerId: string, customer: Partial<Customer>): Promise<boolean> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }
    
    const currentData = customerDoc.data() as Customer;
    const updatedData = { ...currentData, ...customer, updatedAt: serverTimestamp() };
    
    const validation = validateCustomer(updatedData as Customer);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    await updateDoc(customerRef, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
};

const getCustomers = async (): Promise<(Customer & { id: string })[]> => {
  try {
    const querySnapshot = await getDocs(customersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Customer
    }));
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

const getCustomerById = async (customerId: string): Promise<(Customer & { id: string }) | null> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      return null;
    }
    
    return {
      id: customerDoc.id,
      ...customerDoc.data() as Customer
    };
  } catch (error) {
    console.error('Error getting customer:', error);
    return null;
  }
};

// Repair functions
interface Repair {
  repair_id: string;
  customer_id: string;
  device_type: string;
  brand: string;
  model: string;
  issue_description: string;
  status: 'pending' | 'in-progress' | 'completed';
  created_date: Timestamp;
  cost: number;
  technician_id?: string;
  tasks: string[];
  notes?: string;
  passcode?: string;
  updatedAt?: Timestamp;
}

const validateRepair = (repair: Repair): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(repair.customer_id)) errors.push('Customer ID is required');
  if (!validateRequired(repair.device_type)) errors.push('Device type is required');
  if (!validateRequired(repair.brand)) errors.push('Brand is required');
  if (!validateRequired(repair.model)) errors.push('Model is required');
  if (!validateRequired(repair.status)) errors.push('Status is required');
  
  if (!validatePositiveNumber(repair.cost)) {
    errors.push('Cost must be a positive number');
  }
  
  if (!Array.isArray(repair.tasks) || repair.tasks.length === 0) {
    errors.push('At least one task is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const addRepair = async (repair: Omit<Repair, 'repair_id' | 'created_date'>): Promise<string | null> => {
  try {
    // Generate a unique repair ID
    const date = new Date();
    const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const repair_id = `${month}${randomNum}`;
    
    const repairData = {
      ...repair,
      repair_id,
      created_date: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const validation = validateRepair(repairData as Repair);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const docRef = await addDoc(repairsCollection, repairData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding repair:', error);
    return null;
  }
};

const updateRepair = async (repairId: string, repair: Partial<Repair>): Promise<boolean> => {
  try {
    const repairRef = doc(db, 'repairs', repairId);
    const repairDoc = await getDoc(repairRef);
    
    if (!repairDoc.exists()) {
      throw new Error('Repair not found');
    }
    
    const updatedData = {
      ...repair,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(repairRef, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating repair:', error);
    return false;
  }
};

const getRepairs = async (): Promise<(Repair & { id: string })[]> => {
  try {
    const querySnapshot = await getDocs(repairsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Repair
    }));
  } catch (error) {
    console.error('Error getting repairs:', error);
    return [];
  }
};

const getRepairsByStatus = async (status: string): Promise<(Repair & { id: string })[]> => {
  try {
    const q = query(repairsCollection, where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Repair
    }));
  } catch (error) {
    console.error('Error getting repairs by status:', error);
    return [];
  }
};

const getRepairsByCustomerId = async (customerId: string): Promise<(Repair & { id: string })[]> => {
  try {
    const q = query(repairsCollection, where('customer_id', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Repair
    }));
  } catch (error) {
    console.error('Error getting repairs by customer ID:', error);
    return [];
  }
};

// Product functions
interface Product {
  product_id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  description?: string;
  sku?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const validateProduct = (product: Product): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(product.name)) errors.push('Name is required');
  if (!validateRequired(product.category)) errors.push('Category is required');
  if (!validateRequired(product.supplier)) errors.push('Supplier is required');
  
  if (!validatePositiveNumber(product.quantity)) {
    errors.push('Quantity must be a positive number');
  }
  
  if (!validatePositiveNumber(product.price)) {
    errors.push('Price must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const addProduct = async (product: Omit<Product, 'product_id'>): Promise<string | null> => {
  try {
    // Generate a unique product ID
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const product_id = `PROD-${randomId}`;
    
    const productData = {
      ...product,
      product_id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const validation = validateProduct(productData as Product);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const docRef = await addDoc(productsCollection, productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

const updateProduct = async (productId: string, product: Partial<Product>): Promise<boolean> => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    
    const updatedData = {
      ...product,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(productRef, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

const getProducts = async (): Promise<(Product & { id: string })[]> => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Product
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

const getProductsByCategory = async (category: string): Promise<(Product & { id: string })[]> => {
  try {
    const q = query(productsCollection, where('category', '==', category));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Product
    }));
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

// Technician functions
interface Technician {
  tech_id: string;
  name: string;
  specialization: string[];
  availability: boolean;
  email: string;
  phone: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const validateTechnician = (technician: Technician): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(technician.name)) errors.push('Name is required');
  if (!validateRequired(technician.phone)) errors.push('Phone is required');
  
  if (!Array.isArray(technician.specialization) || technician.specialization.length === 0) {
    errors.push('At least one specialization is required');
  }
  
  if (technician.email && !validateEmail(technician.email)) {
    errors.push('Email format is invalid');
  }
  
  if (typeof technician.availability !== 'boolean') {
    errors.push('Availability must be a boolean value');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const addTechnician = async (technician: Omit<Technician, 'tech_id'>): Promise<string | null> => {
  try {
    // Generate a unique technician ID
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tech_id = `TECH-${randomId}`;
    
    const technicianData = {
      ...technician,
      tech_id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const validation = validateTechnician(technicianData as Technician);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const docRef = await addDoc(techniciansCollection, technicianData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding technician:', error);
    return null;
  }
};

const updateTechnician = async (technicianId: string, technician: Partial<Technician>): Promise<boolean> => {
  try {
    const technicianRef = doc(db, 'technicians', technicianId);
    const technicianDoc = await getDoc(technicianRef);
    
    if (!technicianDoc.exists()) {
      throw new Error('Technician not found');
    }
    
    const updatedData = {
      ...technician,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(technicianRef, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating technician:', error);
    return false;
  }
};

const getTechnicians = async (): Promise<(Technician & { id: string })[]> => {
  try {
    const querySnapshot = await getDocs(techniciansCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Technician
    }));
  } catch (error) {
    console.error('Error getting technicians:', error);
    return [];
  }
};

const getAvailableTechnicians = async (): Promise<(Technician & { id: string })[]> => {
  try {
    const q = query(techniciansCollection, where('availability', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Technician
    }));
  } catch (error) {
    console.error('Error getting available technicians:', error);
    return [];
  }
};

// Authentication functions
const registerUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
};

const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in user:', error);
    return null;
  }
};

const logoutUser = async (): Promise<boolean> => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error logging out user:', error);
    return false;
  }
};

const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export {
  db,
  auth,
  analytics,
  // Customer functions
  addCustomer,
  updateCustomer,
  getCustomers,
  getCustomerById,
  // Repair functions
  addRepair,
  updateRepair,
  getRepairs,
  getRepairsByStatus,
  getRepairsByCustomerId,
  // Product functions
  addProduct,
  updateProduct,
  getProducts,
  getProductsByCategory,
  // Technician functions
  addTechnician,
  updateTechnician,
  getTechnicians,
  getAvailableTechnicians,
  // Authentication functions
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  // Types
  type Customer,
  type Repair,
  type Product,
  type Technician
};

export { getCurrentUser, loginUser, logoutUser, registerUser }