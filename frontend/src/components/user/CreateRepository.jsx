import React, { useState } from 'react';
import './CreateRepository.css'; 
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const CreateRepo = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState(true); 
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); 

  const handleCreateRepo = async () => {
    const owner = localStorage.getItem('userId'); 

    try {
      const response = await axios.post(`${API_BASE_URL}/repo/create`, {
        owner,
        name,
        description,
        visibility,
        content,
      });
      setSuccess(response.data.message);
      setError('');
      navigate('/');
    } catch (err) {
      setError('Error creating repository: ' + (err.response?.data?.error || err.message));
      setSuccess('');
    }
  };

  return (
    <div className="create-repo-container">
     
      <div className="form1">
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
            className="visibility-checkbox"
          />
        </label>
        <button onClick={handleCreateRepo}>Create Repository</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
};

export default CreateRepo;
