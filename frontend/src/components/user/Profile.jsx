import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "", userId: "", profilePicUrl: "" });
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/userProfile/${userId}`);
          setUserDetails({ ...response.data, userId });
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
          setError("Failed to fetch user details. Please try again.");
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      await handleUpload(file); // Automatically upload after selection
    }
  };

  const handleUpload = async (file) => {
    if (file) {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('profilePic', file);

      try {
        const response = await axios.put(
          `${API_BASE_URL}/updateProfile/${userDetails.userId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        // Update profilePicUrl with a cache-busting query parameter
        const newProfilePicUrl = `${response.data.profilePicUrl}?${new Date().getTime()}`;

        setUserDetails((prevDetails) => ({
          ...prevDetails,
          profilePicUrl: newProfilePicUrl,
        }));

        console.log('Profile updated:', response.data);
      } catch (err) {
        setError('Error updating profile picture. Please try again.');
        console.error('Error updating profile:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProfilePicClick = () => {
    document.getElementById("profilePicInput").click();
  };

  return (
    <>
      <Navbar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current="page"
          icon={BookIcon}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          onClick={() => navigate("/repo")}
          icon={RepoIcon}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);
          window.location.href = "/";
        }}
        style={{ position: "fixed", bottom: "50px", right: "50px" }}
        id="logout"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image" onClick={handleProfilePicClick}>
            <img src={userDetails.profilePicUrl || '/path/to/default/profile.png'} alt="Profile" />
            <div className="edit-icon">✎</div>
            <input
              type="file"
              id="profilePicInput"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="follow-btn">Follow</button>

          <div className="follower">
            <p>10 Followers</p>
            <p>3 Following</p>
          </div>
        </div>

        <div className="heat-map-section">
          <HeatMapProfile userId={userDetails.userId} /> {/* Ensure userId is passed */}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
};

export default Profile;
