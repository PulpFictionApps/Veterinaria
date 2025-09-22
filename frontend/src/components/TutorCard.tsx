interface TutorCardProps {
  name: string;
  email?: string;
  phone?: string;
}

export default function TutorCard({ name, email, phone }: TutorCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold">{name}</h3>
      {email && <p className="text-sm">{email}</p>}
      {phone && <p className="text-sm">{phone}</p>}
    </div>
  );
}
