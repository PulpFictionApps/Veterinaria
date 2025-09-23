export default function Footer() {
  return (
    <footer className="w-full py-4 bg-transparent" aria-label="site-footer">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-700">© {new Date().getFullYear()} Vet Scheduler</div>
    </footer>
  );
}
