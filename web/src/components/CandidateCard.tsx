import React from 'react';
import '../styles/candidatecard.css';

const CandidateCard: React.FC = () => {
  return (
    <div className='candidate-card'>
      <img src="../../public/" alt="Candidate's Photo" className="photo" />

      <div className='details'>
        <h2>Candidate Name</h2>
        <h3>POSITION</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
        <div className='link-box'>
          Links to their website, social media, etc...
        </div>
        <div className='info-box'>
          Underneath this hero section would be specific information
        </div>
      </div>
    </div>
  );
}

export default CandidateCard;
