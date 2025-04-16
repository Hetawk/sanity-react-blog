import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { About, Footer, Header, Skills, Awards, Work, OrcidWorks } from './container';
import { Navbar } from './components';
import { Contact } from './pages';
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import './App.scss';

const HomePage = () => (
  <>
    <Navbar />
    <Header />
    <About />
    <Work />
    <Skills />
    <OrcidWorks />
    <Awards />
    <Footer />
  </>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dash" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  </AuthProvider>
);



export default App;
