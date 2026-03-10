import { OrderDetails } from '@/types/store';
import axios from 'axios';
import { Loader2, QrCode, Smartphone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GCashPaymentModalProps {
  order: OrderDetails;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentStatus = 'idle' | 'loading' | 'awaiting' | 'paid' | 'failed';

const GCashPaymentModal = ({ order, onClose, onSuccess }: GCashPaymentModalProps) => {
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    axios
      .post('/checkout/payment/source', { order_id: order.id })
      .then((res) => {
        setQrCode(res.data.qrCode);
        setCheckoutUrl(res.data.checkoutUrl);
        setStatus('awaiting');
        startPolling();
      })
      .catch(() => {
        setError('Failed to initialize payment. Please try again.');
        setStatus('failed');
      });

    return () => stopPolling();
  }, []);

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/checkout/payment/${order.id}/check`);
        if (res.data.status === 'paid') {
          stopPolling();
          setStatus('paid');
          setTimeout(() => onSuccess(), 1500);
        }
      } catch {
        // silent — keep polling
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500">
              <span className="text-xs font-black text-white">G</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pay with GCash</p>
              <p className="text-xs text-gray-500">
                {'\u20B1'}
                {order.finalTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPolling();
              onClose();
            }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">Initializing payment...</p>
            </div>
          )}

          {status === 'awaiting' && (
            <div className="flex w-full flex-col items-center gap-4">
              {qrCode && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <QrCode size={13} />
                    <span>Scan with GCash app</span>
                  </div>
                  <img src={qrCode} alt="GCash QR Code" className="h-48 w-48 rounded border border-gray-200" />
                </div>
              )}

              {checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600"
                >
                  <Smartphone size={16} />
                  <span>Open GCash</span>
                </a>
              )}

              {!qrCode && !checkoutUrl && (
                <p className="text-xs text-rose-500">Could not load payment details. Please try again.</p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                <span>Waiting for payment...</span>
              </div>

              <p className="text-center text-[10px] text-gray-400">
                Do not close this window until payment is confirmed.
              </p>
            </div>
          )}

          {status === 'paid' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-2xl">&#10003;</span>
              </div>
              <p className="font-bold text-emerald-600">Payment Confirmed!</p>
              <p className="text-xs text-gray-400">Redirecting...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-sm font-bold text-rose-600">Payment Failed</p>
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={onClose}
                className="rounded border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GCashPaymentModal;
