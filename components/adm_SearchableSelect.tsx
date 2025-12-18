"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ChevronDown, X } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  options: Array<{ id: string; name: string }>;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Qidirish...",
  required = false,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(term) ||
        opt.id.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={containerRef}>
      <Label htmlFor={label}>{label}</Label>
      <div className="mt-2 relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus-within:ring-2 focus-within:ring-primary-200 cursor-pointer flex items-center justify-between"
        >
          <span className={selectedOption ? "text-light-100" : "text-light-400"}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-light-400 hover:text-light-100"
              >
                <X className="size-4" />
              </button>
            )}
            <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-dark-200 border border-input rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="p-2 sticky top-0 bg-dark-200 border-b border-input">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="bg-dark-300 text-light-100 border-input"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-light-400 text-sm text-center">
                  Natija topilmadi
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-dark-300 transition-colors ${
                      value === option.id ? "bg-primary-200/20 text-primary-100" : "text-light-100"
                    }`}
                  >
                    {option.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {required && !value && (
        <p className="mt-1 text-sm text-red-400">Bu maydon majburiy</p>
      )}
    </div>
  );
}

