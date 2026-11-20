import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FAST_MORPH_SPRING } from '../../utils/motion';

const PAGES = [
  { id: 'top', num: 'I–III', label: 'Khởi nguyên' },
  { id: 'bo-suu-tap', num: 'IV', label: 'Bộ sưu tập' },
  { id: 'triet-ly-rang', num: 'V', label: 'Nghệ thuật rang' },
  { id: 'cua-hang', num: 'VI', label: 'Cửa hàng' },
  { id: 'don-hang', num: 'VII', label: 'Đơn hàng' },
];

export function PageRail() {
  const [activeId, setActiveId] = useState('top');

  useEffect(() => {
    const elements = PAGES.map((p) => document.getElementById(p.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { threshold: [0.15, 0.35, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Mục lục trang"
      className="hidden 2xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-2"
    >
      {PAGES.map((page) => {
        const active = activeId === page.id;
        return (
          <a
            key={page.id}
            href={`#${page.id}`}
            aria-label={`Đi tới trang ${page.num}: ${page.label}`}
            className={`group relative flex items-center gap-2.5 py-1.5 pr-3 text-[11px] font-mono transition-colors ${
              active ? 'text-[#191715] font-medium' : 'text-[#5C574F] hover:text-[#191715]'
            }`}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-sans bg-[#FFFFFF] border border-[#DDD8CE] px-2 py-0.5">
              {page.label}
            </span>
            <span>{page.num}</span>
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#DDD8CE]"
            />
            {active && (
              <motion.span
                layoutId="page-rail-active-tick"
                transition={FAST_MORPH_SPRING}
                aria-hidden="true"
                className="absolute right-0 top-0 bottom-0 w-[2.5px] bg-[#1F3A2E]"
              />
            )}
          </a>
        );
      })}
    </nav>
  );
}
