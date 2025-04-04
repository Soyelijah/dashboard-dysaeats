'use client';

import { useToast as useToastUI } from '@/components/common/toast/use-toast';

export const useToast = () => {
  return useToastUI();
};