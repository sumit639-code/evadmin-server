import React from 'react'

const TopData = () => {
  return (
    <div className='flex justify-between'>
        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>Total Revenue</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>₹500</h2>
            <img src="/icons/Icon1.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-[#81DE3B]'>18% {' '}</span>more from yesterday</p>
        </div>

        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>Income</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>₹500</h2>
            <img src="/icons/Icon2.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-[#81DE3B]'>18% {' '}</span>more from yesterday</p>
        </div>

        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>Expences</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>₹2500</h2>
            <img src="/icons/Icon3.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-red-500'>12% {' '}</span>more from yesterday</p>
        </div>

        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>New Users</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>₹500</h2>
            <img src="/icons/Icon4.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-[#81DE3B]'>18% {' '}</span>more from yesterday</p>
        </div>
      </div>
  )
}

export default TopData