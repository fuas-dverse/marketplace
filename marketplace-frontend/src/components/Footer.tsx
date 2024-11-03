export default function Footer() {
  return (
    <footer className="bg-purple-950 text-white py-6 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Left Section - Logo and Copyright */}
        <div>
          <h2 className="text-xl font-bold">Marketplace</h2>
          <p className="text-sm mt-1">
            &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
        </div>

        {/* Center Section - Navigation Links */}
        <nav className="flex space-x-4 text-sm">
          <a href="/about" className="hover:underline">
            About Us
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
          <a href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
        </nav>

        {/* Right Section - Social Media Icons */}
        <div className="flex space-x-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <svg
              className="w-5 h-5 fill-current hover:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M24 4.56a9.93 9.93 0 01-2.86.78 5.1 5.1 0 002.17-2.82 9.9 9.9 0 01-3.13 1.23 4.96 4.96 0 00-8.41 4.52A14 14 0 011.67 3.16 4.88 4.88 0 003.2 9.74a5 5 0 01-2.24-.63v.06a4.96 4.96 0 004 4.86 5 5 0 01-2.22.08 4.98 4.98 0 004.64 3.5A9.9 9.9 0 010 19.54a14 14 0 007.56 2.22c9.05 0 14-7.5 14-14v-.64A10.18 10.18 0 0024 4.56z" />
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg
              className="w-5 h-5 fill-current hover:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M22 12a10 10 0 10-11.6 9.95V14.9H8.48v-2.9h1.91V9.92c0-1.88 1.1-2.92 2.79-2.92.8 0 1.63.14 1.63.14v1.8h-.92c-.91 0-1.2.56-1.2 1.14v1.39h2.14l-.34 2.9h-1.8v7.05A10 10 0 0022 12z" />
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg
              className="w-5 h-5 fill-current hover:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M7.5 2h9a5.5 5.5 0 015.5 5.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm4.5 5.5A4.5 4.5 0 107 12a4.5 4.5 0 005-4.5zm6-1.2a1.2 1.2 0 10-2.4 0 1.2 1.2 0 002.4 0zm-1.7 7.4A6.2 6.2 0 1112 6.8a6.2 6.2 0 015.8 5.9z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
