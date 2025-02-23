// This is the candidates directory page
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types/candidate';
import type { NextPage } from 'next';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const mockCandidates: Candidate[] = [
  {
    first_name: "John",
    last_name: "Doe",
    state: "NY",
    party_affiliation: "Independent",
    congressional_district: "10",
    candidate_id: 1,
  },
  {
    first_name: "Jane",
    last_name: "Smith",
    state: "CA",
    party_affiliation: "Democrat",
    congressional_district: "12",
    candidate_id: 2,
  },
  {
    first_name: "Robert",
    last_name: "Johnson",
    state: "TX",
    party_affiliation: "Republican",
    congressional_district: "07",
    candidate_id: 3,
  }
];


/* NEED TO HANDLE THE VALUE */
const Candidates: NextPage = () => {
  // setup the router
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleClick = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }
    
    /* check the db first, might need to change this */

    const response = await fetch(`/api/candidates/${selectedCandidate.first_name}-${selectedCandidate.last_name}`);
    const data = await response.json();

    if (data.success) {
      router.push(`/candidates/${selectedCandidate.first_name}-${selectedCandidate.last_name}`);
    } else {
      alert('Candidate not found');
      console.error(data.error);
    }
  };

  return (
    <div className="font-sans p-6">
      <div className="flex justify-center items-center space-x-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between rounded-none"
            >
              {selectedCandidate 
                ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}` 
                : "Select candidate..."
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 rounded-none">
            <Command className="font-sans">
            <CommandInput placeholder="Search candidates..." className="rounded-none"/>
              <CommandList>
                <CommandEmpty>No candidate found.</CommandEmpty>
                <CommandGroup>
                  {mockCandidates.map((candidate) => (
                    <CommandItem
                      key={`${candidate.first_name}-${candidate.last_name}`}
                      value={`${candidate.first_name}-${candidate.last_name}`}
                      onSelect={() => {
                        setSelectedCandidate(candidate);
                        setOpen(false)
                      }}
                    >
                      {candidate.first_name} {candidate.last_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>  
            </Command>
          </PopoverContent>
        </Popover>
        <Button onClick={handleClick} className="bg-[#1c1c84] hover:bg-[#b31942] h-10 rounded-none duration-300 ease-in-out">
          Search
        </Button>
      </div>
      <div className="flex flex-col gap-8 p-4">
      <PartySection
          title="Democrats"
          candidates={mockCandidates.filter((c) => c.party_affiliation === "Democrat")}
          bgColor="bg-[#1c1c84]"
          hoverColor="hover:bg-[#14146b]"
        />
        <PartySection
          title="Republicans"
          candidates={mockCandidates.filter((c) => c.party_affiliation === "Republican")}
          bgColor="bg-[#b31942]"
          hoverColor="hover:bg-[#8e122f]"
        />
        <PartySection
          title="Independents"
          candidates={mockCandidates.filter((c) => c.party_affiliation === "Independent")}
          bgColor="bg-[#ffcc00]"
          hoverColor="hover:bg-[#d4aa00]"
        />
      </div>  
    </div>
  );
}; 

const PartySection = ({ title, candidates, bgColor, hoverColor}: { title: string; candidates: Candidate[]; bgColor: string; hoverColor: string; }) => {
  const router = useRouter();

  return (
    <section className="font-sans p-6 rounded-none border-2 border-gray-300 bg-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{title}</h2>
      <div className="flex flex-wrap justify-center gap-4">
      {candidates.map((candidate) => (
          <div
            key={`${candidate.first_name}-${candidate.last_name}`}
            className={`flex items-center p-4 w-64 h-28 rounded-none cursor-pointer transition ${bgColor} ${hoverColor}`}
            onClick={() => router.push(`/candidates/${candidate.first_name}-${candidate.last_name}`)}
          >
            <img src='/images/Rect_NonID_Grey.png' alt="Candidate" className="w-20 h-20 object-cover rounded-md bg-white mr-4" />
            <div className="flex flex-col text-white">
              <h2 className="text-lg font-semibold">{candidate.first_name} {candidate.last_name}</h2>
              <p className="text-md font-serif">
                {candidate.state}-{candidate.congressional_district}
              </p>
            </div>
          </div>
        ))} 
      </div>
    </section>    
  );
};

export default Candidates;