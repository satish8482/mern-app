import { useState } from "react";
import "./App.css";
import Register from "./components/Register";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <div>
        <h1>Welcome to MERN App</h1>
        <Register />
        <ToastContainer />
      </div>
    </>
  );
}

export default App;
