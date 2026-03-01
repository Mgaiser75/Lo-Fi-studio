
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { STORAGE_KEYS, INITIAL_USER } from './constants';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const TrackGenerator = lazy(() => import('./components/TrackGenerator').then(m => ({ default: m.TrackGenerator })));
const MixBuilder = lazy(() => import('./components/MixBuilder').then(m => ({ default: m.MixBuilder })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const ChannelCloner = lazy(() => import('./components/ChannelCloner').then(m => ({ default: m.ChannelCloner })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Initializing Studio...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // Always authenticated for personal use
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    }
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracks" element={<TrackGenerator />} />
            <Route path="/mixes" element={<MixBuilder />} />
            <Route path="/cloner" element={<ChannelCloner />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;
