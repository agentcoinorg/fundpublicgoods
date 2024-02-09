import { ArrowRight, Share } from "@phosphor-icons/react";
import Button from "./Button";
import Modal, { ModalProps } from "./ModalBase";
import { SuccessAnimation } from "./SuccessAnimation";

interface SuccessModalProps extends ModalProps {
  onShare: () => void;
}

type SparkleProps = {
  width?: number;
  duration?: string;
  translate?: string;
  scale?: string;
  fill?: string;
  top?: string;
  left?: string;
};

const generateSparkles = (count: number = 100) => {
  let sparkles = [];
  for (let i = 0; i < count; i++) {
    const isVertical = Math.random() > 0.5;

    const sparkle: SparkleProps = {
      width: Math.random() * 20 + 10,
      duration: `${Math.random() * 3 + 3}s`,
      translate: `${Math.random() * 20 * (Math.random() > 0.5 ? -1 : 1)}%`,
      scale: `${Math.random() * 0.5 + 1}`,
      fill: Math.random() < 0.7 ? "indigo" : "white",
    };

    if (isVertical) {
      sparkle.top =
        Math.random() > 0.5
          ? `${Math.random() * -20 - 10}%`
          : `${100 + Math.random() * 20 + 10}%`;

      sparkle.left = `${Math.random() * 100}%`;
    } else {
      sparkle.left =
        Math.random() > 0.5
          ? `${Math.random() * -20 - 3}%`
          : `${100 + Math.random() * 20 + 3}%`;

      sparkle.top = `${Math.random() * 100}%`;
    }

    sparkles.push(sparkle);
  }
  return sparkles;
};

const SuccessModal = ({
  isOpen,
  title,
  onClose,
  onShare,
}: SuccessModalProps) => {
  const sparkles = generateSparkles(15);
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      contentStyles={{ overflow: "visible" }}>
      <div className='space-y-4 w-full flex flex-col items-center'>
        <SuccessAnimation className='w-48 h-auto' />
        <div className='text-center'>
          Thank you! You&apos;re the reason we can have nice things.
        </div>
      </div>
      <div className='flex items-center justify-between space-x-4 pt-4 border-t-2 border-indigo-100'>
        <Button
          onClick={onShare}
          className='!bg-white hover:!bg-indigo-50 !text-indigo-600'
          type='submit'>
          <div>Share this strategy</div>
          <Share weight='bold' size={16} className='text-[currentColor]' />
        </Button>
        <Button onClick={() => (window.location.href = "/")}>
          <div>Fund More Projects</div>
          <ArrowRight weight='bold' />
        </Button>
      </div>
      <div className='opacity-0 transform-center absolute inset-0 sparkles-wrapper'>
        {sparkles.map(
          ({ width, duration, translate, scale, fill, top, left }, i) => (
            <div
              key={i}
              className='absolute drop-shadow-md'
              style={{ top: top, left: left }}>
              <svg
                className='h-auto sparkle'
                viewBox='0 0 159 193'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                style={
                  {
                    width: width,
                    "--sparkle-duration": duration,
                    "--sparkle-translate": translate,
                    "--sparkle-scale": scale,
                  } as React.CSSProperties & { [key: string]: any }
                }>
                <path
                  d='M79.4285 187.766C70.8677 119.274 75.1508 101.164 6 91.285C79.4285 86.0169 68.5631 52.1018 79.4285 6.00056C90.2938 52.1018 79.4285 86.0169 152.857 91.285C83.7062 101.164 87.9892 119.274 79.4285 187.766Z'
                  stroke='#3730A3'
                  strokeWidth='10.3689'
                  strokeLinejoin='round'
                  className={
                    fill === "white" ? "fill-white" : "fill-indigo-500"
                  }
                />
              </svg>
            </div>
          )
        )}
      </div>
    </Modal>
  );
};

export default SuccessModal;
