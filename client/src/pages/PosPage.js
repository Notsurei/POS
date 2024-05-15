import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import authHeader from '../components/Header';
import { useDispatch } from "react-redux";
import { authAction } from "../store";

function POSPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const size = 6; // Số sản phẩm mỗi trang
  const [input, setInput] = useState({  
    name: "",
  });

  const toastOptions = {
    autoClose: 400,
    pauseOnHover: true,
  };

  const fetchProducts = async (page) => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://35.173.129.69:8080/api/v1/product/business', {
        params: {
          page: page,
          size: size
        },
        headers: {
          'Content-type': 'application/json',
          ...authHeader()
        }
      });
      console.log('Response:', res.data);
      setTotalPages(res.data.totalPages); // Chỉnh sửa để lấy totalPages từ phản hồi API
      setProducts(res.data.content);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addProductToCart = async (product) => {
    let findProductInCart = await cart.find((i) => {
      return i.id === product.id;
    });

    if (findProductInCart) {
      let newCart = [];
      let newItem;

      cart.forEach((cartItem) => {
        if (cartItem.id === product.id) {
          newItem = {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            totalAmount: cartItem.price * (cartItem.quantity + 1),
          };
          newCart.push(newItem);
        } else {
          newCart.push(cartItem);
        }
      });

      setCart(newCart);
      toast(`Added ${newItem.name} to cart`, toastOptions);
    } else {
      let addingProduct = {
        ...product,
        quantity: 1,
        totalAmount: product.price,
      };
      setCart([...cart, addingProduct]);
      toast(`Added ${product.name} to cart`, toastOptions);
    }
  };

  const Pay = async () => {
    try {
      if (input.name === "") {
        toast.error("Please fill all the fields");
        return;
      }
      const payload = {
        name: input.name,
        orderDetailRequestDTOs: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        }))
      }
      console.log(payload);
      const res = await axios.post(
        "http://35.173.129.69:8080/api/v1/order", 
        payload,
        {
          headers: {
            'Content-type': 'application/json',
            ...authHeader()
          }
        },
      );

      const data = res.data;
      console.log(res);
      toast.success("Your bill has been paid");
      return data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to pay");
    }
  };

  const removeProduct = async (product) => {
    const newCart = cart.filter((cartItem) => cartItem.id !== product.id);
    setCart(newCart);
  };

  const componentRef = useRef();

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    let newTotalAmount = 0;
    cart.forEach((icart) => {
      newTotalAmount = newTotalAmount + parseInt(icart.totalAmount);
    });
    setTotalAmount(newTotalAmount);
  }, [cart]);

  useEffect(() => {
    const storeLoggedIn = localStorage.getItem('isLoggedIn');
    if (storeLoggedIn === 'false') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', false);
    localStorage.removeItem('authToken');
    dispatch(authAction.logout());
    navigate('/');
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const displayProducts = products.map((product, index) => (
    <div key={index} className="col-span-1 p-2">
      <div className="card border rounded-lg shadow-lg" style={{ width: "100%" }}>
        <img
          src={product.image}
          className="card-img-top h-48 w-full object-cover rounded-t-lg"
          alt={product.name}
        />
        <div className="card-body p-4">
          <h5 className="card-title text-lg font-semibold">{product.name}</h5>
          <p className="card-text text-gray-700">${product.price}</p>
          <button
            onClick={() => addProductToCart(product)}
            className="btn btn-primary w-full mt-2"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  ));

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
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/3">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayProducts}
            </div>
          )}
          <div className="mt-4 flex justify-between">
            <button
              onClick={handlePreviousPage}
              className="btn btn-primary"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              className="btn btn-primary"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
        <div className="lg:w-1/3 lg:pl-4 mt-6 lg:mt-0">
          <div style={{ display: "none" }}>
            <div cart={cart} totalAmount={totalAmount} ref={componentRef} />
          </div>
          <div className="table-responsive bg-dark p-4 rounded-lg shadow-lg">
            <table className="table table-responsive table-dark table-hover">
              <thead>
                <tr>
                  <td>#</td>
                  <td>Name</td>
                  <td>Price</td>
                  <td>Qty</td>
                  <td>Total</td>
                  <td>Action</td>
                </tr>
              </thead>
              <tbody>
                {cart.length ? (
                  cart.map((cartProduct, key) => (
                    <tr key={key}>
                      <td>{cartProduct.id}</td>
                      <td>{cartProduct.name}</td>
                      <td>${cartProduct.price.toFixed(2)}</td>
                      <td>{cartProduct.quantity}</td>
                      <td>${cartProduct.totalAmount.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeProduct(cartProduct)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No Item in Cart</td>
                  </tr>
                )}
              </tbody>
            </table>
            <h2 className="px-2 text-white mt-4">Total Amount: ${totalAmount.toFixed(2)}</h2>
          </div>
          <div className="mt-4">
            <input
              className="w-full p-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Customer name"
              id="inline-full-name"
              type="text"
              onChange={(e) => setInput({ ...input, name: e.target.value })}
              required
            ></input>
            <div className="mt-4">
            {totalAmount !== 0 ? (
              <button className="btn btn-primary w-full" onClick={() => Pay()}>
                Pay Now
              </button>
            ) : (
              <div className="text-center text-gray-700">Please add a product to the cart</div>
            )}
              
            </div>
          </div>
          <div className="mt-4">
          <button className="btn btn-error w-full" onClick={handleLogout}>
                Log out
              </button>
            <div className="mt-4">
              <Link to='/bill' className="btn btn-neutral w-full text-center">
                Bill
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default POSPage;
