import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Check, ChevronDown } from 'lucide-react';

interface DistrictFilterProps {
  selectedState: string;
  selectedDistrict: string;
  onFilterChange: (stateName: string, districtName: string) => void;
}

export const DistrictFilter: React.FC<DistrictFilterProps> = ({
  selectedState,
  selectedDistrict,
  onFilterChange
}) => {
  const [statesList, setStatesList] = useState<any[]>([
    {
      state_id: 'ALL',
      state_name: 'All States',
      districts: [{ district_id: 'ALL', district_name: 'All Districts' }]
    },
    {
      state_id: 'RJ',
      state_name: 'Rajasthan',
      districts: [
        { district_id: 'ALL', district_name: 'All Districts' },
        { district_id: 'RJ-14', district_name: 'Jaipur' },
        { district_id: 'RJ-19', district_name: 'Jodhpur' }
      ]
    },
    {
      state_id: 'DL',
      state_name: 'Delhi NCR',
      districts: [
        { district_id: 'ALL', district_name: 'All Districts' },
        { district_id: 'DL-01', district_name: 'Central Delhi' }
      ]
    },
    {
      state_id: 'MH',
      state_name: 'Maharashtra',
      districts: [
        { district_id: 'ALL', district_name: 'All Districts' },
        { district_id: 'MH-01', district_name: 'Mumbai City' }
      ]
    },
    {
      state_id: 'WB',
      state_name: 'West Bengal',
      districts: [
        { district_id: 'ALL', district_name: 'All Districts' },
        { district_id: 'WB-01', district_name: 'Kolkata' }
      ]
    }
  ]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const backendUrl = 'http://' + (window.location.hostname || 'localhost') + ':8000';
        const res = await fetch(`${backendUrl}/api/v1/districts`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStatesList([
              {
                state_id: 'ALL',
                state_name: 'All States',
                districts: [{ district_id: 'ALL', district_name: 'All Districts' }]
              },
              ...data
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching district master data:', err);
      }
    };
    fetchDistricts();
  }, []);

  const currentStateObj = statesList.find(s => s.state_name === selectedState) || statesList[0];
  const availableDistricts = currentStateObj.districts || [{ district_id: 'ALL', district_name: 'All Districts' }];

  return (
    <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-sans shadow-md">
      <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
        <MapPin className="w-3.5 h-3.5" />
        <span className="hidden sm:inline uppercase text-[10px] tracking-wider text-slate-400">Jurisdiction Scope:</span>
      </div>

      {/* State Dropdown */}
      <select
        value={selectedState}
        onChange={(e) => {
          const newState = e.target.value;
          onFilterChange(newState, 'All Districts');
        }}
        className="bg-slate-950 text-slate-100 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
      >
        {statesList.map((s) => (
          <option key={s.state_id} value={s.state_name}>
            {s.state_name}
          </option>
        ))}
      </select>

      <span className="text-slate-600">/</span>

      {/* District Dropdown */}
      <select
        value={selectedDistrict}
        onChange={(e) => onFilterChange(selectedState, e.target.value)}
        className="bg-slate-950 text-slate-100 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
      >
        {availableDistricts.map((d: any) => (
          <option key={d.district_id} value={d.district_name}>
            {d.district_name}
          </option>
        ))}
      </select>

      {(selectedState !== 'All States' || selectedDistrict !== 'All Districts') && (
        <button
          onClick={() => onFilterChange('All States', 'All Districts')}
          className="ml-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
          title="Reset to All Districts"
        >
          Reset
        </button>
      )}
    </div>
  );
};
