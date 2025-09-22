import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaCog } from 'react-icons/fa';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-inner border-t border-gray-200 md:hidden z-20">
      <ul className="flex justify-around p-2">
        <li>
          <Link href="/">
            <div className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <FaCalendarAlt size={24} />
              <span className="text-xs">Citas</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/tutors">
            <div className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <FaUser size={24} />
              <span className="text-xs">Clientes</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/profile">
            <div className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <FaUser size={24} />
              <span className="text-xs">Perfil</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings">
            <div className="flex flex-col items-center text-gray-600 hover:text-blue-600">
              <FaCog size={24} />
              <span className="text-xs">Configuración</span>
            </div>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
