import React from 'react';
import Link from 'next/link';
import '@/styles/header.css';

const Header: React.FC = () => {
  return (
    <header>
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
        <Link href="/news">News</Link>
        <Link href="/search">Search</Link>
      </nav>
    </header>
  );
};

export default Header;
