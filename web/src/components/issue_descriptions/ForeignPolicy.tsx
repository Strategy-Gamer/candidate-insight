import React from "react";
import DefinableTerm from "./DefinableTerm";

const ForeignPolicySection: React.FC = () => {
    return (
        <section className="max-w-6xl mx-auto font-sans text-gray-800">
            <h3 className="text-3xl font-bold text-center mb-6">Foreign Policy</h3>

            <p className="text-lg text-justify mb-4">
                Foreign Policy describes the way a national government interacts with other nations. Governments can enforce 
                different rules or restrictions for different foreign countries. Many nations have military alliances with others, 
                and military aid is also part of foreign policy. Trade is also a major area of foreign policy, and countries can 
                impose tariffs or provide incentives for better business with other countries. 
            </p>

            <p className="text-lg text-justify mb-4">
                Every citizen is affected by foreign policy. For travelers, foreign policy can dictate which countries 
                you are and aren't allowed to visit. For consumers, foreign policy can affect the prices and availability 
                of goods ranging from groceries to automobiles. Foreign policy can be especially controversial when it 
                comes to participation in wars and other international conflicts.
            </p>
            
                       
        </section>
    );
};

export default ForeignPolicySection;