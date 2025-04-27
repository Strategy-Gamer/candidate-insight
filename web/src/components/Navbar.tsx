"use client";

import React, {useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/components/navbar.css';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <nav>
        <Link href="/candidates">Candidates</Link>
        <Link href="/issues">Issues</Link>
        <Link href="/about">About Us</Link>
      </nav>
    </header>
  );
};

export default Navbar;
