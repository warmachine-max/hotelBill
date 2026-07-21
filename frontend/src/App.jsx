import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductPage from './pages/ProductPage';
import NewKOTPage from './pages/NewKOTPage';
import BillPage from './pages/BillPage';
import ManageMenuPage from './pages/ManageMenuPage'; // Added import

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/kot" element={<NewKOTPage />} />
        <Route path="/bill/:id" element={<BillPage />} />
        <Route path="/manage-menu" element={<ManageMenuPage />} /> {/* Added route */}
      </Routes>
    </BrowserRouter>
  );
}