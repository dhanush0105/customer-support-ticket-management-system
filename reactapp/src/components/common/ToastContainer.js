import React from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useSupportFlow();

  if (toasts.length === 0) return null;

  return (
    <div className="sf-toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`sf-toast ${t.type || 'success'}`}>
          {t.type === 'danger' ? (
            <AlertCircle size={16} color="var(--sf-danger)" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={16} color="var(--sf-success)" style={{ flexShrink: 0 }} />
          )}
          <span style={{ flex: 1 }}>{t.title}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8A9390',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
