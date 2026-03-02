import React from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';

export function Root() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  );
}
