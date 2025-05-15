import React from "react";
import DefinableTerm from "./DefinableTerm";

const HealthcarePolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Healthcare</h3>
            <h4 className="text-xl text-center text-[#b31942] mb-6">Policies related to medical care and insurance.</h4>

            <div className="mb-6">
                <p className="text-lg text-justify mb-4">
                    Healthcare is the provision of healthcare services to a community, organized by a health system. 
                    Health systems are the ways in which a person can get healthcare services. This can be done through universal 
                    healthcare systems, such as{" "}
                    <DefinableTerm 
                        term="Single-payer healthcare" 
                        definition="A healthcare system where one entity (typically the government) pays all healthcare costs, funded through taxes, while healthcare providers remain private."
                    >
                        single-payer healthcare
                    </DefinableTerm>, or through a non-universal private health insurance system. 
                    Most commonly, however, countries often employ a mix of both to meet the needs of their citizens.    
                </p>

                <p className="text-lg text-justify mb-4">
                    The US healthcare system includes{" "}
                    <DefinableTerm 
                        term="Medicaid and Medicare" 
                        definition="Medicaid provides health coverage to low-income individuals while Medicare provides coverage for people 65+ or with certain disabilities. Medicaid is state/federal funded, while Medicare is federal."
                    >
                        Medicaid, Medicare
                    </DefinableTerm>,{" "}
                    <DefinableTerm 
                        term="CHIP" 
                        definition="Children's Health Insurance Program - provides low-cost health coverage to children in families that earn too much for Medicaid but can't afford private insurance."
                    >
                        CHIP
                    </DefinableTerm>, employer-sponsored, and private health insurance 
                    bought by individuals. Often, the resources available to citizens varies by state.     
                </p>

                <p className="text-lg text-justify mb-4">
                    Because healthcare is something that affects nearly every voter and even non-voters, it is one of the more 
                    prominent issues in the United States (and throughout the world.) Healthcare policies affect how funds are 
                    appropriated to healthcare services, the cost of healthcare, taxes, and many more aspects. One example of a 
                    healthcare policy in the US is the{" "}
                    <DefinableTerm 
                        term="ACA (Affordable Care Act)" 
                        definition="Also known as Obamacare, this 2010 law expanded Medicaid, created health insurance marketplaces, and prevented insurers from denying coverage due to pre-existing conditions."
                    >
                        ACA, or the Affordable Care Act
                    </DefinableTerm>.
                </p>
            </div>
        </section>
    );
};

export default HealthcarePolicySection;