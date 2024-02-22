import clsx from "clsx";
import colors from "tailwindcss/colors";

export interface IconProps {
  size?: number;
  className?: string;
}

export const SparkleIcon = ({ size = 32, className }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 256 256'
      className={clsx(
        "transform transition-transform duration-300 ease-in-out",
        "group-hover/logo:scale-125 group-hover/logo:-translate-x-px sm:group-hover/logo:scale-175 sm:group-hover/logo:-translate-x-1",
        "group-hover/prompt:scale-125",
        className
      )}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M176.599 46.841C177.009 45.5566 178.826 45.5566 179.236 46.841V46.841C183.595 60.507 194.303 71.2152 207.969 75.5741V75.5741C209.254 75.9838 209.254 77.8013 207.969 78.211V78.211C194.303 82.57 183.595 93.2782 179.236 106.944V106.944C178.826 108.229 177.009 108.229 176.599 106.944V106.944C172.24 93.2782 161.532 82.57 147.866 78.211V78.211C146.582 77.8013 146.582 75.9838 147.866 75.5741V75.5741C161.532 71.2152 172.24 60.507 176.599 46.841V46.841Z'
        stroke-width='8.35645'
        className='group-hover/logo:animate-[pulse_1s_ease-in-out_infinite] group-hover/prompt:animate-[pulse_1s_ease-in-out_infinite] group-hover/prompt:fill-blue-400 fill-indigo-500 group-hover/prompt:stroke-blue-800 stroke-indigo-800'
      />
      <path
        d='M112.177 75.9993C112.59 74.7066 114.419 74.7066 114.831 75.9993L123.352 102.712C127.739 116.466 138.515 127.242 152.268 131.629L178.981 140.15C180.274 140.562 180.274 142.391 178.981 142.803L152.268 151.324C138.515 155.711 127.739 166.487 123.352 180.241L114.831 206.954C114.419 208.246 112.59 208.246 112.177 206.954L103.657 180.241C99.27 166.487 88.4934 155.711 74.7401 151.324L48.0271 142.803C46.7344 142.391 46.7344 140.562 48.0271 140.15L74.7401 131.629C88.4934 127.242 99.27 116.466 103.657 102.712L112.177 75.9993Z'
        stroke-width='11.1419'
        className='group-hover/logo:animate-[pulse_1s_300ms_ease-in-out_infinite] group-hover/prompt:animate-[pulse_1s_300ms_ease-in-out_infinite] group-hover/prompt:fill-blue-400 group-hover/prompt:stroke-blue-800 fill-indigo-500 stroke-indigo-800'
      />
    </svg>
  );
};

export const XLogo = ({ size = 16, className }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}>
      <path
        d='M18.2439 2.25H21.5519L14.3249 10.51L22.8269 21.75H16.1699L10.9559 14.933L4.98991 21.75H1.67991L9.40991 12.915L1.25391 2.25H8.07991L12.7929 8.481L18.2439 2.25ZM17.0829 19.77H18.9159L7.08391 4.126H5.11691L17.0829 19.77Z'
        fill='currentColor'
      />
    </svg>
  );
};

export const SubstackLogo = ({ size = 16, className }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}>
      <path
        d='M3.89453 2.73682H20.1045V4.92605H3.89453V2.73682Z'
        fill='currentColor'
      />
      <path
        d='M20.1045 6.91009H3.89453V9.09969H20.1045V6.91009Z'
        fill='currentColor'
      />
      <path
        d='M3.89453 11.0834V21.2636L11.9992 16.7171L20.1052 21.2636V11.0834H3.89453Z'
        fill='currentColor'
      />
    </svg>
  );
};

export interface ScoreIconProps extends IconProps {
  rank: number;
}

export const ScoreIcon = ({ size = 20, rank, className }: ScoreIconProps) => {
  const ranking = rank > 0.74 ? "high" : rank < 0.53 ? "low" : "med";
  const fills = {
    high: {
      fill: colors.green[500],
      opacities: [1, 1, 1],
    },
    med: {
      fill: colors.amber[500],
      opacities: [1, 1, 0.3],
    },
    low: {
      fill: colors.red[500],
      opacities: [1, 0.3, 0.3],
    },
  };

  return (
    <svg
      width={size}
      height={(size * 2) / 3}
      viewBox='0 0 12 8'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <rect
        width='3'
        height='4'
        transform='matrix(-1 0 0 1 3.5 4)'
        fill={fills[ranking].fill}
        fillOpacity={fills[ranking].opacities[0]}
      />
      <rect
        width='3'
        height='6'
        transform='matrix(-1 0 0 1 7.5 2)'
        fill={fills[ranking].fill}
        fillOpacity={fills[ranking].opacities[1]}
      />
      <rect
        width='3'
        height='8'
        transform='matrix(-1 0 0 1 11.5 0)'
        fill={fills[ranking].fill}
        fillOpacity={fills[ranking].opacities[2]}
      />
    </svg>
  );
};
