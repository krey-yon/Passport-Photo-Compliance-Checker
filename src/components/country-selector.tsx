"use client"

import { useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import type { Country } from "@/types"

interface CountrySelectorProps {
  onCountrySelect: (country: Country) => void
  selectedCountry: Country | null
}

const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
]

export default function CountrySelector({ onCountrySelect, selectedCountry }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        {selectedCountry ? (
          <div className="flex items-center">
            <span className="text-gray-500 text-2xl mr-3">{selectedCountry.flag}</span>
            <span className="font-medium text-gray-900">{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select a country...</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors"
              >
                <span className="text-gray-500 text-2xl mr-3">{country.flag}</span>
                <span className="font-medium text-gray-900">{country.name}</span>
              </button>
            ))}

            {filteredCountries.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">No countries found matching &quot;{searchTerm}&quot;</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
