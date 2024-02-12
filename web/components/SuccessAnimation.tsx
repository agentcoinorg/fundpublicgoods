import clsx from "clsx";

export const SuccessAnimation = (props: { className?: string }) => {
  const { className } = props;
  return (
    <div className='relative mb-4'>
      <div className='absolute inset-0 bg-indigo-100 rounded-full opacity-0 success-circle-blowout' />
      <svg
        className={clsx("overflow-visible", className)}
        viewBox='0 0 257 257'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        <circle
          cx='128.145'
          cy='128.137'
          r='124'
          fill='white'
          strokeWidth='8'
          className='stroke-indigo-100 success-circle'
        />
        <path
          d='M84.3818 136.89L110.64 163.148L171.908 101.879'
          strokeWidth='16'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='stroke-indigo-600 success-check'
        />
      </svg>
    </div>
  );
};
