import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { SearchBar } from '../features/SearchBar';
import { SubmitFeatureButton } from '../features/SubmitFeatureButton';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`;

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">FeatureVote</Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/features" className={navLinkClass}>Features</NavLink>
              <NavLink to="/roadmap" className={navLinkClass}>Roadmap</NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-64 hidden md:block">
              <SearchBar />
            </div>
            <SubmitFeatureButton size="sm" className="hidden sm:inline-flex" />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">Admin</Link>
                )}
                <span className="text-sm text-gray-700">Hi, {user?.name}</span>
                <Button variant="ghost" size="sm" onClick={() => logout()}>Logout</Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/register"><Button size="sm">Sign up</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
