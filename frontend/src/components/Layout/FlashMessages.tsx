// Flash Messages Component - Copy từ base.html
import { useEffect, useState } from 'react';

interface FlashMessage {
  category: string;
  message: string;
  id: number;
}

interface FlashMessagesProps {
  messages?: FlashMessage[];
  autoHide?: boolean;
  autoHideDelay?: number;
}

export default function FlashMessages({ 
  messages = [], 
  autoHide = true,
  autoHideDelay = 5000 
}: FlashMessagesProps) {
  const [visibleMessages, setVisibleMessages] = useState<FlashMessage[]>(messages);

  useEffect(() => {
    setVisibleMessages(messages);

    if (autoHide && messages.length > 0) {
      const timer = setTimeout(() => {
        setVisibleMessages([]);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [messages, autoHide, autoHideDelay]);

  const handleClose = (id: number) => {
    setVisibleMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (visibleMessages.length === 0) return null;

  return (
    <div className="container mt-3">
      {visibleMessages.map(({ category, message, id }) => {
        const alertClass = category === 'error' ? 'danger' : category;
        
        return (
          <div 
            key={id}
            className={`alert alert-${alertClass} alert-dismissible fade show`} 
            role="alert"
          >
            {message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => handleClose(id)}
              aria-label="Close"
            ></button>
          </div>
        );
      })}
    </div>
  );
}
