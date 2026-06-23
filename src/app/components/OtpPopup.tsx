import { useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface OtpPopupProps {
  code: string;
  visible: boolean;
  onClose: () => void;
}

export function OtpPopup({ code, visible, onClose }: OtpPopupProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 7000);
    return () => clearTimeout(timer);
  }, [visible, code, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-24 right-4 z-[100] w-72 border-2 border-foreground bg-background shadow-[4px_4px_0px_#111111]">
      <div className="flex items-center justify-between border-b-2 border-foreground px-3 py-2 bg-secondary">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
            SMS / EMAIL
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          Mã xác thực OTP của bạn:
        </p>
        <p className="text-center tracking-[0.3em] py-2 border-2 border-foreground bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700 }}>
          {code}
        </p>
        <p className="text-muted-foreground mt-2 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
          Mã sẽ tự ẩn sau 7 giây
        </p>
      </div>
    </div>
  );
}
