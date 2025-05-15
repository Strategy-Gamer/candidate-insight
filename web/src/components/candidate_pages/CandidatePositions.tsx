"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { PoliticalCategory } from '@/types/issues';
import '@/styles/components/candidateposition.css';
import dynamic from 'next/dynamic';
import { ApiCandidate } from "@/types/candidate";

  
interface Props {
    categories: PoliticalCategory[];
    candidate: ApiCandidate;
}

const DynamicTable = dynamic(() => import('./PositionsTable'));

const IssuesAccordionTable = ({ categories, candidate }: Props) => {
    return (
      <div className="flex flex-col flex-start justify-center p-3 m-auto bg-white w-full md:max-w-[80%] overflow-hidden gap-12">
        <h2 className="flex-row text-center font-serif text-[20pt] font-medium text-[#1c1c84]">Political Stances</h2>
        {categories.map((category) => (
          <section key={category.category} className="border rounded-none p-6">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">{category.category}</h2>
                <p className="text-muted-foreground">{category.category_description}</p>
              </div>
            </div>  
            <Accordion type="multiple" className="w-full">
                <AccordionItem key="key" value="value">
                  <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-gray-50 rounded-none">
                    View Available Stances
                  </AccordionTrigger>                  
                  <AccordionContent className="px-4 pb-4">
                    <DynamicTable category={category.category} candidate={candidate}></DynamicTable>
                  </AccordionContent>
                </AccordionItem>
            </Accordion>
          </section>
        ))}
      </div>
    );
  };

export default IssuesAccordionTable;