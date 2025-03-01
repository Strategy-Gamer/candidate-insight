"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Candidate } from '@/types/candidate';
import CandidateCard from '@/components/CandidateCard';
import { Skeleton } from '@/components/ui/skeleton';

const CandidatePage = () => {
    const { id } = useParams() as { id?: string };
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id ) return;

        const fetchCandidate = async () => {
            try {
                const response = await fetch(`/api/candidates/${id}`);
                const data = await response.json();

                if (data.success) {
                    setCandidate(data.candidate);
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error("Error fetching candidate:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCandidate();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-row p-10 mx-auto max-w-[80%] rounded-lg shadow gap-12">
                {/* image skeleton */}
                <Skeleton className="h-[500px] w-[400px] object-cover mr-12" />

                {/* details skeleton */}
                <div className="flex flex-col max-w-[600px] space-y-6">
                    <div className= "flex flex-col items-center space-y-4">
                        <Skeleton className="h-[50px] w-[400px]" /> {/* name */}
                        <Skeleton className="h-[30px] w-[300px]" /> {/* position */}
                    </div>

                    {/* description lines */}
                    <Skeleton className="h-[20px] w-[600px]" />
                    <Skeleton className="h-[20px] w-[600px]" />
                    <Skeleton className="h-[20px] w-[600px]" />

                    { /* social media links */ }
                    <div className="flex justify-center space-x-6 mt-6">
                        <Skeleton className="h-[40px] w-[40px] rounded-full" />
                        <Skeleton className="h-[40px] w-[40px] rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return <p>Candidate not found.</p>
    }

    return (
        <CandidateCard candidate={candidate} />
    );
};

export default CandidatePage;