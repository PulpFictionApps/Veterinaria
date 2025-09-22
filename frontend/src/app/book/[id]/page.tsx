"use client";

import PublicBookingForm from '../../../components/PublicBookingForm';

export default function PublicBookingPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  return (
    <div className="bg-gray-100 p-6 min-h-0">
      <div className="max-w-xl sm:max-w-3xl mx-auto bg-white rounded-lg p-4 shadow min-h-0">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">
          Reservar con profesional #{id}
        </h1>
        <PublicBookingForm professionalId={id} />
      </div>
    </div>
  );
}
