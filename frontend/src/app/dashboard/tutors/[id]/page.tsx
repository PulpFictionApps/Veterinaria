import PetCard from '../../../../components/PetCard';

const pets = [
  { id: 1, name: 'Firulais', type: 'Perro' },
  { id: 2, name: 'Michi', type: 'Gato' },
];

export default function TutorDetail({ params }: { params: { id: string } }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Carlos Pérez</h2>
      <p>Email: carlos@test.com</p>
      <p>Teléfono: 123456789</p>

      <h3 className="text-xl font-semibold mt-4 mb-2">Mascotas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pets.map(pet => (
          <PetCard key={pet.id} {...pet} />
        ))}
      </div>
    </div>
  );
}
