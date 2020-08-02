import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  loading: boolean;
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Omit<Product, 'quantity'>) => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex > -1) {
        const existingProduct = products[productIndex];
        existingProduct.quantity += 1;
        const newProducts = products;
        newProducts[productIndex] = existingProduct;
        setProducts([...newProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      } else {
        setProducts([
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([
            ...products,
            { id, title, image_url, price, quantity: 1 },
          ]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex > -1) {
        const existingProduct = products[productIndex];
        existingProduct.quantity += 1;
        const newProducts = products;
        newProducts[productIndex] = existingProduct;
        setProducts([...newProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      } else {
        throw new Error('This product is not in the cart');
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex > -1) {
        const existingProduct = products[productIndex];

        if (existingProduct.quantity === 1) {
          await AsyncStorage.setItem(
            '@GoMarketplace:products',
            JSON.stringify(products.filter(product => product.id !== id)),
          );

          setProducts(oldProducts =>
            oldProducts.filter(product => product.id !== id),
          );
        } else {
          existingProduct.quantity -= 1;
          const newProducts = products;
          newProducts[productIndex] = existingProduct;
          setProducts([...newProducts]);

          await AsyncStorage.setItem(
            '@GoMarketplace:products',
            JSON.stringify(newProducts),
          );
        }
      } else {
        throw new Error('This product is not in the cart');
      }
    },
    [products],
  );

  const value = useMemo(
    () => ({ addToCart, increment, decrement, products, loading }),
    [products, loading, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
