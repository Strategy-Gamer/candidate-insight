import React from 'react';
import Link from 'next/link';
import '@/styles/header.css';

const Header: React.FC = () => {
  return (
    <header>
        <h1>
          <Link href = "/">Candidate Insight</Link>
        </h1>
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
