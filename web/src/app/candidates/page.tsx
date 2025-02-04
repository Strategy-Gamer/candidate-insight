// This is the candidates page
'use client';
import { useState } from 'react';
import { Candidate } from '@/types/candidate';
import type { NextPage } from 'next';
import CandidateCard from '../../components/CandidateCard';

const exampleNames = ['John Doe', 'Jane Smith', 'Robert Johnson'];

const Candidates: NextPage = () => {

  const [candidate, setCandidate] = useState<Candidate>({first_name: 'Hello', last_name: 'World', candidate_id: 1});
  const [firstName, setFirstName] = useState<string>('John');
  const [lastName, setLastName] = useState<string>('Doe');

  const handleChange  = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const name = event.target.value;
    const [first, last] = name.split(' ');
    setFirstName(first);
    setLastName(last);
  }

  const handleClick = async () => {
    if (firstName === '' || lastName === '') {
      return;
    }

    const id = `${firstName}-${lastName}`;
    const response = await fetch(`/api/candidates/${id}`);
    const data = await response.json();

    if (data.success) {
      setCandidate(data.candidate);
    } 
    else {
      alert('Candidate not found');
      console.error(data.error);
    }
  }

  return (
    <div className="text-center">
      <select onChange={handleChange}>
        {exampleNames.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))
        }
      </select>
      <button onClick={handleClick}>Search</button>
      <h1>Below is a WIP</h1>
      <h2>The actual candidate page will likely have a directory layout</h2>
      <h3>Upon clicking on a candidate, the below will be rendered (finished of course)</h3>
      <CandidateCard candidate={candidate}/>
    </div>
  );
};

export default Candidates;