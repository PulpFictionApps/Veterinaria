export default function Footer() {
  return (
    <footer className="w-full py-4 bg-transparent hidden sm:block">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-700">© {new Date().getFullYear()} VetScheduler</div>
    </footer>
  );
}
