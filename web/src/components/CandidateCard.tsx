import React from 'react';
import '../styles/candidatecard.css';
import { Candidate } from '@/types/candidate';

interface CandidateProps {
  candidate: Candidate
}

const CandidateCard: React.FC<CandidateProps> = (props) => {
  const url = props.candidate.website_url ?? undefined;
  return (
    <div className='candidate-card'>
      <img src="../../public/" alt="Candidate's Photo" className="photo" />

      <div className='details'>
        <h2>{props.candidate.first_name} {props.candidate.last_name}</h2>
        <h3>POSITION</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
        <div className='link-box'>
          Links to their website, social media, etc...
        </div>
        <div className='info-box'>
          Underneath this hero section would be specific information
          <a 
            href={url} 
            target='blank'
            style={{all: 'revert'}}
          >
            Official Website
          </a>
        </div>
      </div>
    </div>
  );
}

export default CandidateCard;
