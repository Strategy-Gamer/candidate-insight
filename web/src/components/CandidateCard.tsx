import React from 'react';
import '@/styles/candidatecard.css';
import { Candidate } from '@/types/candidate';
import { 
  getPartyAbbreviation,
  getStateName,
  appendOrdinalToDistrict,
  getParty,
} from '@/utils/candidateHelperFuncs';
/* import { profile } from 'console'; */
import {
  XOutlined,
  GoogleOutlined,
} from '@ant-design/icons';

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
  // const stateAbbrev = state ? getStateAbbreviation(state) ?? state : "Unknown State";

  if (district) {
    return `Representative (${partyAbbrev}-${state} ${appendOrdinalToDistrict(district)} District)`;
  } else if (state) {
    return `Senator (${partyAbbrev})-${state}`;
  }
  return "Unknown Position";
};

const getCandidateDesc = (
  firstName: string,
  lastName: string,
  district: string | null | undefined,
  party: string | null | undefined,
  state: string | null | undefined
): string => {
  const fullName: string = `${firstName} ${lastName}`;
  const stateName: string = state ? getStateName(state) ?? state : "Unknown State";
  const fullParty: string = party ? getParty(party) ?? party : "Unknown Party";

  let fullDesc: string = "";

  if (district) {
    fullDesc = `${fullName} (${fullParty}) is a Representative for ${stateName}, serving the ${appendOrdinalToDistrict(district)} District.`;
  } else if (state) {
    fullDesc = `${fullName} (${fullParty}) is a Senator for ${stateName}.`;
  } else {
    fullDesc = `${fullName} (${fullParty}) is a political candidate.`;
  }

  return fullDesc;
};

const CandidateCard: React.FC<CandidateProps> = (props) => {
  const url = props.candidate.website_url ?? undefined;
  const profileImage = '/images/Rect_NonID_Grey.png';
  const profileDescription = getCandidateDesc(props.candidate.first_name, props.candidate.last_name, props.candidate.congressional_district,
    props.candidate.party_affiliation, props.candidate.state);

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
        <p>{profileDescription}</p>
        {/* possibly change this from Tailwind later */}
        <div className="flex justify-center space-x-4 mt-4">
          <a href="google.com" className="text-[#1c1c84]" target="_blank" rel="noopener noreferrer">
            <GoogleOutlined />
          </a>
          <a href="x.com" className="text-[#1c1c84] underline" target="_blank" rel="noopener noreferrer">
            <XOutlined />
          </a>
        </div>
      </div>
    </div>
  );
}

export default CandidateCard;
