import React from "react";
import DefinableTerm from "./DefinableTerm";

const EnvironmentPolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center text-[#1c1c84] mb-6">Environment</h3>
            <h4 className="text-xl text-center text-[#b31942] mb-6">Policies addressing climate change and sustainability.</h4>

            <div className="mb-6">
                <p className="text-lg text-justify mb-4">
                    The environment describes the natural systems, resources, and conditions that sustain life on the planet. 
                    This includes air, water, soil, ecosystems, biodiversity, and the climate. The United States takes up a large landmass, 
                    with it containing multiple different <DefinableTerm term="biomes" definition="Large ecological areas with distinct plants and animals adapted to their environment.">
                    biomes
                    </DefinableTerm>, climates, and weather patterns. Considering this, politicians need to 
                    consider the environmental needs of their constituents, which can vary wildly.  
                </p>

                <p className="text-lg text-justify mb-4">
                    Components of the environment include <DefinableTerm term="renewable resources" definition="Natural resources that can replenish over time, like solar or wind energy.">
                    renewable
                    </DefinableTerm> and non-renewable resources, ecological processes like the water cycle, 
                    weather patterns, and the human impact on these systems. Government agencies like the <DefinableTerm term="EPA" definition="Environmental Protection Agency - federal agency responsible for environmental regulations and protection.">
                    EPA
                    </DefinableTerm> regulate pollution and environmental standards.
                </p>

                <p className="text-lg text-justify mb-4">
                    Discussions about the environment revolve around human impact and energy solutions. How much priority should cleaner energy methods have? Should companies get <DefinableTerm term="tax credits" definition="Financial incentives to encourage businesses to adopt environmentally friendly practices.">
                    tax credits
                    </DefinableTerm> for green energy? Should <DefinableTerm term="fracking" definition="Hydraulic fracturing - controversial method of extracting oil/gas from shale rock.">
                    fracking
                    </DefinableTerm> be banned?
                </p>
            </div>
        </section>
    );
};

export default EnvironmentPolicySection;