import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, fileContent, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{fileName}</h2>
        <pre>{fileContent}</pre>
      </div>
    </div>
  );
};

export default Modal;
