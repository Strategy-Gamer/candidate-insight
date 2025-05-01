"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import '@/styles/components/navbar.css';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={isScrolled ? 'header-shadow' : ''}>
      <div className="logo-container">
        <img
          src="/images/candidate-insight-logo.png"
          alt="Candidate Insight Logo"
          className="logo"
        />
        <h1>
          <Link href="/">Candidate Insight</Link>
        </h1>
      </div>
      
      <button
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        onClick={toggleMenu}
      >
        {isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
      </button>
      
      <nav>
        <Link href="/candidates">Candidates</Link>
        <Link href="/issues">Issues</Link>
        <Link href="/about">About Us</Link>
      </nav>
      
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="flex">
          <Link href="/candidates" onClick={toggleMenu}>Candidates</Link>
          <Link href="/issues" onClick={toggleMenu}>Issues</Link>
          <Link href="/about" onClick={toggleMenu}>About Us</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;