import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import Button from "@/components/Button";
import LoadingCircle from "@/components/LoadingCircle";

interface ChatInputButtonProps {
  running: boolean;
  message: string;
  handleSend: () => void;
}

const ChatInputButton = ({
  running,
  message,
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
          <ArrowRight weight='bold' size={20} className='text-[currentColor]' />
        </Button>
      ) : (
        <LoadingCircle />
      )}
    </>
  );
};

export default ChatInputButton;
