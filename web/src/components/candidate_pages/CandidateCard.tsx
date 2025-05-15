import React from 'react';
import Image from 'next/image';
import '@/styles/components/candidatecard.css';
import { ApiCandidate } from '@/types/candidate';
import { 
  getStateName,
  appendOrdinalToDistrict,
} from '@/utils/candidateHelperFuncs';
import {
  XOutlined,
  GoogleOutlined,
} from '@ant-design/icons';
import {Separator} from '@/components/ui/separator';

interface CandidateProps {
  candidate: ApiCandidate
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getIncumbentInformation = (candidate: ApiCandidate): string => {
  const officeDate = formatDate(candidate.election_date);
  const endDate = formatDate(candidate.term_end_date);
  const fullName: string = `${candidate.first_name} ${candidate.last_name}`;
  const pronounLower = candidate.gender === 'M' ? "he" : "she";
  const pronounUpper = candidate.gender === 'M' ? "His" : "Her";
  const stateName = candidate.state !== "US" ? getStateName(candidate.state!) : "the United States";

  let incumbentDetails: string = "";

  switch (candidate.incumbent_position) {
    case "House":
      incumbentDetails = `${fullName} is a member of the U.S House, representing ${stateName}'s 
      ${appendOrdinalToDistrict(candidate.congressional_district || 0)} district.`;
      break;
    case "Senator":
      incumbentDetails = `${fullName} is a member of the U.S. Senate, representing ${stateName}.`;
      break;
    case "Governor":
      incumbentDetails = `${fullName} is the governor of ${stateName}.`;
      break;
    case "President":
      incumbentDetails = `${fullName} is the President of the United States.`;
      break;
  }

  incumbentDetails = incumbentDetails + ` A member of the ${candidate.party_affiliation} Party, ${pronounLower} took office on ${officeDate}.`
  
  if (candidate.term_end_date) {
    incumbentDetails = incumbentDetails + ` ${pronounUpper} current term ends on ${endDate}.`
  } else {
    const realPronounLower = pronounLower[0].toUpperCase() + pronounLower.slice(1);
    incumbentDetails = incumbentDetails + ` ${realPronounLower} lost the election and is not currently holding office.`
  }

  return incumbentDetails;
}

const getRunningInformation = (candidate: ApiCandidate): string => {
  const fullName: string = `${candidate.first_name} ${candidate.last_name}`;
  const pronounLower = candidate.gender === 'M' ? "he" : "she";
  const pronounUpper = pronounLower[0].toUpperCase() + pronounLower.slice(1);
  const stateName = candidate.state !== "US" ? getStateName(candidate.state!) : "the United States";
  const now = new Date();
  const electionDate = candidate.election_date ? new Date(candidate.election_date) : null;
  const officeDate = formatDate(candidate.election_date);

  let runningInformation = "";

  if (candidate.running_for_position) {
    const isRunningForSamePosition = candidate.running_for_position === candidate.incumbent_position;
    const isPastElection = electionDate && electionDate < now;

    let positionString = "";
    switch (candidate.running_for_position) {
      case "House":
        positionString = `the U.S. House${candidate.congressional_district ? ` in ${stateName}'s ${appendOrdinalToDistrict(candidate.congressional_district)} district` : ''}`;
        break;
      case "Senator":
        positionString = `the U.S. Senate in ${stateName}`;
        break;
      case "Governor":
        positionString = `Governor of ${stateName}`;
        break;
      case "President":
        positionString = `President of the United States`;
        break;
    }

    let runningDetails = "";
    if (isRunningForSamePosition) {
      runningDetails = isPastElection 
        ? `${pronounUpper} ran for re-election to ${positionString}.`
        : `${pronounUpper} is running for re-election to ${positionString}.`;
    } else {
      runningDetails = isPastElection
        ? `${pronounUpper} ran for ${positionString}.`
        : `${pronounUpper} is running for ${positionString}.`;
    }

    runningInformation = runningDetails;

    if (electionDate != null) {
      if (isPastElection) {
        runningInformation = runningInformation + ` The election was held on ${officeDate}.`;
      } else {
        runningInformation = runningInformation + ` The election will be held on ${officeDate}.`;
      }
    }
  }
  
  return runningInformation;
}

const getBirthdayInfo = (candidate: ApiCandidate): string => {
  if (candidate.dob === null || candidate.dob === undefined) {
    return "No birthday information available.";
  }
  const pronoun = candidate.gender === 'M' ? "He" : "She";
  let birthDate = "";
  if (candidate.dob !== null || candidate.dob !== undefined) {
    birthDate = formatDate(candidate.dob!);
  }


  let info = "";

  if (birthDate.length !== 0) {
    info = info + `${pronoun} was born on ${birthDate}.`
  }

  return info;
}

const CandidateCard: React.FC<CandidateProps> = (props) => {
  const url = props.candidate.website_url ?? undefined;
  const xUrl = `https://x.com/${props.candidate.twitter}`;
  const profileImage = props.candidate.profile_image_url ?? '/images/Rect_NonID_Grey.png';
  const incumbentDesc = props.candidate.incumbent_position ? getIncumbentInformation(props.candidate) : "They are not currently holding office.";
  const runningDesc = props.candidate.running_for_position ? getRunningInformation(props.candidate) : "They are up not up for re-election";
  const birthdayInfo = getBirthdayInfo(props.candidate);
  const pronounLower = props.candidate.gender === 'M' ? "he" : "she";
  const pronounUpper = pronounLower[0].toUpperCase() + pronounLower.slice(1); 


  return (
    <div className="flex flex-row flex-start justify-center p-10 bg-white m-auto max-w-4/5 overflow-hidden gap-12">
      <div className="flex flex-col">
        <Image
          src={profileImage}
          width={400}
          height={500}
          alt={`${props.candidate.first_name} ${props.candidate.last_name}'s Photo`}
          className="object-cover rounded-none w-full h-auto md:w-[400px] md:h-[500px]"
        />
        <div className="flex justify-center space-x-4 mt-4">
          <a href={url} className="text-[#1c1c84]" target="_blank" rel="noopener noreferrer">
            <GoogleOutlined style={{ fontSize: '150%'}} />
          </a>
          <a href={xUrl} className="text-[#1c1c84] underline" target="_blank" rel="noopener noreferrer">
            <XOutlined style={{ fontSize: '150%'}} />
          </a>
        </div>
      </div>
      <div className="details ml-12">
        <h2>{props.candidate.first_name} {props.candidate.last_name}</h2>
        <h3>
          {props.candidate.incumbent_position === undefined || props.candidate.incumbent_position === null ? "Not Holding Office" : props.candidate.incumbent_position}
        </h3>
        <p>{incumbentDesc}</p>
        <p>{runningDesc}</p>
        <Separator className="my-4" />
        <h4>Other Information</h4>
        <p>{birthdayInfo}</p>
      </div>
    </div>
  );
}

export default CandidateCard;