import React from 'react';
import { MobileLayout } from './components/shared/MobileLayout';

export function NotFoundError() {
  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <span style={{ fontSize: '3rem' }}>💿</span>
        <h2 className="text-red-600 mt-4 mb-2" style={{ fontWeight: 700, fontSize: '1.5rem' }}>404 - Not Found</h2>
        <p className="text-stone-500 mb-6">Sorry, the page you are looking for does not exist.</p>
        <a href="/" className="bg-red-600 text-white px-4 py-2 rounded-full shadow hover:bg-red-700 transition-colors" style={{ fontWeight: 600 }}>Go to Home</a>
      </div>
    </MobileLayout>
  );
}
