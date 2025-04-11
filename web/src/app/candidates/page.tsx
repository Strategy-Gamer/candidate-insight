// This is the candidates directory page
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getPosition, stateAbbrevs, getStateName } from '@/utils/candidateHelperFuncs';
import { FilterFilled } from '@ant-design/icons';

type ApiCandidate = {
  first_name: string;
  last_name: string;
  party_affiliation?: string | null;
  state?: string | null;
  profile_image_url?: string | null;
  election_year: string;
  congressional_district?: string | null;
  incumbent_position?: string | null;
  running_for_position?: string | null;
};

function getCandidateDescriptor(candidate: ApiCandidate): string {
  const formatDescriptor = (position: string | null | undefined, state: string | null | undefined, district: string | null | undefined): string => {
    if (!position) return '';
    
    if (position === 'Representative') {
      return `${position} (${district})`
    }
    
    // handle other positions
    switch(position) {
      case 'Senator':
      case 'Governor':
        return state ? `${position} (${state})` : position;
      default:
        return position; // for other positions if we add those
    }
  };

  // case 1: incumbent running for different position
  if (candidate.incumbent_position && candidate.running_for_position) {
    const current = formatDescriptor(candidate.incumbent_position, candidate.state, candidate.congressional_district);
    const runningFor = formatDescriptor(candidate.running_for_position, candidate.state, candidate.congressional_district);
    return `${current} running for ${runningFor}`;
  }
  
  // case 2: non-incumbent running for position
  if (candidate.running_for_position) {
    return formatDescriptor(candidate.running_for_position, candidate.state, candidate.congressional_district);
  }
  
  // case 3: incumbent not running (or unknown)
  if (candidate.incumbent_position) {
    return formatDescriptor(candidate.incumbent_position, candidate.state, candidate.congressional_district);
  }

  // default case
  return 'Candidate';
}

const InfoCardButton: React.FC<{ candidate: ApiCandidate; groupByParty: boolean }> = ({ candidate, groupByParty }) => {
  const partyColors: Record<string, string> = {
    Democratic: "bg-[#1c1c84] hover:bg-[#14146b]",
    Republican: "bg-[#b31942] hover:bg-[#8e122f]",
    Constitution: "bg-[#57007f] hover:bg-[#440065]",
    Green: "bg-[#0b6623] hover:bg-[#094d1b]",
    Libertarian:"bg-[#e5c100] hover:bg-[#b89b00]",
    Independent: "bg-[#ffcc00] hover:bg-[#d4aa00]",
  };
  
  const imgSrc = candidate.profile_image_url ?? '/images/Rect_NonID_Grey.png';
  
  const party = candidate.party_affiliation ?? "Independent";
  const partyAbbrev = party.slice(0, 1);
  const fullName = `${candidate.first_name} ${candidate.last_name}`;
  let position = getCandidateDescriptor(candidate);
  
  const bgColor = groupByParty ? partyColors[party] || "bg-gray-500" : "bg-gray-700 hover:bg-gray-900";

  return (
    <Card 
      className={`w-[275px] cursor-pointer rounded-none duration-300 ease-in-out ${bgColor}`}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-white">{`${fullName} (${partyAbbrev})`}</CardTitle>
        <CardDescription className="text-white">{position}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Image
          src={imgSrc}
          width={200}
          height={250}
          alt={`${fullName}'s Photo`}
        />
      </CardContent>
    </Card>
  );
};

const Candidates: NextPage = () => {
  const searchParams = useSearchParams();
  const urlYear = searchParams.get('year');
  
  const [filters, setFilters] = useState({
    party: '',
    state: '',
    position: '',
    year: urlYear || '2024',
  });

  const [groupByParty, setGroupByParty] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ApiCandidate | null>(null);
  const [candidates, setCandidates] = useState<ApiCandidate []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCandidates = async (year: string = filters.year) => {
    try {
      const response = await fetch(`/api/candidates?year=${year}`);
      const data = await response.json();

      if (data.success) {
        setCandidates(data.candidates);
      } else {
        setError('Failed to load candidates');
      }
    } catch (err) {
      setError('Error loading candidates');
      console.error(err);
    } finally {
      setLoading(false);  
    }
  };

  // this is for if the year changes and the URL needs to be changed
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (filters.year !== '2024') {
      newParams.set('year', filters.year);
    } else {
      newParams.delete('year');
    }
    
    router.replace(`?${newParams.toString()}`, { scroll: false });
  }, [filters.year]);

  // here I fetched candidates based on the default year
  useEffect(() => {
    fetchCandidates(filters.year);
  }, [filters.year]);

  // this is for if the URL changes
  useEffect(() => {
    const urlYear = searchParams.get('year');
    if (urlYear && urlYear !== filters.year) {
      setFilters(prev => ({ ...prev, year: urlYear }));
    }
  }, [searchParams]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement> | { name: string, value: string }) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;
    setFilters(prev => ({ ...prev, [name]: value }));
  }
  
  const toggleGroupByParty = () => {
    setGroupByParty(prevState => !prevState);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesParty = filters.party ? candidate.party_affiliation === filters.party: true;
    const matchesState = (() => {
      if (!filters.state) return true;
      const state = candidate.state;
      if (!state || state === "US") return false;

      const stateName = getStateName(state);
      return (stateAbbrevs as Record<string, string>)[stateName!] === filters.state;
    })(); // immediately invoked function expression
    
    let matchesPosition = true;
    if (filters.position === "house") {
      matchesPosition = candidate.incumbent_position === "Representative" || 
      candidate.running_for_position === "Represenative";
    } else if (filters.position === "senate") {
      matchesPosition = candidate.incumbent_position === "Senator" || 
      candidate.running_for_position === "Senator";
    } else if (filters.position === "presidential") {
      matchesPosition = candidate.incumbent_position === "President" || 
      candidate.running_for_position === "President";
    } else if (filters.position === "gubernatorial") {
      matchesPosition = candidate.incumbent_position === "Governor" || 
      candidate.running_for_position === "Governor";
    }
    return matchesParty && matchesState && matchesPosition;
  });

  const handleClearFilters = () => {
    setFilters({
      party: '',
      state: '',
      position: '',
      year: '',
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

    // will probably need to modify this based on what year the candidate is selected, or perhaps
    // just allow users to switch between years
    if (data.success) {
      router.push(`/candidates/${selectedCandidate.first_name}-${selectedCandidate.last_name}`);
    } else {
      alert('Candidate not found');
      console.error(data.error);
    }
  };

  if (loading) {
    return <p>Loading candidates...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

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
            {/* checkbox for partying by group */}
            <div className="mb-3">
              <label className="flex items-center">
                <Checkbox 
                  id="groupByParty" 
                  checked={groupByParty}
                  onCheckedChange={toggleGroupByParty}
                  className="rounded-none"
                />
                <span className="font-sans ml-2">Group By Party</span>
              </label>
            </div>

            {/* party filter section */}
            <Select
              value={filters.party}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  party: value === "All" ? "" : value // store empty string for "All"
                }));
              }}
            >
              <SelectTrigger className="text-sm rounded-none">
                <SelectValue placeholder="Filter by Party" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Democratic">Democratic</SelectItem>
                  <SelectItem value="Republican">Republican</SelectItem>
                  <SelectItem value="Constitution">Constitution</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Libertarian">Libertarian</SelectItem>
                  <SelectItem value="Independent">Independent</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* state filter section*/}
            <Select
              value={filters.state}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  state: value === "All" ? "" : value // store empty string for "All"
                }));
              }}
            >
              <SelectTrigger className="text-sm mt-3 rounded-none">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All</SelectItem>
                    {Object.entries(stateAbbrevs).map(([stateName, abbrev]) => (
                      <SelectItem key={abbrev} value={abbrev}>
                        {stateName}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* position filter section*/}
            <Select
              value={filters.position}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  position: value === "All" ? "" : value // store empty string for "All"
                }));
              }}
            >
              <SelectTrigger className="text-sm mt-3 rounded-none">
                <SelectValue placeholder="Filter by Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="senate">Senate</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                  <SelectItem value="gubernatorial">Governor</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

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
          ["Democratic", "Republican", "Independent", "Green", "Constitution", "Libertarian"].map((party) => {
            const candidates = filteredCandidates.filter((c) => c.party_affiliation === party);
            if (candidates.length === 0) return null;

            return (
              <section key={party} className="font-sans p-6 rounded-none border-2 border-gray-300 bg-gray-100">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{party} Party</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {candidates.map((candidate) => (
                    <Link
                    key={`${candidate.first_name}-${candidate.last_name}`}
                    href={`/candidates/${candidate.first_name}-${candidate.last_name}`}
                    className="parent"
                  >
                    <InfoCardButton 
                      key={`${candidate.first_name}-${candidate.last_name}`} 
                      candidate={candidate} 
                      groupByParty={false}
                    />
                  </Link>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          
          // simply display all candidates
          <div className="flex flex-wrap justify-center gap-4">
            {filteredCandidates.map((candidate) => (
              <Link
                key={`${candidate.first_name}-${candidate.last_name}`}
                href={`/candidates/${candidate.first_name}-${candidate.last_name}`}
                className="parent"
              >
                <InfoCardButton 
                  key={`${candidate.first_name}-${candidate.last_name}`} 
                  candidate={candidate} 
                  groupByParty={false}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;