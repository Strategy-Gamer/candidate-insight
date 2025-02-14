// This is the candidates page
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types/candidate';
import type { NextPage } from 'next';
import CandidateCard from '../../components/CandidateCard';

const exampleNames = ['John Doe', 'Jane Smith', 'Robert Johnson'];

const Candidates: NextPage = () => {
  // setup the router
  const router = useRouter();

  // setup default data
  const [candidate, setCandidate] = useState<Candidate>({
    first_name: 'Hello', 
    last_name: 'World', 
    candidate_id: 1
  });
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
      // setCandidate(data.candidate);
      // push the dynamic page
      router.push(`/candidates/${id}`);
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
      { /*<CandidateCard candidate={candidate}/> */ }
    </div>
  );
};

export default Candidates;