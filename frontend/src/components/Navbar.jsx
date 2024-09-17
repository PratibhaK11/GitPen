import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NavBar = () => {
  const [profilePicUrl, setProfilePicUrl] = useState('');

  useEffect(() => {
    const fetchUserProfilePic = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/userProfile/${userId}`);
          setProfilePicUrl(response.data.profilePicUrl || '/path/to/default/profile.png');
        } catch (err) {
          console.error("Error fetching user profile picture:", err);
          setProfilePicUrl('/path/to/default/profile.png'); // Fallback image
        }
      }
    };

    fetchUserProfilePic();
  }, []);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar">
      <Navbar.Brand as={Link} to="/">
        <span className="ms-2">GitPen</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/create">
            Create a Repository
          </Nav.Link>
          <Nav.Link as={Link} to="/profile">
            <img
              src={profilePicUrl}
              alt="Profile"
              className="profile-pic"
            />
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
