import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemCard from '../components/MenuItemCard';
import { CartProvider } from '../context/CartContext';

const mockItem = {
  _id: 'item-101',
  name: 'Truffle Mushroom Burger',
  description: 'Artisan brioche with black truffle aioli',
  price: 14.99,
  category: 'Burger',
  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  rating: 4.9,
  preparationTimeMinutes: 18
};

describe('MenuItemCard UI Component', () => {
  it('renders item name, price, rating and category correctly', () => {
    render(
      <CartProvider>
        <MenuItemCard item={mockItem} />
      </CartProvider>
    );

    expect(screen.getByText('Truffle Mushroom Burger')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
  });

  it('clicking Add to Cart displays quantity stepper with count 1', () => {
    render(
      <CartProvider>
        <MenuItemCard item={mockItem} />
      </CartProvider>
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    // Quantity should now display 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
