import { useState } from 'react';
import { Copy, AlertCircle, Check } from 'lucide-react'; // Tumia icon unazopenda
import { copyToClipboard, cn } from '@/lib/utils'; // Path ya function tuliyounda juu

interface CopyButtonProps {
  content: string; // Inaweza kuwa text, ID, au URL
  className?: string;
}

export function CopyButton({ content, className = "" }: CopyButtonProps) {
  // Hali tatu: 'idle' (iko tayari), 'success' (imekopiwa), 'error' (imefeli)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAction = async () => {
    const isSuccessful = await copyToClipboard(content);

    if (isSuccessful) {
      setStatus('success');
      // Inarudi kwenye hali ya kawaida baada ya sekunde 2
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 7000);
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={status !== 'idle'}
      className={cn("relative flex items-center justify-center cursor-pointer transition-all",
        status === 'success' ? 'text-emerald-500': status === 'error' ? 'text-red-500' : 'text-muted-foreground hover:bg-secondary',
      className
    )} title={status === 'success' ? "Copied to clipboard!" : "Copy to clipboard"} >

      {/* Logic ya kubadilisha Icon */}
      {status === 'idle' && <Copy className="w-4 h-4 animate-in zoom-in duration-200" />}
      {status === 'success' && <Check className="w-4 h-4 animate-in zoom-in duration-200 text-blue-400" />}
      {status === 'error' && <AlertCircle className="w-4 h-4 animate-in shake duration-300" />}
    </button>
  );
}