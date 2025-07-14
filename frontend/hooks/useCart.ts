import { useState } from "react";

export function useCart() {
  // Mock cart items
  const [items, setItems] = useState([
    { id: 1, name: "Jollof Rice", price: 20, quantity: 2 },
    { id: 2, name: "Suya", price: 15, quantity: 1 },
  ]);

  // Calculate total
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Add/remove/update item functions (mocked)
  function addItem(item) {
    setItems([...items, item]);
  }
  function removeItem(id) {
    setItems(items.filter((item) => item.id !== id));
  }
  function updateItem(id, updates) {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  return { items, total, addItem, removeItem, updateItem };
}
