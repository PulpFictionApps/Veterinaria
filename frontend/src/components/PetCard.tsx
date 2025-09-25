interface PetCardProps {
  name: string;
  type: string;
  id?: number;
}

export default function PetCard({ name, type, id }: PetCardProps) {
  return (
    <article role="article" className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">🐶</div>
        <div className="min-w-0">
          <h3 className="font-bold truncate">{name}</h3>
          <p className="text-sm truncate text-gray-600">{type}</p>
        </div>
        <div className="ml-auto">
          {/** If an id is provided, show edit link to pet edit page under tutors/**/}
          {typeof id !== 'undefined' && (
            <a
              href={`/dashboard/pets/${id}/edit`}
              className="text-sm text-pink-600 hover:underline ml-4 transition-colors"
            >
              Editar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
