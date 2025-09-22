interface PetCardProps {
  name: string;
  type: string;
}

export default function PetCard({ name, type }: PetCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow w-full">
      <h3 className="font-bold truncate">{name}</h3>
      <p className="text-sm truncate">{type}</p>
    </div>
  );
}
