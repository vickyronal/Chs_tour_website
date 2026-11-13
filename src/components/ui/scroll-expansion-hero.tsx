/**
 * Scroll expansion hero, adapted for this Astro site from the supplied component.
 * Changes from the original:
 * - <img> instead of next/image (this site doesn't use Next.js)
 * - site fonts and colours; the title renders as the page's <h1>
 * - keyboard (arrows, Page Down, Space, Tab) and reduced-motion support,
 *   and a link to a later part of the page expands it straight away
 * - optional reveal: the frame starts invisible and fades in as it grows
 * - video loads only once scrolling starts, and has a pause button when expanded
 * - mediaType "custom" shows the `media` slot in the frame with the same reveal;
 *   it stays unclickable and out of the tab order until fully expanded
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image' | 'custom';
  /** Frame content when mediaType is "custom" (an Astro slot named "media"). */
  media?: ReactNode;
  mediaSrc?: string;
  mediaAlt?: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  /** Split point for the title; defaults to after the first word. */
  titleSplit?: [string, string];
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  /** Start with the frame invisible and fade it in as it expands. */
  revealOnScroll?: boolean;
  className?: string;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  media,
  mediaSrc,
  mediaAlt,
  posterSrc,
  bgImageSrc,
  title,
  titleSplit,
  date,
  scrollToExpand,
  textBlend,
  revealOnScroll = false,
  className,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoRequested, setVideoRequested] = useState<boolean>(false);
  const [videoPaused, setVideoPaused] = useState<boolean>(false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  // Fetch the video only once the visitor starts scrolling
  useEffect(() => {
    if (scrollProgress > 0) setVideoRequested(true);
  }, [scrollProgress]);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setVideoPaused(false);
    } else {
      video.pause();
      setVideoPaused(true);
    }
  };

  const expandFully = () => {
    setScrollProgress(1);
    setMediaFullyExpanded(true);
    setShowContent(true);
  };

  const applyProgress = (next: number) => {
    const newProgress = Math.min(Math.max(next, 0), 1);
    setScrollProgress(newProgress);
    if (newProgress >= 1) {
      setMediaFullyExpanded(true);
      setShowContent(true);
    } else if (newProgress < 0.75) {
      setShowContent(false);
    }
  };

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  // Reduced motion, or arriving at a link further down the page: start expanded
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(reduce);
    if (reduce) setVideoPaused(true); // show the still frame; the visitor can press play
    if (reduce || window.location.hash) expandFully();
  }, []);

  // After expanding for a link like /#destinations, go to that section: the
  // browser's own jump can be undone while the hero was still holding the page.
  const jumpedToHash = useRef(false);
  useEffect(() => {
    if (!mediaFullyExpanded || jumpedToHash.current || !window.location.hash) return;
    jumpedToHash.current = true;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }, [mediaFullyExpanded]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        applyProgress(scrollProgress + e.deltaY * 0.0009);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        // Higher sensitivity when scrolling back
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        applyProgress(scrollProgress + deltaY * scrollFactor);
        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    // Keyboard equivalents of the wheel, so the page isn't stuck for keyboard users
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const forward = ['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key);
      const back = ['ArrowUp', 'PageUp', 'Home'].includes(e.key);
      if (!mediaFullyExpanded && forward) {
        e.preventDefault();
        if (e.key === 'End') expandFully();
        else applyProgress(scrollProgress + 0.25);
      } else if (!mediaFullyExpanded && back) {
        e.preventDefault();
        applyProgress(scrollProgress - 0.25);
      } else if (mediaFullyExpanded && back && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
      }
    };

    // Tabbing to anything below the hero expands it, so focus is never hidden
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!mediaFullyExpanded && sectionRef.current && !sectionRef.current.contains(target) && target.closest('main, footer')) {
        expandFully();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('focusin', handleFocus);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('focusin', handleFocus);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);
  // Desktop: the two halves slide apart sideways (unchanged). Phones: they fade
  // out with a small upward drift instead, so nothing sweeps across the cards.
  const textMotion = (dir: -1 | 1): CSSProperties =>
    isMobileState
      ? { transform: `translateY(-${scrollProgress * 28}px)`, opacity: Math.max(0, 1 - scrollProgress * 1.8) }
      : { transform: `translateX(${dir < 0 ? '-' : ''}${textTranslateX}vw)` };
  // Fully visible by 60% of the way through, when revealing
  const mediaOpacity = revealOnScroll ? Math.min(1, scrollProgress / 0.6) : 1;

  const [firstPart, restOfTitle] = titleSplit ?? [
    title ? title.split(' ')[0] : '',
    title ? title.split(' ').slice(1).join(' ') : '',
  ];

  return (
    <div ref={sectionRef} className={cn('transition-colors duration-700 ease-in-out overflow-x-hidden', className)}>
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img
              src={bgImageSrc}
              alt=""
              width={1672}
              height={941}
              fetchPriority="high"
              className="w-full h-screen"
              style={{ objectFit: 'cover', objectPosition: '72% 30%' }}
            />
            {/* Tint keeps white text readable over the bright sunset */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          <div className="w-full flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              <h1
                // pointer-events-none: once the title has slid away, its empty box must not block the cards
                className={`flex items-center justify-center text-center gap-2 w-full relative z-10 transition-none flex-col pointer-events-none ${
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                }`}
              >
                <motion.span className="sx-title" style={textMotion(-1)}>
                  {firstPart}
                </motion.span>
                <motion.span className="sx-title sx-title--accent" style={textMotion(1)}>
                  {restOfTitle}
                </motion.span>
              </h1>
              <div
                className="absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-[28px]"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: 'min(85vh, calc(100dvh - 210px))', // clears the header
                  boxShadow: `0px 0px 50px rgba(0, 0, 0, ${0.3 * mediaOpacity})`,
                }}
              >
                {mediaType === 'video' ? (
                  <div className="relative w-full h-full pointer-events-none" style={{ opacity: mediaOpacity }} aria-hidden="true">
                    <video
                      ref={videoRef}
                      src={videoRequested || mediaFullyExpanded ? mediaSrc : undefined}
                      poster={posterSrc}
                      autoPlay={!reduceMotion}
                      muted
                      loop
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover rounded-[28px]"
                      controls={false}
                      disablePictureInPicture
                      disableRemotePlayback
                    />
                    <motion.div
                      className="absolute inset-0 bg-black/30 rounded-[28px]"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : mediaType === 'custom' ? (
                  <div
                    className="relative w-full h-full overflow-hidden rounded-[28px]"
                    style={{ opacity: mediaOpacity, pointerEvents: mediaFullyExpanded ? 'auto' : 'none' }}
                    inert={!mediaFullyExpanded}
                  >
                    {media}
                    {/* Same tint as before while the title crosses it; clear once expanded */}
                    <motion.div
                      className="absolute inset-0 bg-black/60 rounded-[28px] pointer-events-none"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0.9 * (1 - scrollProgress) }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full" style={{ opacity: mediaOpacity }}>
                    <img
                      src={mediaSrc}
                      alt={mediaAlt ?? ''}
                      width={1024}
                      height={1536}
                      className="w-full h-full object-cover rounded-[28px]"
                    />
                    {/* Darker while the title sits over the photo, lighter once it has moved aside */}
                    <motion.div
                      className="absolute inset-0 bg-black/60 rounded-[28px]"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0.9 - scrollProgress * 0.65 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {mediaType === 'video' && mediaFullyExpanded && (
                  <button
                    type="button"
                    className="sx-pause"
                    onClick={toggleVideo}
                    aria-label={videoPaused ? 'Play video' : 'Pause video'}
                  >
                    {videoPaused ? (
                      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M2 1.5v15L15 9z" fill="currentColor" /></svg>
                    ) : (
                      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M3 2h3.5v14H3zM9.5 2H13v14H9.5z" fill="currentColor" /></svg>
                    )}
                  </button>
                )}

                <div className="flex flex-col items-center text-center relative z-10 mt-4 transition-none">
                  {date && (
                    <p className="sx-date" style={textMotion(-1)}>
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p className="sx-hint" style={textMotion(1)} aria-hidden="true">
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <motion.section
              className="flex flex-col w-full px-8 py-10 md:px-16 lg:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
              aria-hidden={!showContent}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
