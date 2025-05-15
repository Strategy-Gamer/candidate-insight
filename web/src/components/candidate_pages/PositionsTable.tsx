"use client"

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    TableHeader,
} from "@/components/ui/table";
import { 
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons"
import Link from 'next/link';
import { XOutlined } from '@ant-design/icons';
import { Button } from '../ui/button';
import TweetModal from './TweetModal';
import { ApiCandidate } from '@/types/candidate';

interface Props {
    category: string;
    candidate: ApiCandidate;
}

type ApiPosition = {
    issue_name: string;
    supports_position: boolean;
    position_description: string;
    sources: {
        tweet?: string;
        url?: string;
        date?: string;
        source_type?: string;
        scraped_on?: string;
    }[];
}

const PositionsTable = ({ category, candidate}: Props) => {
    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState<ApiPosition []>([]);
    const [selectedTweets, setSelectedTweets] = useState([]);
    const [tweetsOpen, setTweetsOpen] = useState(false);
    
    // we need to fetch all available positions and sources for the candidate
    // on the category
    useEffect(() => {
        if (!candidate ) return;

        const fetchPositions = async () => {
            try {
                const response = await fetch(`/api/candidates/${candidate.candidate_id}/categories/${category}`);
                if (!response.ok) throw new Error('Failed to fetch');

                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error("Error fetching candidate positions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, [candidate, category]);

    if (loading) {
        return (
            <p>Loading stances...</p>
        )
    }

    const handleTweetClick = (tweets) => {
        setSelectedTweets(tweets);
        setTweetsOpen(true);
    }

    return <>
        <Table className="font-sans">
            <TableHeader>
                <TableRow>
                    <TableHead className="font-medium w-[120px]">Issue</TableHead>
                    <TableHead>Supports/Opposes</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Source(s)</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
            {tableData.map((position) => (
                <TableRow key={position.issue_name}>
                    <TableCell className="font-medium font-bold">
                        {position.issue_name}    
                    </TableCell>
                    <TableCell className="font-medium">
                        {position.supports_position ? (
                            <span className="inline-flex items-center">
                                <CheckOutlined className="text-[#008000]" /> 
                                <span className="ml-1">Supports</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center">
                                <CloseOutlined className="text-[#D2042D]" />
                                <span className="ml-1">Opposes</span>
                            </span>
                        )}
                    </TableCell>
                    <TableCell>
                        <p>{position.position_description}</p>
                    </TableCell>
                    <TableCell className="text-right">
                        <ul className="space-y-1">
                            {position.sources.filter(source => source.tweet == null).map((source, index) => (
                                <li key={`${index}-${source.date}`} className="text-sm">
                                    {source.url ? (
                                        <Link
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {source.source_type != "Other" ? source.source_type : "Source"}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-500">[No URL provided]</span>
                                    )}
                                </li>
                            ))}
                            {position.sources.some(source => source.tweet != null) &&
                                <li>
                                    <Button 
                                      onClick={() => handleTweetClick(position.sources.filter(source => source.tweet != null))}
                                      className='bg-clear text-blue-600 hover:bg-clear'
                                    >
                                        View Tweets
                                        <XOutlined/>
                                    </Button>
                                </li>
                            }
                        </ul>
                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        <TweetModal 
          tweets={selectedTweets} 
          firstName={candidate.first_name} 
          lastName={candidate.last_name} 
          username={candidate.twitter || "username"}
          open={tweetsOpen}
          setOpen={setTweetsOpen}
        />
    </>
}

export default PositionsTable;