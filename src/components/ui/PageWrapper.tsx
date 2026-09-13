import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MotionBox } from './MotionBox';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  usageId?: string;
  page?: string;
  variant?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = '',
  usageId = 'app-page',
  page = 'Application',
  variant = 'default',
}) => {
  const [headerHeight, setHeaderHeight] = React.useState(64);
  const [navbarHeight, setNavbarHeight] = React.useState(64);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [pathname]);

  useEffect(() => {
    const headerEl = document.querySelector('header') || document.querySelector('.header-wrapper');
    const navEl = document.querySelector('nav') || document.querySelector('.navbar-wrapper');

    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      setHeaderHeight(rect.height);
    }
    if (navEl) {
      const rect = navEl.getBoundingClientRect();
      setNavbarHeight(rect.height);
    }
  }, []);

  return (
    <MotionBox
      ref={scrollContainerRef}
      as="div"
      type="page"
      variant={variant}
      usageId={usageId}
      page={page}
      parentLevel={0}
      isChildren={false}
      className={`fixed left-0 right-0 overflow-y-auto bg-[var(--color-background)] ${className}`}
      style={{
        proprietes: {
          position: 'fixed',
          top: `${headerHeight}px`,
          left: 0,
          right: 0,
          height: `calc(100vh - ${headerHeight}px - ${navbarHeight}px)`,
          width: '100vw',
          overflowY: 'auto',
          backgroundColor: 'var(--color-background)',
          paddingBottom: '100px',
        } as any,
      }}
    >
      {children}
    </MotionBox>
  );
};

export default PageWrapper;
