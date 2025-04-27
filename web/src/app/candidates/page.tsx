// This is the candidates directory page
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Checkbox } from '@/components/ui/checkbox';
import { stateAbbrevs, getStateName } from '@/utils/candidateHelperFuncs';
import { FilterFilled, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

type ApiCandidate = {
  first_name: string;
  last_name: string;
  party_affiliation?: string | null;
  state?: string | null;
  profile_image_url?: string | null;
  dob?: string | null;
  election_year: string;
  congressional_district?: string | null;
  incumbent_position?: string | null;
  running_for_position?: string | null;
};

function findStr(str: string, sequence: string) {
  let index = 0;
  let isSubsequence = false;

  for (const char of str) {
    if (char === sequence[index]) {
      index++;
    }
    if (index === sequence.length) {
      isSubsequence = true;
      break;
    }
  }
  return str.includes(sequence) || isSubsequence;
}

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
      className={`w-[275px] h-[400]cursor-pointer rounded-none duration-300 ease-in-out ${bgColor}`}
    >
      <CardHeader className="text-center h-24 flex flex-col justify-center px-2">
        <CardTitle className="text-white leading-tight line-clamp-2">{`${fullName} (${partyAbbrev})`}</CardTitle>
        <CardDescription className="text-white mt-` line-clamp-1">{position}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
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
  
  const electionYears = ["2028", "2026", "2024", "2022"];
  const [filters, setFilters] = useState({
    party: '',
    state: '',
    position: '',
    year: urlYear || '2024',
    str: '',
    sortAlph: 0,
    sortDOB: 0,
  });

  const [groupByParty, setGroupByParty] = useState(false);
  const [candidates, setCandidates] = useState<ApiCandidate []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async (year: string = filters.year) => {
    setLoading(true);
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

  // fetch candidates when the year changes
  useEffect(() => {
    fetchCandidates(filters.year);
  }, [filters.year]);

  const toggleGroupByParty = () => {
    setGroupByParty(prevState => !prevState);
  };

  const filteredCandidates = useMemo(() => {
    const filtered = candidates.filter((candidate) => {
      const matchesParty = filters.party ? candidate.party_affiliation === filters.party: true;

      const matchesState= (() => {
        if (!filters.state) return true;

        const state = candidate.state;
        if (!state || state === "US") return false;

        const stateName = getStateName(state);
        return (stateAbbrevs as Record<string, string>)[stateName!] === filters.state;
      })();

      let matchesPosition = true;

      switch (filters.position) {
        case "house":
          matchesPosition = candidate.incumbent_position === "Representative" || 
          candidate.running_for_position === "Representative";
          break;
        case "senate":
          matchesPosition = candidate.incumbent_position === "Senator" || 
          candidate.running_for_position === "Senator";
          break;
        case "presidential":
          matchesPosition = candidate.incumbent_position === "President" || 
          candidate.running_for_position === "President";
          break;
        case "gubernatorial":
          matchesPosition = candidate.incumbent_position === "Governor" || 
          candidate.running_for_position === "Governor";
          break;
      }
      
      const searchString = (candidate.first_name + candidate.last_name).toLowerCase();
      const found = findStr(searchString, filters.str.toLowerCase().replace(/ /g, ''));

      return found && matchesParty && matchesState && matchesPosition;
    });

    if (filters.sortAlph !== 0) {
      return filtered.sort((a: ApiCandidate, b: ApiCandidate) => {
        if (a.first_name < b.first_name) return filters.sortAlph * -1;
        if (a.first_name > b.first_name) return filters.sortAlph * 1;

        if (a.last_name < b.last_name) return filters.sortAlph * -1;
        if (a.last_name > b.last_name) return filters.sortAlph * 1;

        return 0;
      })
    }

    if (filters.sortDOB !== 0) {
      return filtered.sort((a: ApiCandidate, b: ApiCandidate) => {
        // handle missing dates
        if (!a.dob && !b.dob) return 0;
        if (!a.dob) return 1;
        if (!b.dob) return -1;

        const date1 = new Date(a.dob!).getTime();
        const date2 = new Date(b.dob!).getTime();

        if (date1 < date2) return filters.sortDOB * -1;
        if (date1 > date2) return filters.sortDOB * 1;        
        return 0;
      });
    }

    return filtered;
  }, [candidates, filters.party, filters.state, filters.position, filters.str, filters.sortAlph]);

  const handleClearFilters = () => {
    setFilters({
      party: '',
      state: '',
      position: '',
      year: filters.year, // keep it current
      str: '',
      sortAlph: 0,
      sortDOB: 0,
    });
    setGroupByParty(false);
  };

  return (    
    <div className="font-sans p-6">
      {/* years */}
      <Select
        value={filters.year}
        onValueChange={(value) => {
          setFilters(prev => ({
            ...prev,
            year: value
          }));
        }}
      >
        <SelectTrigger className="w-32 text-sm rounded-none">
          <SelectValue placeholder="Election Year" />
        </SelectTrigger>
        <SelectContent>
          {electionYears.map(year => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <h1 className="text-3xl text-center font-bold mb-6 text-[#1c1c84]">{filters.year} Candidates</h1>
    
      {/* search section */}
      <div className="flex justify-center items-center space-x-4">
        <Input
          value={filters.str}
          onChange={(e) => {
            setFilters(prev => ({
              ...prev,
              str: e.target.value
            }))
          }}
          placeholder='Find a candidate...'
          className="w-200 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
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
            
            <Select
              value={filters.sortDOB === 1 ? "ascending" : filters.sortDOB === -1 ? "descending" : ""}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  sortDOB: value === "ascending" ? 1 : value === "descending" ? -1 : 0
                }))
              }}
            >
              <SelectTrigger className="text-sm mt-3 rounded-none">
                <SelectValue placeholder="Filter by DOB" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="ascending">Youngest to Oldest</SelectItem>
                  <SelectItem value="descending">Oldest to Youngest</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button onClick={handleClearFilters} className="mt-3 bg-[#1c1c84] hover:bg-[#b31942] h-10 rounded-none duration-300 ease-in-out">
              Clear Filters
            </Button>

          </PopoverContent>
        </Popover>
        <Button 
          variant={"outline"} 
          className="h-10 rounded-none"
          onClick={() => {
            setFilters(prev => ({
              ...prev,
              sortAlph: prev.sortAlph == 0 || prev.sortAlph == -1 ? 1 : -1
            }))
          }}
        >
          {filters.sortAlph == 0 || filters.sortAlph == -1 ? <SortAscendingOutlined /> : <SortDescendingOutlined />}  
        </Button>
      </div>

      <div className="text-center mb-6">
        {loading && <p className="text-gray-500 mt-2">Loading candidates...</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {!loading && filteredCandidates.length === 0 && (
          <p className="text-gray-500 mt-2">No candidates found for the selected filters.</p>
        )}
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