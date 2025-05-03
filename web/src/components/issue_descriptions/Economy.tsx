import React from "react";
import DefinableTerm from "./DefinableTerm";

const EconomyPolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Economy</h3>
            <h4 className="text-xl text-center text-[#b31942] mb-6">Issues regarding taxation, employment, and business.</h4>

            <div className="mb-6">
                <p className="text-lg text-justify mb-4">
                    The economy refers to the system in which a society produces, distributes, and consumes goods and services.{" "}
                    The United States exists in a{" "}
                    <DefinableTerm 
                        term="mixed economy" 
                        definition="An economic system combining private enterprise with government regulation and intervention in some areas."
                    >
                        mixed economy
                    </DefinableTerm>,{" "}
                    which blends private enterprise and government oversight. The economy revolves around natural, human, and{" "}
                    <DefinableTerm 
                        term="capital" 
                        definition="The financial assets and resources needed for production, including money, equipment, and infrastructure."
                    >
                        financial components
                    </DefinableTerm>.{" "}
                    These components mix together into a complicated dance of management that both businesses and the government have to work together{" "}
                    (at least in the United States) to achieve.     
                </p>

                <p className="text-lg text-justify mb-4">
                    The strength of the economy is measured in a few key ways. Indicators like{" "}
                    <DefinableTerm 
                        term="Gross Domestic Product (GDP)" 
                        definition="The total monetary value of all finished goods and services produced within a country's borders in a specific time period."
                    >
                        Gross Domestic Product (GDP)
                    </DefinableTerm>,{" "}
                    <DefinableTerm 
                        term="unemployment rates" 
                        definition="The percentage of the labor force that is jobless and actively seeking employment."
                    >
                        unemployment rates
                    </DefinableTerm>,{" "}
                    and{" "}
                    <DefinableTerm 
                        term="inflation" 
                        definition="The rate at which the general level of prices for goods and services is rising, eroding purchasing power."
                    >
                        inflation
                    </DefinableTerm>{" "}
                    measure the stability, growth, and capability of a nation's economy. The government can shape the economy in a few different ways. One example is through the{" "}
                    <DefinableTerm 
                        term="Federal Reserve" 
                        definition="The central bank of the United States that conducts monetary policy, regulates banks, and maintains financial stability."
                    >
                        Federal Reserve
                    </DefinableTerm>,{" "}
                    which can manage{" "}
                    <DefinableTerm 
                        term="interest rates" 
                        definition="The amount charged by lenders to borrowers for the use of money, typically expressed as a percentage of the principal."
                    >
                        interest rates
                    </DefinableTerm>{" "}
                    and by extension, the movement of capital. Another example is Congress itself, which can pass laws dictating{" "}
                    <DefinableTerm 
                        term="tax rates" 
                        definition="The percentage at which an individual or corporation is taxed, which can vary based on income level or other factors."
                    >
                        tax rates
                    </DefinableTerm>{" "}
                    and governmental budgets.    
                </p>

                <p className="text-lg text-justify mb-4">
                    Discussions about the economy generally revolve around how much power the government should have in dictating how the economy functions. Should there be a{" "}
                    <DefinableTerm 
                        term="flat tax" 
                        definition="A tax system with a single rate applied to all taxpayers regardless of income level."
                    >
                        flat tax rate
                    </DefinableTerm>,{" "}
                    or a{" "}
                    <DefinableTerm 
                        term="progressive tax" 
                        definition="A tax system where the tax rate increases as the taxable amount increases, placing a higher burden on higher incomes."
                    >
                        progressive one
                    </DefinableTerm>?{" "}
                    What should and shouldn't be taxed at all? What restrictions should be in place for private institutions? Is the government a restriction holding private institutions back, or is the government a watchdog that serves to protect workers' rights? Or is the answer somewhere in the middle?
                </p>

                <p className="text-lg text-justify mb-4">
                    In politics, the economy is a constant factor in the minds of the average citizen, and understanding it can lead to more educated discussions of the potential effects of economic plans proposed by politicians.      
                </p>
            </div>
        </section>
    );
};

export default EconomyPolicySection;