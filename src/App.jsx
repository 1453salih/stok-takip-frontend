import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductTable from "./pages/sale.jsx";

function App() {

  return (
    <Router>
        <Routes>
            <Route path="/salih" element={<ProductTable />} />
        </Routes>
    </Router>
  )
}

export default App
