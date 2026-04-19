'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import ChatBot from '@/components/ai/ChatBot';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-[72px]">
            {children}
          </main>
          <Footer />
        </div>
        {/* Global Toast Notifications */}
        <ToastContainer />
        {/* AI Chatbot — available on every page */}
        <ChatBot />
      </NotificationProvider>
    </AuthProvider>
  );
}
