import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PagesProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
}

const Pages = ({ page, limit, total, onPageChange }: PagesProps) => {
    const totalPages = Math.ceil(total / limit);
    const ellpsisPos = page >= totalPages - 1 ? true : false;
  
    return (
      <Pagination>
        <PaginationContent>
          {page !== 1 && (
            <>
              <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                className="cursor-pointer"
              />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => onPageChange(1)}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {ellpsisPos && page != 1 && <PaginationItem><PaginationEllipsis/></PaginationItem>}

          <PaginationItem className="bg-gray-100">
            <PaginationLink
              onClick={() => onPageChange(page)}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>

          {!ellpsisPos && <PaginationItem><PaginationEllipsis/></PaginationItem>}
  
          {page != totalPages && (
            <>
              <PaginationItem>
                <PaginationLink
                  onClick={() => onPageChange(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
        
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                  className="cursor-pointer"
                />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    );
}

export default Pages;