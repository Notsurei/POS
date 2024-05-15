import {Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import PosPage from './pages/PosPage';
import Bill from './pages/Bill';


function App() {
  return (
    <main>
      <Routes>
        <Route path='/' element = {<Login/>}/>
        <Route path='/home' element = {<PosPage/>}/>
        <Route path='/bill' element = {<Bill/>}/>
      </Routes>
      <ToastContainer stacked position='bottom-right'/>
    </main>
  );
}

export default App;
