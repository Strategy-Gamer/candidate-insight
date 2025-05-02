'use client';
import { useState, useMemo } from 'react';
import { ApiCandidatePosition, Source } from '@/types/positions';
import { Issue } from '@/types/issues';
import Tweet from './Tweet';
import "@/styles/components/Positions.css";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FilterFilled, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { Button } from './ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link';

interface PositionsProps {
    positions: ApiCandidatePosition[];
    issue: Issue;
}

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

const Positions: React.FC<PositionsProps> = ({positions, issue}: PositionsProps) => {
  const [allPositions] = useState<ApiCandidatePosition[]>(positions);
  const [positionSources, setPositionSources] = useState<Record<number, Source[]>>({});
  const [filters, setFilters] = useState({
    party: 'All',
    str: '',
    supports: '',
    sortVal: 0
  });

  const filteredPositions = useMemo(() => {
    const normalizedStr = filters.str.toLowerCase().replace(/ /g, '');
    const filtered = allPositions.filter((position: ApiCandidatePosition) => {
      let supportsFilter;
      if (filters.supports === 'S') {
        supportsFilter = position.supports_position == true;
      } else if (filters.supports === 'O') {
        supportsFilter = position.supports_position == false;
      } else {
        supportsFilter = true;
      }
  
      const partyFilter = filters.party !== 'All' ? position.party_affiliation === filters.party : true
      
      if (filters.str === '') {
        return partyFilter && supportsFilter;
      }
  
      const searchString = (position.first_name+position.last_name).toLowerCase();
      return findStr(searchString, normalizedStr) && partyFilter && supportsFilter;
    })

    if (filters.sortVal !== 0) {
      return filtered.sort((a: ApiCandidatePosition, b: ApiCandidatePosition) => {
        if (a.first_name < b.first_name) return filters.sortVal * -1;
        if (a.first_name > b.first_name) return filters.sortVal * 1;
        
        // If first names are equal, compare last names
        if (a.last_name < b.last_name) return filters.sortVal * -1;
        if (a.last_name > b.last_name) return filters.sortVal * 1;
        
        // Names are identical
        return 0;
      });
    }
    return filtered;
  }, [allPositions, filters.sortVal, filters.supports, filters.party, filters.str]);

  const handleClearFilters = () => {
    setFilters({
      party: 'All',
      str: '',
      supports: '',
      sortVal: 0
    });
  }

  const handleSourceClick = async (id: number) => {
    if (id in positionSources) return;

    try {
      const res = await fetch(`/api/positions/${id}`);
      const data = await res.json();
      
      setPositionSources(prev => ({
        ...prev,
        [id]: data.sources
      })); 
    } catch (error) {
      console.error('Error fetching sources:', error);
    } 
  }

  return (
   <div>
    <h1 className='text-3xl font-bold m-0'>
      {issue.issue_name}
    </h1>
    <h2 className="text-2xl m-0">
      {issue.issue_description}
    </h2>
    <div className="flex justify-center w-full px-4 pt-4">
      <div className="flex flex-wrap justify-center gap-2 items-center w-full max-w-3xl">
        <div className="flex-grow min-w-[200px]">
          <Input
            value={filters.str}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                str: e.target.value
              }))
            }}
            placeholder='Find a candidate...'
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 rounded-none">
                <FilterFilled />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4 rounded-none">
              <Select
                value={filters.party}
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    party: value
                  }))
                }}
              >
              <SelectTrigger className="text-sm rounded-none">
                <SelectValue placeholder="Filter by Party" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Democratic">Democratic</SelectItem>
                <SelectItem value="Republican">Republican</SelectItem>
              </SelectContent>
              </Select>

              <RadioGroup 
                defaultValue="option-one" 
                onValueChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    supports: value
                  }))
                }}
                className="mt-3"
              >
                <div className="flex justify-between items-center">
                  <Label htmlFor="option-one">Supports</Label>
                  <RadioGroupItem 
                    value="S" 
                    id="option-one"
                    checked={filters.supports == 'S' ? true : false} 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="option-two">Opposes</Label>
                  <RadioGroupItem 
                    value="O" 
                    id="option-two" 
                    checked={filters.supports == 'O' ? true : false}
                  />
                </div>
              </RadioGroup>

              <Button onClick={handleClearFilters} className="mt-3 bg-[#1c1c84] hover:bg-[#b31942] h-10 rounded-none duration-300 ease-in-out w-full">
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
                sortVal: prev.sortVal == 0 || prev.sortVal == -1 ? 1 : -1
              }))
            }}
          >
            {filters.sortVal == 0 || filters.sortVal == -1 ? <SortAscendingOutlined /> : <SortDescendingOutlined />}  
          </Button>
        </div>
      </div>
    </div>
    <section className="position-container">
      <ScrollArea className="scroll">
        <Accordion type="single" collapsible className="w-full">
          {filteredPositions.map((position, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="w-full">
              <AccordionTrigger onClick={() => handleSourceClick(position.position_id)} className="hover:no-underline w-full">
                <div className="flex justify-between items-center w-full">
                  <div className="position">
                    <span className={`Name ${position.party_affiliation}`}>
                      {position.first_name} {position.last_name}
                    </span>
                    <span className={`status ${position.supports_position ? 'yes' : 'no'}`}>
                      {position.supports_position ? " supports " : " opposes "}
                    </span>
                    because {position.position_description}
                  </div>
                  <span className="text-sm md:text-base lg:text-lg hover:underline">Sources</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-1 pb-2 md:p-4">
                {position.position_id in positionSources ? (
                  
                  <>
                    {/* TODO: Web Sources */}
                    <div className="flex justify-evenly w-full flex-wrap">
                      {positionSources[position.position_id].filter(source => source.tweet == null).map((source, index) => (
                        <Link
                            href={source.url}
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            View Source
                            {source.date && (
                                <span className="text-gray-400 ml-1">
                                    ({new Date(source.date).toLocaleDateString()})
                                </span>
                            )}
                        </Link>
                      ))}
                    </div>

                    {/* Twitter Sources*/}
                    <h2 className="text-xl font-bold mt-4">Tweets</h2>
                    <div className="flex justify-center w-full">
                      <div className="flex flex-col border-l border-r border-b border-gray-125 w-full max-w-[650px]">
                        {positionSources[position.position_id].filter(source => source.tweet != null).map((source, index) => (
                          <Tweet 
                            key={index}
                            tweet={source.tweet}
                            date={source.date}
                            firstName={position.first_name}
                            lastName={position.last_name}
                            username={position.twitter}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Getting sources...</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </section>
   </div>
  );
};

export default Positions;