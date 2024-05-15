import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import {motion} from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useDispatch} from 'react-redux';
import {authAction} from '../store/index'


export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [input, setInput] = useState({
    userEmail:'',
    password:''
  });
 


  const SendRequest = async () => {
    try {
      const res = await axios.post('http://35.173.129.69:8080/api/v1/auth/login', {
        userEmail: input.userEmail,
        password: input.password,
      });
      console.log('Response:', res); // Log toàn bộ đối tượng phản hồi
      console.log('Response Data:', res.data); // Log dữ liệu cụ thể từ phản hồi
      return res.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Failed to login. Please try again.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await SendRequest();
    if (data && data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('isLoggedIn', true);
      toast.success('Login successful. Redirecting...', { autoClose: 2000 });

      setTimeout(() => {
        dispatch(authAction.login());
        navigate('/home');
      }, 2000);
    } else {
      toast.error('Invalid email or password');
      dispatch(authAction.logout());
    }
  };

  useEffect(() => {
    const storeLoggedIn = localStorage.getItem('isLoggedIn');
    if(storeLoggedIn === 'false'){
      dispatch(authAction.logout());
      navigate('/');
    }
    else{
      dispatch(authAction.login());
      navigate('/home');
    }
  }, [dispatch, navigate]);


  return (
    <motion.div
      className='flex items-center justify-center h-screen bg-transparent'
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
      type: "spring",
      stiffness: 260,
      damping: 20
    }}>
      <form className='bg-white e shadow-md rounded px-8 pt-6 pb-8 mb-6 size-max' onSubmit={handleSubmit}>
      <div className='text-center text-zinc-700'>Login</div>
      <div className='mb-4 '>
        <label
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            onChange={(e) => setInput({...input, userEmail: e.target.value})}
            required
          ></input>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={(e) => setInput({...input, password: e.target.value})}
            required
          ></input>
          
          <div>
            <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="btn btn-primary w-full" type="submit">Login</motion.button>
            {/* <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="btn btn-secondary justify-end"><Link to = "/register">Create an account</Link></motion.button> */}
          </div>
          {/* <div class="flex items-center justify-center">
            <Link to= "/forgotpassword">Forgot your password?</Link>
          </div> */}
        </div>
      </form>
    </motion.div>
  );
}
