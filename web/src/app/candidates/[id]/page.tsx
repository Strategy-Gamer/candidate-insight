"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Candidate, ApiCandidate } from '@/types/candidate';
import CandidateCard from '@/components/candidate_pages/CandidateCard';
import CandidatePositions from '@/components/candidate_pages/CandidatePositions';
import { Skeleton } from '@/components/ui/skeleton';
import { PoliticalCategory, Issue } from '@/types/issues';
import { politicalCategories } from '@/utils/mockIssues';
import {Separator} from '@/components/ui/separator';


type ApiPosition = {
    supports_positon: boolean;
    position_description: string;
    issue_name: string;
    issue_description: string;
    category_id: string;
    sources: {
        tweet?: string;
        url?: string;
        date?: string;
    }[];
};
  
const CandidatePage = () => {
    const { id } = useParams() as { id?: string };
    const [candidate, setCandidate] = useState<ApiCandidate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id ) return;

        const fetchCandidate = async () => {
            try {
                const response = await fetch(`/api/candidates/${id}`);
                if (!response.ok) throw new Error('Failed to fetch');

                const data = await response.json();
                setCandidate(data);
            } catch (error) {
                console.error("Error fetching candidate:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-row flex-start justify-center p-10 bg-white m-auto max-w-4/5 overflow-hidden gap-12">
              <div className="flex flex-col">
                {/* image skeleton */}
                <Skeleton className="h-[500px] w-[400px] object-cover rounded-none mr-12" />

                { /* social media links */ }
                <div className="flex justify-center space-x-4 mt-4">
                  <Skeleton className="h-[40px] w-[40px] rounded-full" />
                  <Skeleton className="h-[40px] w-[40px] rounded-full" />
                </div>

              </div>

              {/* details skeleton */}
              <div className="flex flex-col max-w-[600px] space-y-6">
                <div className= "flex flex-col items-center space-y-4">
                  <Skeleton className="h-[50px] w-[400px]" /> {/* name */}
                  <Skeleton className="h-[30px] w-[300px]" /> {/* position */}
                </div>

                {/* description lines */}
                <Skeleton className="h-[20px] w-[600px]" />
                <Skeleton className="h-[20px] w-[600px]" />
                <Skeleton className="h-[20px] w-[400px]" />

                <br></br>
                <Skeleton className="h-[20px] w-[500px]" />

                {/* separator */}
                <Skeleton className="h-[4px]" /> 

                <Skeleton className="h-[30px] w-[200px]" /> 
                <Skeleton className="h-[20px] w-[300px]" />              
              </div>
            </div>
        );
    }

    if (!candidate) {
        return <p>Candidate not found.</p>
    }

    return (
        <>
          <CandidateCard candidate={candidate} />
          <Separator className="my-4 w-4/5 mx-auto" />
          <CandidatePositions 
            categories={politicalCategories} 
            candidate={candidate}
          />
        </>
    )
}

export default CandidatePage;