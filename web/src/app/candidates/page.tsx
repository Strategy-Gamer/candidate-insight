// This is the candidates directory page
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { NextPage } from 'next';
import { ScrollArea } from "@/components/ui/scroll-area";
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
import Pages from "@/components/Pages";
import { Input } from "@/components/ui/input";
import { Checkbox } from '@/components/ui/checkbox';
import {Separator} from '@/components/ui/separator';
import { stateAbbrevs } from '@/utils/candidateHelperFuncs';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import { Skeleton } from '@/components/ui/skeleton';

type ApiCandidate = {
  candidate_id: number;
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

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return "N/A"; // Handle null or undefined date
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-padded
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits
  return `${month}/${day}/${year}`;
};

function getAge(birthDate: Date | string | null): number | string {
  if (!birthDate) return "N/A"; // Handle null or undefined date
  // Handle string input
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  // Calculate raw age
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust if birthday hasn't occurred yet this year
  if (
    monthDiff < 0 || 
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  
  return age;
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
  const runningForPosition = candidate.running_for_position ? `${candidate.running_for_position} (${candidate.state})` : "Not Running";
  const incumbentPosition = candidate.incumbent_position ? `${candidate.incumbent_position} (${candidate.state})` : "Not Holding Office";

  const bgColor = groupByParty ? partyColors[party] || "bg-gray-500" : "bg-gray-700 hover:bg-gray-900";

  return (
    <Card 
      className={`w-[275px] h-[425px] cursor-pointer rounded-none duration-300 ease-in-out ${bgColor}`}
    >
      <CardHeader className="text-center h-24 flex flex-col justify-center items-center px-2">
        <CardTitle className="text-white">{fullName.replace(/#/g, ' ')}</CardTitle>
        <CardDescription className="text-white flex flex-row items-center gap-2 mt-1">
          <span>({partyAbbrev})</span>
          <Separator orientation="vertical" className="h-4 w-px bg-white/50" />
          <span>Age: {getAge(candidate.dob!)}</span>
          <Separator orientation="vertical" className="h-4 w-px bg-white/50" />
          <span>Born: {formatDate(candidate.dob!)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-white">
          <h2 className="font-medium">Running For: {runningForPosition}</h2>
          <h2 className="italic">Currently: {incumbentPosition}</h2>
        </div>
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

const LIMIT = 32;

const Candidates: NextPage = () => {
  const searchParams = useSearchParams();
  const urlYear = searchParams.get('year');
  
  const electionYears = ["2028", "2026", "2024", "2022"];
  const [filters, setFilters] = useState({
    party: '',
    state: '',
    position: '',
    year: urlYear || '2024',
    str: ''
  });
  const [sortValue, setSortValue] = useState<number>(0);

  const [groupByParty, setGroupByParty] = useState(false);
  const [candidates, setCandidates] = useState<ApiCandidate []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCandidates, setTotalCandidates] = useState(null);
  const [page, setPage] = useState(1);

  const sortedCandidates = useMemo(() => {
    const sorted = [...candidates]; // always copy first to avoid mutating

    if (sortValue !== 0) {
      if (sortValue === 1 || sortValue === -1) {
        sorted.sort((a, b) => {
          const dateA = new Date(a.dob || '');
          const dateB = new Date(b.dob || '');
          return sortValue === -1 ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
      }
      else if (sortValue === 2 || sortValue === -2) {
        sorted.sort((a, b) => {
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return sortValue === 2 ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
      }
    }

    return sorted;
  }, [candidates, sortValue]);

  const fetchCandidates = async (year: string = filters.year) => {
    setLoading(true);
    try {
      const url = `
      /api/candidates?page=${page}&limit=${LIMIT}&year=${year}&state=${filters.state}&party=${filters.party}&position=${filters.position}&search=${filters.str.toLowerCase().replace(/ /g, '')}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const count = data.total;
        // Don't display invalid page numbers
        if (count > 0) {
          if (Math.ceil(count / LIMIT) < page)
            setPage(Math.ceil(count / LIMIT));
          setTotalCandidates(count);
        }

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

  // fetch candidates when filters change
  useEffect(() => {
    const delayBounce = setTimeout(() => {
      fetchCandidates(filters.year);
    }, 300);
    
    return () => clearTimeout(delayBounce);
    // fetchCandidates(filters.year);
  }, [filters.year, page, filters.state, filters.party, filters.position, filters.str]);


  const toggleGroupByParty = () => {
    setGroupByParty(prevState => !prevState);
  };

  const handleClearFilters = () => {
    setFilters({
      party: '',
      state: '',
      position: '',
      year: filters.year, // keep it current
      str: ''
    });
    setSortValue(0); 
    setGroupByParty(false);
  };

  return (    
    <div className="font-sans p-6">
      
      <h1 className="text-3xl text-center font-bold mb-6 text-[#1c1c84]">{filters.year} Candidates</h1>
    
     {/* search section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-4 md:px-8 w-full gap-4">
        {/* Search & filters - stacks on mobile, horizontal on larger screens */}
        <div className="flex flex-col w-full md:w-auto md:flex-row md:items-center gap-3 md:space-x-4">
          {/* Search input - full width on mobile */}
          <div className="relative w-full md:w-auto">
            <Input
              value={filters.str}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev,
                  str: e.target.value
                }))
              }}
              placeholder='Find a candidate...'
              className="w-full md:w-64 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <SearchOutlined className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Top row of filters on mobile - Year and Party/Group filters */}
          <div className="flex flex-row w-full md:w-auto gap-2">
            {/* Year dropdown */}
            <Select
              value={filters.year}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  year: value
                }));
              }}
            >
              <SelectTrigger className="w-full md:w-32 text-sm rounded-none">
                <SelectValue placeholder="Election Year" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="2024">
                    2024
                  </SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced filters popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" aria-label="filters button" className="h-10 rounded-none">
                  <FilterFilled />
                  <span className="ml-2 hidden sm:inline">Filters</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 rounded-none">
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
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Senator">Senate</SelectItem>
                      <SelectItem value="President">Presidential</SelectItem>
                      <SelectItem value="gubernatorial">Governor</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Button onClick={handleClearFilters} className="mt-3 w-full bg-[#1c1c84] hover:bg-[#b31942] h-10 rounded-none duration-300 ease-in-out">
                  Clear Filters
                </Button>
              </PopoverContent>
            </Popover>

            {/* Sort dropdown */}
            <Select
              onValueChange={(value) => setSortValue(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-32 text-sm rounded-none">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">Youngest to Oldest</SelectItem>
                  <SelectItem value="-1">Oldest to Youngest</SelectItem>
                  <SelectItem value="2">A-Z</SelectItem>
                  <SelectItem value="-2">Z-A</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Pagination - full width on mobile */}
        <div className="w-full md:w-auto flex justify-center md:justify-end mt-2 md:mt-0">
          <Pages 
            page={page} 
            limit={LIMIT} 
            total={totalCandidates || 1} 
            onPageChange={setPage}
          />
        </div>
      </div>

      <div className="text-center mb-6">
        {loading && (
          <div className="flex flex-col gap-8 px-4 py-4">
            <p className="text-gray-500 mt-2">Loading candidates...</p>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: 32 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-[275px] h-[425px] rounded-none"
                />
              ))}
            </div>
          </div>        
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {!loading && sortedCandidates.length === 0 && (
          <p className="text-gray-500 mt-2">No candidates found for the selected filters.</p>
        )}
      </div>
      
      {/* candidate cards */}
      <ScrollArea className="h-[600px] w-full rounded-none">
      <div className="flex flex-col gap-8 px-4 py-4">
        {groupByParty ? (
          // group by party
          ["Democratic", "Republican", "Independent", "Green", "Constitution", "Libertarian"].map((party) => {
            const groupedCandidates = sortedCandidates.filter((c) => c.party_affiliation === party);
            if (groupedCandidates.length === 0) return null;

            return (
              <section key={party} className="font-sans p-6 rounded-none border-2 border-gray-300 bg-gray-100">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{party} Party</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {groupedCandidates.map((candidate) => (
                    <Link
                    key={candidate.candidate_id}
                    href={`/candidates/${candidate.first_name}-${candidate.last_name.replace(/#/g, '_')}-${candidate.candidate_id}`}
                    className="parent"
                  >
                    <InfoCardButton 
                      key={candidate.candidate_id} 
                      candidate={candidate} 
                      groupByParty={true}
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
            {sortedCandidates.map((candidate) => (
              <Link
                key={candidate.candidate_id}
                href={`/candidates/${candidate.first_name}-${candidate.last_name.replace(/#/g, '_')}-${candidate.candidate_id}`}
                className="parent"
              >
                <InfoCardButton 
                  key={candidate.candidate_id} 
                  candidate={candidate} 
                  groupByParty={false}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      </ScrollArea>
    </div>
  );
};

export default Candidates;