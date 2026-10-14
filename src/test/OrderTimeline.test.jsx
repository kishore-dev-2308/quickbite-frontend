import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderTimeline from '../components/OrderTimeline';

describe('OrderTimeline UI Component', () => {
  const mockOrder = {
    _id: 'ord-999',
    status: 'Preparing',
    statusHistory: [
      {
        status: 'Order Received',
        timestamp: new Date().toISOString(),
        note: 'Order created'
      },
      {
        status: 'Preparing',
        timestamp: new Date().toISOString(),
        note: 'Chef is baking'
      }
    ]
  };

  it('renders current order status and all lifecycle steps', () => {
    render(<OrderTimeline order={mockOrder} />);

    // Current status header
    expect(screen.getAllByText('Preparing').length).toBeGreaterThanOrEqual(1);

    // Lifecycle steps
    expect(screen.getAllByText('Order Received').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Kitchen Preparing')).toBeInTheDocument();
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('triggers simulation callback when simulate button is clicked', () => {
    const handleSimulate = vi.fn();
    render(
      <OrderTimeline
        order={mockOrder}
        onSimulateNext={handleSimulate}
        isSimulating={false}
      />
    );

    const button = screen.getByRole('button', { name: /simulate next stage/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleSimulate).toHaveBeenCalledTimes(1);
  });
});
