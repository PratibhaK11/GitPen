import React, { useState } from 'react';
import './CreateRepository.css'; 
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const CreateRepo = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState(true); 
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleCreateRepo = async () => {
    const owner = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    try {
      const response = await axios.post('http://localhost:3002/repo/create', {
        owner,
        name,
        description,
        visibility,
        content,
      });
      setSuccess(response.data.message);
      setError('');
      // Redirect to dashboard after successful creation
      navigate('/');
    } catch (err) {
      setError('Error creating repository: ' + (err.response?.data?.error || err.message));
      setSuccess('');
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Create Repository</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter repository name"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description (optional)"
      />
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter initial content (optional)"
      />
      <label>
        Visibility:
        <input
          type="checkbox"
          checked={visibility}
          onChange={() => setVisibility(!visibility)}
        />
      </label>
      <button onClick={handleCreateRepo}>Create Repository</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default CreateRepo;
