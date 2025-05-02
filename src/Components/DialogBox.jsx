import React from 'react'

const DialogBox = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">{message}</p>
          <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            OK
          </button>
        </div>
      </div>
    );
  };

export default DialogBox
