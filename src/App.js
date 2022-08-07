import React from 'react';

import { About, Footer, Header, Skills, Awards, Work } from './container';
import { Navbar } from './components';
import './App.scss';

const App = () => (
  <div className="app">
    <Navbar />
    <Header />
    <About />
    <Work />
    <Skills />
    <Awards />
    <Footer />
  </div>
);

export default App;
