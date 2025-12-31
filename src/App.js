import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { About, Footer, Header, Skills, Awards, Work, OrcidWorks } from './container';
import { Navbar } from './components';
import { AuthProvider } from './context/AuthContext';
import { HomepageDataProvider } from './context/HomepageDataContext';
import { ToastProvider } from './components/Toast/Toast';
import './App.scss';

// Lazy load pages for better initial load performance
const Contact = lazy(() => import('./pages/Contact/Contact'));
const AwardsPage = lazy(() => import('./pages/Awards/AwardsPage'));
const ExperiencesPage = lazy(() => import('./pages/Experiences/ExperiencesPage'));
const WorksPage = lazy(() => import('./pages/Works/WorksPage'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const JourneyPage = lazy(() => import('./pages/Journey/JourneyPage'));
const PublicResumeViewer = lazy(() => import('./pages/PublicResumeViewer'));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
  </div>
);

const HomePage = () => (
  <HomepageDataProvider>
    <Navbar />
    <Header />
    <About />
    <Work />
    <Skills />
    <OrcidWorks />
    <Awards />
    <Footer />
  </HomepageDataProvider>
);

const App = () => (
  <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dash" element={<Dashboard />} />
              {/* Section pages with detail views */}
              <Route path="/awards" element={<AwardsPage />} />
              <Route path="/awards/:id" element={<AwardsPage />} />
              <Route path="/works" element={<WorksPage />} />
              <Route path="/works/:id" element={<WorksPage />} />
              <Route path="/experiences" element={<ExperiencesPage />} />
              <Route path="/experiences/:id" element={<ExperiencesPage />} />
              <Route path="/journey" element={<JourneyPage />} />
              {/* Public Resume Routes */}
              <Route path="/resume/:resumeSlug" element={<PublicResumeViewer />} />
              <Route path="/resume/share/:shareableLink" element={<PublicResumeViewer />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
);

export default App;
