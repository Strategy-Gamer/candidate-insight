import type { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import "@/styles/pages/homepage.css";

const Home: NextPage = () => {
  return (
    <div className="text-center font-sans">
      <section className="hero">
        <h1>Candidate Insight</h1>
        <h2>
          Understand Policy Positions & Compare Candidates
        </h2>
        <Button className="explore-button">
          <Link href="/candidates">Explore Candidates</Link>
        </Button>
      </section>

      <section className="features">
        <div className="feature-box">
          <h3>Policy Comparison</h3>
          <p>Compare stances on major issues like abortion, gun control, and healthcare.</p>
        </div>
        <div className="feature-box">
          <h3>Background Info</h3>
          <p>Get to know candidates and explore their policies.</p>
        </div>
        <div className="feature-box">
          <h3>Data-driven Insights</h3>
          <p>Make informed decisions with data-driven insights on candidates.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
