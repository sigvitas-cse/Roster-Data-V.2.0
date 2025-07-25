import React from 'react';
import { useNavigate } from 'react-router-dom';
// import errorImg from '../../assets/bg/error.png';
import errorImg from '../../assets/bg/error.jpg';


const ErrorModal = ({ error, onClose }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    window.close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <img 
        src={errorImg} 
        alt="Error Background"
        className="absolute inset-0 object-cover w-full h-full" 
      />

      <div className="p-0 max-w-md mx-auto relative z-10 mt-0 bg-opacity-00 ">
        {/* <p className="text-red-600 px-0 bg-white">{error}</p> */}

        {/* Go Back Button Below the Message */}
        <div className="mt-4 text-right">
          <button
            onClick={handleGoBack}
            // className="text-red-700 font-semibold hover:underline hover:bg-red-700 hover:text-white px-0 py-1 rounded"
            className="text-white text-3xl font-semibold  px-0 py-1 "

          >
            <span className='hover:underline'>← </span><span className=' hover:underline'>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
