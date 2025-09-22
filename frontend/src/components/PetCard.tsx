interface PetCardProps {
  name: string;
  type: string;
}

export default function PetCard({ name, type }: PetCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
      <h3 className="font-bold">{name}</h3>
      <p className="text-sm">{type}</p>
    </div>
  );
}
