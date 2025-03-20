import React from 'react';
import TopData from '../components/ScooterManagement/TopData';
import TimeFrame from '../components/common/TimeFrame';
import ScooterData from '../components/ScooterManagement/ScooterData';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScooterManagement = () => {
  return (
    <div>
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="flex mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Scooter Management</h1>
        </div>
        <div className="absolute right-[27px]">
          {/* <TimeFrame /> */}
        </div>
      </div>
      
      {/* <TopData /> */}

      <div className='mt-2'>
        <ScooterData />
      </div>
    </div>
  );
};

export default ScooterManagement;