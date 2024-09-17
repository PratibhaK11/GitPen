import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import logo from "../../assets/github-mark-white.svg";
import { Link } from "react-router-dom";
import './auth.css'; // Make sure this CSS file includes custom styles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setCurrentUser(res.data.userId);
      setLoading(false);
      navigate("/"); // Use navigate instead of window.location.href
    } catch (err) {
      console.error(err);
      alert("Login Failed!");
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <h3>Sign In</h3>
        </div>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading} className="w-100">
            {loading ? "Loading..." : "Login"}
          </Button>
        </Form>
        <div className="text-center mt-3">
          <p>
            New to GitPen? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
