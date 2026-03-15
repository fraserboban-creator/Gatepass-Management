'use client';

import { useError } from '@/context/ErrorContext';
import ErrorPopup from './ErrorPopup';

export default function ErrorPopupContainer() {
  const { error, closeError } = useError();

  return (
    <ErrorPopup
      isOpen={!!error}
      onClose={closeError}
      title={error?.title || '404 Error'}
      message={error?.message || 'Something went wrong.'}
    />
  );
}
