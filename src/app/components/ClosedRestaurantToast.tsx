import { toast } from 'sonner';
import { Store } from 'lucide-react';

interface ClosedRestaurantToastProps {
  restaurantName: string;
}

export function ClosedRestaurantToast({ restaurantName }: ClosedRestaurantToastProps) {
  return (
    <div className="w-80 border-2 border-[#9B2C2C] bg-background shadow-[4px_4px_0px_#111111]">
      <div className="flex items-center gap-2 border-b-2 border-[#9B2C2C] px-3 py-2 bg-[#E8D4D4]">
        <Store size={14} className="text-[#9B2C2C]" />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#9B2C2C',
          }}
        >
          ĐÓNG CỬA
        </span>
      </div>
      <div className="p-4">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: 1.2,
            marginBottom: '6px',
            color: '#111111',
          }}
        >
          {restaurantName}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#77736B', lineHeight: 1.5 }}>
          Quán đang đóng cửa. Không thể thêm món vào giỏ hàng.
        </p>
      </div>
    </div>
  );
}

export function showClosedRestaurantToast(restaurantName: string) {
  toast.custom(() => <ClosedRestaurantToast restaurantName={restaurantName} />, {
    duration: 4500,
  });
}
