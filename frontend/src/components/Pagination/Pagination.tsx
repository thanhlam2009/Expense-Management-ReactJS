// Pagination Component - Copy từ macros.html render_pagination
import { Link, useSearchParams } from 'react-router-dom';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  hasNext, 
  hasPrev,
  onPageChange 
}: PaginationProps) {
  const [searchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages: (number | null)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(null); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(null);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(null);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(null);
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        {/* Previous button */}
        {hasPrev && (
          <li className="page-item">
            <Link 
              className="page-link" 
              to={buildPageUrl(currentPage - 1)}
              onClick={() => handlePageClick(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </Link>
          </li>
        )}

        {/* Page numbers */}
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === null) {
            // Ellipsis
            return (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">…</span>
              </li>
            );
          } else if (pageNum === currentPage) {
            // Current page
            return (
              <li key={pageNum} className="page-item active">
                <span className="page-link">{pageNum}</span>
              </li>
            );
          } else {
            // Other pages
            return (
              <li key={pageNum} className="page-item">
                <Link 
                  className="page-link" 
                  to={buildPageUrl(pageNum)}
                  onClick={() => handlePageClick(pageNum)}
                >
                  {pageNum}
                </Link>
              </li>
            );
          }
        })}

        {/* Next button */}
        {hasNext && (
          <li className="page-item">
            <Link 
              className="page-link" 
              to={buildPageUrl(currentPage + 1)}
              onClick={() => handlePageClick(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
