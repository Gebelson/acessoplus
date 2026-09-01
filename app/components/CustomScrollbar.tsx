'use client';

import { useEffect, useRef, type PointerEvent } from 'react';

type ScrollMetrics = {
  maxScroll: number;
  trackHeight: number;
  thumbHeight: number;
};

export function CustomScrollbar() {
  const thumbRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const metricsRef = useRef<ScrollMetrics>({ maxScroll: 0, trackHeight: 0, thumbHeight: 0 });
  const dragRef = useRef({ active: false, startY: 0, startScroll: 0 });

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      const root = document.documentElement;
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (!track || !thumb) return;

      const trackHeight = track.clientHeight;
      const pageHeight = root.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(0, pageHeight - viewportHeight);
      const thumbHeight = maxScroll === 0 ? trackHeight : Math.max(42, trackHeight * (viewportHeight / pageHeight));
      const travel = Math.max(0, trackHeight - thumbHeight);
      const top = maxScroll === 0 ? 0 : (window.scrollY / maxScroll) * travel;

      metricsRef.current = { maxScroll, trackHeight, thumbHeight };
      track.dataset.visible = maxScroll > 1 ? 'true' : 'false';
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translate3d(0, ${top}px, 0)`;
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || metricsRef.current.maxScroll === 0) return;

    track.setPointerCapture(event.pointerId);
    if (event.target === thumbRef.current) {
      dragRef.current = { active: true, startY: event.clientY, startScroll: window.scrollY };
      track.dataset.dragging = 'true';
      return;
    }

    const bounds = track.getBoundingClientRect();
    const { trackHeight, thumbHeight, maxScroll } = metricsRef.current;
    const ratio = Math.min(1, Math.max(0, (event.clientY - bounds.top - thumbHeight / 2) / (trackHeight - thumbHeight)));
    window.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const { trackHeight, thumbHeight, maxScroll } = metricsRef.current;
    const travel = trackHeight - thumbHeight;
    if (travel <= 0) return;
    const nextScroll = dragRef.current.startScroll + ((event.clientY - dragRef.current.startY) / travel) * maxScroll;
    window.scrollTo({ top: Math.min(maxScroll, Math.max(0, nextScroll)) });
  };

  const stopDragging = () => {
    dragRef.current.active = false;
    if (trackRef.current) delete trackRef.current.dataset.dragging;
  };

  return (
    <div
      ref={trackRef}
      className="site-scrollbar"
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <span ref={thumbRef} className="site-scrollbar-thumb" />
    </div>
  );
}
