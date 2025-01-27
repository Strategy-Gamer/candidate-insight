// This is the candidates page

import type { NextPage } from 'next';
import CandidateCard from '../../components/CandidateCard';

const Candidates: NextPage = () => {
  return (
    <div className="text-center">
      <h1>Below is a WIP</h1>
      <h2>The actual candidate page will likely have a directory layout</h2>
      <h3>Upon clicking on a candidate, the below will be rendered (finished of course)</h3>
      <CandidateCard />
    </div>
  );
};

export default Candidates;
