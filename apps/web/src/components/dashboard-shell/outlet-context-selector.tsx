'use client';

import * as React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { MOCK_OUTLETS, type MockOutlet } from '../../lib/mock-data';

/**
 * Properti untuk pemilih konteks gerai cabang HoReKa.
 */
export interface OutletContextSelectorProps {
  /** ID gerai yang sedang aktif terpilih */
  readonly activeOutletId: string;
  /** Callback saat pengguna memilih gerai baru */
  readonly onSelectOutlet?: (outletId: string) => void;
  /** Daftar gerai terdaftar (opsional, bawaan MOCK_OUTLETS) */
  readonly outlets?: readonly MockOutlet[];
}

/**
 * Komponen modular pemilih gerai operasional untuk dasbor HoReKa.
 * Mematuhi target sentuh min-h-[44px] dan rasio kontras WCAG 2.1 AA.
 */
export function OutletContextSelector({
  activeOutletId,
  onSelectOutlet,
  outlets = MOCK_OUTLETS,
}: OutletContextSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeOutlet = outlets.find((o) => o.id === activeOutletId) || outlets[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label
        htmlFor="outlet-selector-btn"
        className="block text-[11px] font-semibold text-gelap/85 uppercase tracking-wider px-1"
      >
        Gerai Operasional:
      </label>
      <button
        id="outlet-selector-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-netral-border text-left hover:border-primer transition-colors shadow-2xs min-h-[44px]"
      >
        <div className="min-w-0 pr-2">
          <div className="text-xs font-bold text-gelap truncate flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-primer flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{activeOutlet?.name}</span>
          </div>
          <div className="text-[10px] text-gelap/85 truncate pl-5">
            {activeOutlet?.regency.replace('_', ' ')}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gelap/60 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Daftar gerai cabang"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-netral-border rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto custom-scrollbar"
        >
          {outlets.map((outlet) => {
            const isSelected = outlet.id === activeOutletId;
            return (
              <button
                key={outlet.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectOutlet?.(outlet.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-xs flex flex-col hover:bg-netral-canvas min-h-[44px] justify-center transition-colors ${
                  isSelected ? 'bg-primer-light/40 font-bold text-primer' : 'text-gelap'
                }`}
              >
                <span className="truncate">{outlet.name}</span>
                <span className="text-[10px] text-gelap/85 flex items-center gap-1">
                  <span>{outlet.isMain ? 'Pusat' : 'Cabang'}</span>
                  <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
                  <span>{outlet.regency.replace('_', ' ')}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
