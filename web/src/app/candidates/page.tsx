// This is the candidates directory page
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types/candidate';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { getPosition, stateAbbrevs } from '@/utils/candidateHelperFuncs';
import { mockCandidates } from '@/utils/mockCandidates';
import { FilterFilled } from '@ant-design/icons';

const InfoCardButton: React.FC<{ candidate: Candidate; onClick: () => void; groupByParty: boolean }> = ({ candidate, onClick, groupByParty }) => {
  const partyColors: Record<string, string> = {
    Democrat: "bg-[#1c1c84] hover:bg-[#14146b]",
    Republican: "bg-[#b31942] hover:bg-[#8e122f]",
    Independent: "bg-[#ffcc00] hover:bg-[#d4aa00]",
  };
  
  const imgSrc = candidate.profile_image_url ?? '/images/Rect_NonID_Grey.png';
  console.log(imgSrc);
  
  const party = candidate.party_affiliation ?? "Independent";
  const fullName = `${candidate.first_name} ${candidate.last_name}`;
  const position = getPosition(candidate.congressional_district, candidate.party_affiliation, candidate.state);
  const bgColor = groupByParty ? partyColors[party] || "bg-gray-500" : "bg-gray-700 hover:bg-gray-900";
  return (
    <Card 
      className={`w-[275px] cursor-pointer rounded-none duration-300 ease-in-out ${bgColor}`}
      onClick={onClick}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-white">{fullName}</CardTitle>
        <CardDescription className="text-white">{position}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <img 
          src={imgSrc}
          alt={`${fullName}'s Photo`} 
          className="w-[200px] h-[250px] object-cover rounded-none" 
        />
      </CardContent>
    </Card>
  );
};

const Candidates: NextPage = () => {
  // setup the router
  const router = useRouter();

  const [filters, setFilters] = useState({
    party: '',
    state: '',
    position: '',
  });
  const [groupByParty, setGroupByParty] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  // const [mockCandidates, setMockCandidates] = useState<Candidate[]>([]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const toggleGroupByParty = () => {
    setGroupByParty(prevState => !prevState);
  };

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesParty = filters.party ? candidate.party_affiliation === filters.party: true;
    const matchesState = filters.state ? candidate.state === filters.state: true;
    
    let matchesPosition = true;
    if (filters.position === "house") {
      matchesPosition = candidate.congressional_district !== null; // house reps have a district set
    } else if (filters.position === "senate") {
      matchesPosition = candidate.state !== null && candidate.congressional_district === null;
    } else if (filters.position === "presidential") {
      matchesPosition = candidate.state === null && candidate.congressional_district === null;
    }
    return matchesParty && matchesState && matchesPosition;
  });

  const handleClearFilters = () => {
    setFilters({
      party: '',
      state: '',
      position: ''
    });
    setGroupByParty(false);
  };

  const handleClick = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }
    
    const response = await fetch(`/api/candidates/${selectedCandidate.first_name}-${selectedCandidate.last_name}`);
    const data = await response.json();

    if (data.success) {
      router.push(`/candidates/${selectedCandidate.first_name}-${selectedCandidate.last_name}`);
    } else {
      alert('Candidate not found');
      console.error(data.error);
    }
  };

  /* 
  useEffect(() => {
    async function fetchCandidates() {
      try {
        const response = await fetch('/api/candidates'); // API call
        const data = await response.json();

        if (data.success) {
          setMockCandidates(data.candidates);
        } else {
          console.error('Failed to fetch candidates:', data.error);
        }
      } catch (error) {
        console.error('API request error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, []);
  */

  return (    
    <div className="font-sans p-6">
      {/* search section */}
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
                : "Find a candidate..."
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 rounded-none">
            <Command className="font-sans">
            <CommandInput placeholder="Search candidates..." className="rounded-none"/>
              <CommandList>
                <CommandEmpty>No candidate found.</CommandEmpty>
                <CommandGroup>
                  {filteredCandidates.map((candidate) => (
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

        {/* filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 rounded-none">
              <FilterFilled />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-4 rounded-none">
            <div className="mb-3">
              {/* change below to shadcn/ui components (select + checkbox), just testing rn */}
              <label>
                <input
                  type="checkbox"
                  checked={groupByParty}
                  onChange={toggleGroupByParty}
                />
                <span className="font-sans ml-2">Group By Party</span>
              </label>
            </div>
            <label className="block text-sm">Filter by Party:</label>
              <select name="party" onChange={handleFilterChange} className="p-2 w-full border rounded-md">
                  <option value="">All</option>
                  <option value="Democrat">Democrat</option>
                  <option value="Republican">Republican</option>
                  <option value="Independent">Independent</option>
              </select>

            <label className="block text-sm mt-3">Filter by State:</label>
              <select name="state" onChange={handleFilterChange} className="p-2 w-full border rounded-md">
                <option value="">All</option>
                  {Object.entries(stateAbbrevs).map(([stateName, abbrev]) => (
                    <option key={abbrev} value={abbrev}>
                      {stateName}
                    </option>
                  ))}
              </select>
            <label className="block text-sm mt-3">Filter by Position</label>
              <select name="position" onChange={handleFilterChange} className="p-2 w-full border rounded-md">
                  <option value ="">All Positions</option>
                  <option value="house">House</option>
                  <option value="senate">Senate</option>
                  <option value="presidential">Presidential</option>
              </select>
              <Button onClick={handleClearFilters} className="mt-3 bg-[#1c1c84] hover:bg-[#b31942] h-10 rounded-none duration-300 ease-in-out">
                Clear Filters
              </Button>
          </PopoverContent>
        </Popover>

        {/* search button (redirects them) */ }
        <Button onClick={handleClick} className="bg-[#1c1c84] hover:bg-[#b31942] h-10 rounded-none duration-300 ease-in-out">
          Search
        </Button>
      </div>
      
      {/* candidate cards */}
      <div className="flex flex-col gap-8 p-4">
        {groupByParty ? (
          // group by party
          ["Democrat", "Republican", "Independent"].map((party) => {
            const candidates = filteredCandidates.filter((c) => c.party_affiliation === party);
            if (candidates.length === 0) return null;

            return (
              <section key={party} className="font-sans p-6 rounded-none border-2 border-gray-300 bg-gray-100">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{party}s</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {candidates.map((candidate) => (
                    <InfoCardButton 
                      key={`${candidate.first_name}-${candidate.last_name}`} 
                      candidate={candidate} 
                      onClick={() => router.push(`/candidates/${candidate.first_name}-${candidate.last_name}`)}
                      groupByParty={true}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          
          // simply display all candidates
          <div className="flex flex-wrap justify-center gap-4">
            {filteredCandidates.map((candidate) => (
              <InfoCardButton 
                key={`${candidate.first_name}-${candidate.last_name}`} 
                candidate={candidate} 
                onClick={() => router.push(`/candidates/${candidate.first_name}-${candidate.last_name}`)}
                groupByParty={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* old candidate info cards
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
*/
export default Candidates;