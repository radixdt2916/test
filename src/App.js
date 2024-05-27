import React from "react";
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login"
import EmiCalculator from "./components/EmiCalculator"

function App() {
  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/emicalculator" element={<EmiCalculator />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SingUp />} /> */}
          {/* <Route path="/uploadeFile" element={<UploadeFile />} />
          <Route path="/productData" element={<ProductDetail />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
