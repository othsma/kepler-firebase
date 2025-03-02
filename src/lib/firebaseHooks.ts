import { useState, useEffect } from 'react';
import {
  getCustomers,
  getRepairs,
  getProducts,
  getTechnicians,
  getRepairsByStatus,
  getRepairsByCustomerId,
  getProductsByCategory,
  getAvailableTechnicians,
  getCurrentUser,
  type Customer,
  type Repair,
  type Product,
  type Technician
} from './firebase';
import { User } from 'firebase/auth';

// Hook for getting current authenticated user
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};

// Hook for getting all customers
export const useCustomers = () => {
  const [customers, setCustomers] = useState<(Customer & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { customers, loading, error };
};

// Hook for getting all repairs
export const useRepairs = () => {
  const [repairs, setRepairs] = useState<(Repair & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        const data = await getRepairs();
        setRepairs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  return { repairs, loading, error };
};

// Hook for getting repairs by status
export const useRepairsByStatus = (status: string) => {
  const [repairs, setRepairs] = useState<(Repair & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRepairsByStatus = async () => {
      try {
        setLoading(true);
        const data = await getRepairsByStatus(status);
        setRepairs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchRepairsByStatus();
  }, [status]);

  return { repairs, loading, error };
};

// Hook for getting repairs by customer ID
export const useRepairsByCustomerId = (customerId: string) => {
  const [repairs, setRepairs] = useState<(Repair & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRepairsByCustomerId = async () => {
      try {
        setLoading(true);
        const data = await getRepairsByCustomerId(customerId);
        setRepairs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchRepairsByCustomerId();
    } else {
      setRepairs([]);
      setLoading(false);
    }
  }, [customerId]);

  return { repairs, loading, error };
};

// Hook for getting all products
export const useProducts = () => {
  const [products, setProducts] = useState<(Product & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Hook for getting products by category
export const useProductsByCategory = (category: string) => {
  const [products, setProducts] = useState<(Product & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        const data = await getProductsByCategory(category);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchProductsByCategory();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [category]);

  return { products, loading, error };
};

// Hook for getting all technicians
export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState<(Technician & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true);
        const data = await getTechnicians();
        setTechnicians(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  return { technicians, loading, error };
};

// Hook for getting available technicians
export const useAvailableTechnicians = () => {
  const [technicians, setTechnicians] = useState<(Technician & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAvailableTechnicians = async () => {
      try {
        setLoading(true);
        const data = await getAvailableTechnicians();
        setTechnicians(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTechnicians();
  }, []);

  return { technicians, loading, error };
};