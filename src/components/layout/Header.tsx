
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-medium">
          Project
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="text-sm hover:text-gray-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="#" className="text-sm hover:text-gray-600 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="#" className="text-sm hover:text-gray-600 transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
