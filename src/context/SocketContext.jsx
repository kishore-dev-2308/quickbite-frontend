import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const activeRoomsRef = useRef(new Set());

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected with ID:', socket.id);
      setIsConnected(true);

      // Rejoin any active rooms if socket reconnected
      activeRoomsRef.current.forEach((orderId) => {
        socket.emit('join_order', orderId);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.warn('[WebSocket] Connection error:', error.message);
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const subscribeToOrder = (orderId, callback) => {
    if (!socketRef.current || !orderId) return;

    const socket = socketRef.current;
    activeRoomsRef.current.add(orderId);

    // Join room
    socket.emit('join_order', orderId);

    // Listener for status updates
    const handleUpdate = (data) => {
      if (data.orderId === orderId) {
        callback(data);
      }
    };

    socket.on('order_status_updated', handleUpdate);

    // Return cleanup function
    return () => {
      activeRoomsRef.current.delete(orderId);
      socket.emit('leave_order', orderId);
      socket.off('order_status_updated', handleUpdate);
    };
  };

  const subscribeToKitchenFeed = (onNewOrder, onStatusUpdate) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleNewOrder = (data) => {
      if (onNewOrder && data?.order) {
        onNewOrder(data.order);
      }
    };

    const handleStatusUpdate = (data) => {
      if (onStatusUpdate && data?.order) {
        onStatusUpdate(data.order, data);
      }
    };

    socket.on('new_order_placed', handleNewOrder);
    socket.on('order_status_updated_broadcast', handleStatusUpdate);

    return () => {
      socket.off('new_order_placed', handleNewOrder);
      socket.off('order_status_updated_broadcast', handleStatusUpdate);
    };
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    subscribeToOrder,
    subscribeToKitchenFeed
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
