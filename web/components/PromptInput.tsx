import { ChangeEvent, Dispatch, SetStateAction } from "react";
import ChatInputButton from "./ChatInputButton";
import TextField, { TextFieldProps } from "./TextField";
import clsx from "clsx";

interface PromptInputProps extends TextFieldProps {
  setPrompt: Dispatch<SetStateAction<string>>;
  isWaiting: boolean;
  sendPrompt: (prompt: string) => Promise<void>;
  prompt: string;
}

const PromptInput = ({
  setPrompt,
  isWaiting,
  sendPrompt,
  prompt,
}: PromptInputProps) => {
  return (
    <TextField
      value={prompt}
      className={clsx(
        "!rounded-full !shadow-lg",
        "!shadow-primary-shadow/5 group-hover:!shadow-xl group-hover:!shadow-primary-shadow/20",
        "!border-indigo-300 group-hover:!border-indigo-500 !py-5"
      )}
      placeholder='What would you like to fund?'
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setPrompt(event.target.value);
      }}
      onKeyDown={async (event: React.KeyboardEvent) => {
        if (prompt && event.key === "Enter") {
          await sendPrompt(prompt);
        }
      }}
      rightAdornment={
        <ChatInputButton
          running={isWaiting}
          message={prompt || ""}
          handleSend={async () => {
            if (prompt) {
              await sendPrompt(prompt);
            }
          }}
        />
      }
    />
  );
};

export default PromptInput;
