"use client";

import AvailabilityManager from '../../../components/AvailabilityManager';

export default function AvailabilityPage(){
  return (
    <div className="max-w-full mx-auto px-4 py-4">
      <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <AvailabilityManager />
      </div>
    </div>
  );
}
