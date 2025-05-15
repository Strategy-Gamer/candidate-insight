import React from "react";
import DefinableTerm from "./DefinableTerm";

const EducationPolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Education</h3>
            <h4 className="text-xl text-center text-[#b31942] mb-6">Funding and reforms for public and private education.</h4>

            <div className="mb-6">
                <p className="text-lg text-justify mb-4">
                    Education refers to the systems and processes through which citizens acquire knowledge, skills and values for 
                    personal growth and participation in society. In the United States, education is generally managed through 
                    public schooling and some private institutions from kindergarten to 12th grade. Education also involves how citizens 
                    learn after graduating high school, from trade schools, apprenticeships, community colleges, and universities.   
                </p>

                <p className="text-lg text-justify mb-4">
                    The strength of a beneficial education can be difficult to measure, but is generally indicated by the number of 
                    citizens that possess education outside of K-12, standardized test scores, literacy rates, and workforce 
                    readiness. Federal agencies like the Department of Education, along with state institutions, dictate standards and 
                    curriculums for public schools to follow. These institutions also oversee funding, teacher certifications and 
                    policies towards private education and homeschooling. 
                </p>

                <p className="text-lg text-justify mb-4">
                    Discussions about education revolve around the balance and role of public and private educational institutions, the 
                    values and beliefs that should be taught to future generations, and the importance and value of education 
                    outside of K-12. Examples of topics of debate about curriculum content are intelligent design,{" "}
                    <DefinableTerm 
                        term="critical race theory" 
                        definition="An academic framework examining how racial inequality is perpetuated through laws and social systems, often debated in school curricula."
                    >
                        critical race theory
                    </DefinableTerm>,{" "}
                    and potential bias in historical textbooks. What values should children be taught to appreciate and 
                    value? What are the flaws of public and private education? What can be done to improve how Americans are 
                    educated? Should more financial assistance be given to university students? 
                </p>

                <p className="text-lg text-justify mb-4">
                    In politics, education is the undercurrent of topics like student loans and school choice.   
                </p>
            </div>
        </section>
    );
};

export default EducationPolicySection;