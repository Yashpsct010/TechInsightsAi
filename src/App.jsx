import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Blog from './components/Blog';
import About from './components/About';
import BlogsPage from './components/BlogsPage';
import BlogDetailPage from './components/BlogDetailPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<About />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <PWAInstallPrompt />
      </div>
    </Router>
  );
}

export default App;