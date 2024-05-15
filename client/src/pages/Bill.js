import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import authHeader from "../components/Header";

export default function Bill() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://35.173.129.69:8080/api/v1/order/myOrders', {
          headers: {
            'Content-type': 'application/json',
            ...authHeader()
          }
        });
        console.log(res);
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const storeLoggedIn = localStorage.getItem('isLoggedIn');
    if (storeLoggedIn === 'false') {
      navigate('/');
    }
  }, [navigate]);

  const handleOrderClick = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className="container mx-auto p-4"
    >
      <h1 className="text-3xl font-bold mb-4">Your Orders</h1>
      <div className="order-list space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="order-item border rounded-lg shadow-lg">
            <div 
              onClick={() => handleOrderClick(order.id)} 
              className="order-header hover:bg-gray-200 cursor-pointer p-4 flex justify-between items-center"
            >
              <h2 className="text-xl">Date: {order.orderDate}</h2>
              <span className="text-lg">Customer: {order.name}</span>
            </div>
            {expandedOrderId === order.id && (
              <div className="order-details p-4">
                <div className="table-responsive bg-dark my-4 rounded-lg overflow-hidden">
                  <table className="table table-striped table-dark">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderDetails.map((detail, detailIndex) => (
                        <tr key={`${order.id}-${detailIndex}`}>
                          <td>{detailIndex + 1}</td>
                          <td>{detail.productName}</td>
                          <td>${detail.productPrice.toFixed(2)}</td>
                          <td>{detail.quantity || 'N/A'}</td>
                          <td>{(detail.productPrice && detail.quantity) ? `$${(detail.productPrice * detail.quantity).toFixed(2)}` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h2 className="px-2 text-white bg-gray-800 p-2 rounded-b-lg">
                    Order Total: ${order.totalCost.toFixed(2)}
                  </h2>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button className="btn btn-primary">
          <Link to="/home" className="text-white no-underline">Back to Home</Link>
        </button>
      </div>
    </motion.div>
  );
}
