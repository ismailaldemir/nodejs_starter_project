import React from "react";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ContactPage from "./pages/ContactPage";
import Auth from "./components/Auth/Auth";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import "./App.css";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";

function App() {
  return (
    <React.Fragment>
      {/* <HomePage /> */}
      {/* <ShopPage/> */}
      {/* <ContactPage /> */}
      {/* <AuthPage/> */}
      {/* <CartPage/> */}
      {/* <BlogPage /> */}
      <BlogDetailsPage />
      {/* <ProductDetailsPage/> */}
    </React.Fragment>
  );
}

export default App;
