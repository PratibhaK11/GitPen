import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";
import axios from "axios";
import { PlusIcon } from "@primer/octicons-react"; // Import PlusIcon

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NavBar = () => {
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar">
        <Navbar.Brand as={Link} to="/">
          <span className="ms-2">GitPen</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <div className="nav-item-wrapper">
              <Nav.Link onClick={handleShow} className="documentation-link">
                Documentation
              </Nav.Link>
              <Nav.Link as={Link} to="/create" className="create-repo-link">
                <PlusIcon className="plus-icon" />
                <span className="create-repo-text">Create a Repository</span>
              </Nav.Link>
            </div>

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

      {/* Documentation Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>GitPen CLI Documentation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="card-subtitle mb-2 text-muted">Setup</h6>
          <p><strong>1. Clone GitPen from GitHub</strong></p>
          <p>Use the following command to clone the repository:</p>
          <pre><code>git clone &lt;https://github.com/PratibhaK11/GitPen&gt;</code></pre>
          <p>Navigate to the project directory:</p>
          <pre><code>cd &lt;project-directory&gt;</code></pre>
          <p><strong>2. Install Dependencies</strong></p>
          <p>Run the following command to install the required dependencies:</p>
          <pre><code>npm install</code></pre>

          <h6 className="card-subtitle mb-2" style={{ color: '#FF4500' }}>Commands</h6>
          <ul>
            <li><strong>start</strong> - Starts a new server.<br />
              <code>node index.js start</code></li>
            <li><strong>init</strong> - Initialise a new repository.<br />
              <code>node index.js init</code></li>
            <li><strong>add &lt;file&gt;</strong> - Add a file to the repository.<br />
              <code>node index.js add &lt;file&gt;</code></li>
            <li><strong>commit &lt;message&gt;</strong> - Commit the staged files.<br />
              <code>node index.js commit &lt;message&gt;</code></li>
            <li><strong>login &lt;email&gt; &lt;password&gt;</strong> - Log in with email and password.<br />
              <code>node index.js login &lt;email&gt; &lt;password&gt;</code></li>
            <li><strong>push &lt;repoId&gt;</strong> - Push commits to S3 for the specified repository.<br />
              <code>node index.js push &lt;repoId&gt;</code></li>
            <li><strong>pull</strong> - Pull commits from S3.<br />
              <code>node index.js pull</code></li>
            <li><strong>revert &lt;commitID&gt;</strong> - Revert to a specific commit.<br />
              <code>node index.js revert &lt;commitID&gt;</code></li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavBar;
