import React from "react";
import DefinableTerm from "./DefinableTerm";

const SocialIssuesPolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Social Issues</h3>
            <h4 className="text-xl text-center text-[#b31942] mb-6">Civil rights, LGBTQ+ rights, and religious freedoms.</h4>

            <div className="mb-6">
                <p className="text-lg text-justify mb-4">
                    Social Issues is a broad category which contains domestic policy regarding laws and freedoms for specific groups of 
                    people. The Civil Rights movement and Women's Suffrage movement are just two examples of major historical 
                    periods of change in social attitudes and policies. Today, social issues are still extremely relevant. 
                    Freedoms of expression and religion are common topics, as well as protections for minority groups.
                </p>

                <p className="text-lg text-justify mb-4">
                    Candidates have many different ideas about policies affecting LGBTQ+ citizens. More emphasis has been placed on this 
                    issue over the last few decades, and whether voters identify themselves as a part of this group or not, it is 
                    important to make an informed decision about policy that will affect others.
                </p>

            </div>
        </section>
    );
};

export default SocialIssuesPolicySection;