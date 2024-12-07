import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    formDataObj.append("image", formData.image);

    try {
      const response = await axios.post(
        "http://13.60.196.148/:3000/register",
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("User registered successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.error ||
        "Registration failed!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Upload Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
