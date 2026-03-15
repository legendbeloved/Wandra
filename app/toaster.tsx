'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex max-h-screen w-full max-w-md flex-col gap-2 p-4"
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export function Toaster() {
  return (
    <ToastProvider swipeDirection="down">
      <ToastViewport />
    </ToastProvider>
  );
}
