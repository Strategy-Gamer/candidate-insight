import React from "react";
import DefinableTerm from "./DefinableTerm";

const PublicPolicySection: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto font-sans text-gray-800">
      <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Public Policy</h3>
     
      <div className="mb-6">
        <p className="text-lg text-justify mb-4">
          Public policy is a collection of elements such as laws, programs, regulations, and actions that address societal problems.
          Put more simply, public policy is the combination of what a government decides to do and what it doesn't do regarding a problem.
        </p>
       
        <p className="text-lg text-justify">
          In the United States, public policy is enacted by the government through elected officials on behalf of their{" "}
          <DefinableTerm 
            term="Constituents" 
            definition="The people who live in an area that a politician represents, especially the people who voted for them in an election."
          >
            constituents
          </DefinableTerm>. 
          This includes the local, state, and federal government. Policymakers often draft policies that aid the interests of as many
          groups as possible.
        </p>
      </div>
     
      <div>
        <h4 className="text-xl font-semibold mb-4">The Policy Making Process</h4>
        <p className="text-lg text-justify mb-4">
          Before a policy can be implemented, it must be made. The policy-making process or cycle can be defined as:
        </p>
       
        <ol className="list-decimal pl-8 space-y-3 text-lg text-justify">
          <li><span className="font-medium">Issue identification</span> - sometimes referred to as agenda setting, this is the process of identifying issues that require government attention.</li>
          <li><span className="font-medium">Policy formulation</span> - creating the objectives of the policy and outlining how they can be achieved.</li>
          <li><span className="font-medium">Legitimation</span> - the process of gathering support for the policy through various means, such as{" "}
            <DefinableTerm 
              term="Referendum" 
              definition="A direct vote by the eligible voters on a specific proposal, law, or political issue."
            >
              referendums
            </DefinableTerm>.</li>
          <li><span className="font-medium">Implementation</span> - establishing the means in which the policy will be enacted, such as a program, group, or agency.</li>
          <li><span className="font-medium">Evaluation</span> - the process of measuring a policy's success.</li>
          <li><span className="font-medium">Maintenance</span> - this includes tweaking the policy to aid its success, or the process of deciding to keep or terminate the policy based on its success (or lack thereof).</li>
        </ol>
       
        <p className="text-lg text-justify mt-4">
          In practice, policy making is much more complicated, but the above still serves as a good, high-level overview of the process.
        </p>
      </div>
    </section>
  );
};

export default PublicPolicySection;