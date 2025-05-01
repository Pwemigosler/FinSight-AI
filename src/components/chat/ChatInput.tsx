
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { KeyboardEvent, ChangeEvent } from "react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  handleSendMessage, 
  isLoading
}: ChatInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="flex w-full items-end gap-2">
      <Textarea
        placeholder="Type your message..."
        value={inputMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 min-h-[60px] resize-none"
        maxLength={500}
      />
      <Button 
        onClick={handleSendMessage} 
        disabled={isLoading || !inputMessage.trim()}
        className="h-10"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
};

export default ChatInput;
