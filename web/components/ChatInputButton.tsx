import { ArrowClockwise, ArrowRight } from "@phosphor-icons/react/dist/ssr";

import Button from "@/components/Button";
import LoadingCircle from "@/components/LoadingCircle";

interface ChatInputButtonProps {
  running: boolean;
  message: string;
  regenerate?: boolean;
  handleSend: () => void;
}

const ChatInputButton = ({
  running,
  message,
  regenerate,
  handleSend,
}: ChatInputButtonProps) => {
  return (
    <>
      {!running ? (
        <Button
          hierarchy='secondary'
          onClick={handleSend}
          disabled={message.length === 0}
          className='!p-1 !border-2'
          type='submit'>
          {regenerate ? (
            <ArrowClockwise
              weight='bold'
              size={20}
              className='text-[currentColor]'
            />
          ) : (
            <ArrowRight
              weight='bold'
              size={20}
              className='text-[currentColor]'
            />
          )}
        </Button>
      ) : (
        <LoadingCircle className='!w-8 !h-8 ' />
      )}
    </>
  );
};

export default ChatInputButton;
