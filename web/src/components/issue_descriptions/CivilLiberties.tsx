import React from "react";
import DefinableTerm from "./DefinableTerm";

const CivilLibertiesPolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Civil Liberties</h3>
            <h4 className="text-xl text-center text-[#b31942] mb-6">Issues related to civil liberties like gun ownership.</h4>

            <div className="mb-6">
                <p className="text-lg text-justify mb-4">
                    Civil liberties are basic rights and freedoms that belong to everyone living in or visiting the United States. 
                    These rights are protected by the Bill of Rights in the U.S. Constitution. 
                    Civil liberties include the right to speak freely (freedom of speech), the right to practice any religion (freedom of religion), 
                    the right to have guns (the right to bear arms), the right to privacy, the right to a fair trial (called due process), 
                    the right to be treated equally, protection from unfair searches by the police, and protection from cruel or unusual punishment.
                </p>

                <p className="text-lg text-justify mb-4">
                    In politics, civil liberties often come up when talking about topics such as free speech, 
                    gun laws, privacy, safety, religion, and fair treatment under the law.
                </p>

            </div>
        </section>
    );
};

export default CivilLibertiesPolicySection;