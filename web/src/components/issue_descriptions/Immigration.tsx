import React from "react";
import DefinableTerm from "./DefinableTerm";

const ImmigrationPolicySection: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto font-sans text-gray-800">
      <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Immigration</h3>
      <h4 className="text-xl text-center text-[#b31942] mb-6">Policies on border security and citizenship.</h4>
     
      <div className="mb-6">
        <p className="text-lg text-justify mb-4">
          Immigration is the process of moving to a different country. The history of immigration in America is older than the nation itself, 
          and immigration continues to be a significant issue in modern politics. Policy on immigration includes which countries people are allowed 
          to move from, how many people can enter the United States, how immigrants gain{" "}
          <DefinableTerm 
            term="Citizenship" 
            definition="The status of being a legally recognized member of a country, with accompanying rights and responsibilities."
          >
            citizenship
          </DefinableTerm>, 
          the protections immigrants have as they go through the process of gaining citizenship, and more.
        </p>
       
        <p className="text-lg text-justify mb-4">
          Whether you are a{" "}
          <DefinableTerm 
            term="First-generation American" 
            definition="A person born in another country who became a U.S. citizen or permanent resident, or their children born in the United States."
          >
            first-generation American
          </DefinableTerm>{" "}
          or your family has lived in the United States for generations, many Americans can trace their history back to immigration from another country. 
          Even if you feel you have no connection to immigration, it is an issue that overlaps with many other areas of public policy.
        </p>
        
        <p className="text-lg text-justify">
          There are also a wide variety of candidate stances on immigration. Two of the most well-known immigration topics are the{" "}
          <DefinableTerm 
            term="US-Mexico Border Policy" 
            definition="Governmental decisions and regulations regarding entry, security, and management of the 1,954-mile border between the United States and Mexico."
          >
            border between the US and Mexico
          </DefinableTerm>{" "}
          and policy on{" "}
          <DefinableTerm 
            term="Refugee Policy" 
            definition="Laws and procedures for accepting people who have fled their home countries due to war, persecution, or natural disaster."
          >
            immigrants from countries affected by wars
          </DefinableTerm>.
        </p>
      </div>
    </section>
  );
};

export default ImmigrationPolicySection;