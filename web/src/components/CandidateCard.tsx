import React from 'react';
import '@/styles/candidatecard.css';
import { Candidate } from '@/types/candidate';
import { getPartyAbbreviation } from '@/utils/candidateHelperFuncs';
import { getStateAbbreviation } from '@/utils/candidateHelperFuncs';
import { appendOrdinalToDistrict } from '@/utils/candidateHelperFuncs';

interface CandidateProps {
  candidate: Candidate
}


// We'll need some more DB fields to check if they're incumbent or not
const getPosition = (
  district: string | null | undefined, 
  party: string | null | undefined, 
  state: string | null | undefined
): string => {
  const partyAbbrev = party ? getPartyAbbreviation(party) ?? "?" : "?";
  const stateAbbrev = state ? getStateAbbreviation(state) ?? state : "Unknown State";

  if (district) {
    return `Representative (${partyAbbrev}-${stateAbbrev} ${appendOrdinalToDistrict(district)} District)`;
  } else if (state) {
    return `Senator (${partyAbbrev})-${stateAbbrev}`;
  }
  return "Unknown Position";
};

const CandidateCard: React.FC<CandidateProps> = (props) => {
  const url = props.candidate.website_url ?? undefined;

  const defaultImage = '/images/Rect_NonID_Grey.png';

  const profileImage = defaultImage;

  return (
    <div className='candidate-card'>
      <img 
        src={profileImage} 
        alt={`${props.candidate.first_name} ${props.candidate.last_name}'s Photo`} 
        className="photo" 
      />

      <div className='details'>
        <h2>{props.candidate.first_name} {props.candidate.last_name}</h2>
        <h3>
          {getPosition(props.candidate.congressional_district, props.candidate.party_affiliation, props.candidate.state)}
        </h3>
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
