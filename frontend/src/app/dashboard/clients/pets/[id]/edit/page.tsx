"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "../../../../../../lib/api";

export default function EditPetPage() {
  const params = useParams();
  const petId = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "", breed: "", age: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`/pets/${petId}`);
        if (!res.ok) throw new Error(`Failed to load pet ${res.status}`);
        const data = await res.json();
        setPet(data);
        setForm({ name: data.name || "", type: data.type || "", breed: data.breed || "", age: data.age?.toString() || "" });
      } catch (err: any) {
        setError(err.message || "Error loading pet");
      } finally {
        setLoading(false);
      }
    }
    if (!petId) {
      setError('Pet id missing');
      setLoading(false);
      return;
    }
    load();
  }, [petId]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError(null);
    try {
      const res = await authFetch(`/pets/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, type: form.type, breed: form.breed, age: Number(form.age) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || `Server error ${res.status}`);
      }
      // Redirect back to tutor detail or pets list
      router.push('/dashboard/clients');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
  }

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!pet) return <p>No encontrado</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Editar mascota</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input className="mt-1 block w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <input className="mt-1 block w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Raza</label>
          <input className="mt-1 block w-full" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Edad</label>
          <input className="mt-1 block w-full" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="px-4 py-2" onClick={() => router.push('/dashboard/clients')}>Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
        </div>
      </form>
    </div>
  );
}
