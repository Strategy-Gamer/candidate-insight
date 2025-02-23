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
            <div className="flex items-start p-6 mx-auto max-w-4xl rounded-lg shadow">
                {/* Image Skeleton */}
                <Skeleton className="h-48 w-48 rounded-full mr-8" />

                {/* Details Skeleton */}
                <div className="flex flex-col space-y-4">
                    {/* Name */}
                    <Skeleton className="h-10 w-60" />

                    {/* Position */}
                    <Skeleton className="h-8 w-40" />

                    {/* Description lines */}
                    <Skeleton className="h-6 w-80" />
                    <Skeleton className="h-6 w-80" />
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