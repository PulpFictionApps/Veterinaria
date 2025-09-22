"use client";

export default function PrimaryButton({ children, onClick, type = 'button' }: { children: React.ReactNode, onClick?: () => void, type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} className="bg-greenbrand-500 hover:bg-greenbrand-600 text-white px-4 py-2 rounded shadow">
      {children}
    </button>
  );
}
