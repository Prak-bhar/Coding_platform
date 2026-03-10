import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);

  return (
    // Updated header:
    // - bg-white (var(--surface)) to contrast with the light blue body
    // - border-b uses var(--border) from our theme
    // - shadow-sm adds subtle depth
    // - sticky top-0 z-50 makes it stay at the top
    <header
      className="bg-white border-b shadow-sm sticky top-0 z-50"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* This .accent class will use the theme's teal color */}
        <Link to="/" className="text-xl font-semibold accent">
          CodeArena
        </Link>

        <nav className="flex items-center gap-4">
          {user && (user.role === 'admin' || user.role === 'faculty') ? (
            <>
              {/* These links will use the theme's 'muted' (bright blue) 
                  and 'accent' (teal on hover) colors */}
              <Link to="/problems" className="muted hover:accent font-medium">
                Problems
              </Link>
              <Link to="/contests" className="muted hover:accent font-medium">
                Contests
              </Link>
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin/analytics'
                    : '/faculty/analytics'
                }
                className="muted hover:accent font-medium"
              >
                Analytics
              </Link>
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin/create-contest'
                    : '/faculty/create-contest'
                }
                className="muted hover:accent font-medium"
              >
                Create Contest
              </Link>
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin/my-contests'
                    : '/faculty/my-contests'
                }
                className="muted hover:accent font-medium"
              >
                My Contests
              </Link>
              <div className="flex items-center gap-3">
                {/* This .badge will use the light blue bg and bright blue text */}
                <span className="badge">{user.name}</span>
                {/* This .btn-ghost will be white with a light blue border */}
                <button onClick={logout} className="btn btn-ghost">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/problems" className="muted hover:accent font-medium">
                Problems
              </Link>
              <Link to="/contests" className="muted hover:accent font-medium">
                Contests
              </Link>

              {user && (
                <Link
                  to="/submissions"
                  className="muted hover:accent font-medium"
                >
                  My Submissions
                </Link>
              )}
              {user && (
                <Link to="/profile" className="muted hover:accent font-medium">
                  Profile
                </Link>
              )}

              {!user && (
                <Link to="/login" className="muted hover:accent font-medium">
                  Login
                </Link>
              )}
              {!user && (
                <Link to="/register" className="muted hover:accent font-medium">
                  Register
                </Link>
              )}

              {user && (
                <div className="flex items-center gap-3">
                  <span className="badge">{user.name}</span>
                  <button onClick={logout} className="btn btn-ghost">
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}