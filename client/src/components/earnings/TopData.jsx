import React from 'react'

const TopData = () => {
  return (
    <div className='flex gap-5'>
        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>Total Sales</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>₹500</h2>
            <img src="/earn/Icon2.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-[#81DE3B]'>18% {' '}</span>more from yesterday</p>
        </div>

        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>Total Order</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>500</h2>
            <img src="/earn/Icon3.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-[#81DE3B]'>18% {' '}</span>more from yesterday</p>
        </div>

        <div className='border border-gray-400 h-[112px] w-[260px] rounded-lg py-2 px-3 relative'> 
          <p>Total Pending</p>
          <div className='flex items-center justify-between py-1'>
            <h2 className='text-4xl font-semibold'>2500</h2>
            <img src="/earn/Icon1.png" alt="Icon" className='w-[40px] h-[40px] mr-2' />
          </div>
          <p className=''><span className='text-red-500'>12% {' '}</span>more from yesterday</p>
        </div>
      </div>
  )
}

export default TopData