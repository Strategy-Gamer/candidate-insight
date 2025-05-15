import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col mt-2 items-start justify-evenly gap-6 p-2 md:flex-row">
            {/* Charts Column */}
            <div className="flex flex-col gap-6 w-full md:w-auto">
                {/* Democrat Chart */}
                <div className="border rounded-lg p-4 w-full md:w-[300px]">
                    <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                    <Skeleton className="mx-auto aspect-square max-h-[250px] rounded-full" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
                
                {/* Republican Chart */}
                <div className="border rounded-lg p-4 w-full md:w-[300px]">
                    <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                    <Skeleton className="mx-auto aspect-square max-h-[250px] rounded-full" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>

            {/* Positions Column */}
            <div className="w-full max-w-2xl space-y-6">
                {/* Header */}
                <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Skeleton className="h-10 flex-grow" />
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>

                {/* Position List*/}
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                            {/* Candidate and Position */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}