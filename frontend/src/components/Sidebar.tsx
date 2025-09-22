import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
      <ul className="space-y-3">
        <li>
          <Link href="/" className="block p-2 rounded hover:bg-blue-100">Dashboard</Link>
        </li>
        <li>
          <Link href="/tutors" className="block p-2 rounded hover:bg-blue-100">Tutores</Link>
        </li>
      </ul>
    </aside>
  );
}
