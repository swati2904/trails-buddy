import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../state/AuthContext';

const primaryNav = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/search', label: 'Search' },
  { to: '/nearby', label: 'Nearby' },
  { to: '/pricing', label: 'Pricing' },
];

const ShellLayout = () => {
  const { isAuthenticated, signOutSession, user } = useAuth();

  const accountNav = isAuthenticated
    ? [
        { to: '/my-favorites', label: 'Favorites' },
        { to: '/my-lists', label: 'Lists' },
        { to: '/profile', label: 'Profile' },
      ]
    : [
        { to: '/signin', label: 'Sign In' },
        { to: '/signup', label: 'Sign Up' },
      ];

  return (
    <div className='app-shell'>
      <header className='site-header'>
        <div className='site-header__brand'>
          <span className='site-header__logo'>TB</span>
          <span className='site-header__title'>Trails Buddy</span>
        </div>

        <nav className='site-header__nav' aria-label='Primary'>
          {primaryNav.map((item) => (
            <Link key={item.to} className='site-nav-link' to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className='site-header__nav site-header__nav--account' aria-label='Account'>
          {isAuthenticated ? (
            <span className='site-user-pill'>{user?.displayName || 'Account'}</span>
          ) : null}
          {accountNav.map((item) => (
            <Link key={item.to} className='site-nav-link site-nav-link--subtle' to={item.to}>
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant='ghost' className='site-signout-btn' onClick={signOutSession}>
              Sign Out
            </Button>
          ) : null}
        </nav>
      </header>

      <main className='site-main'>
        <Outlet />
      </main>

      <footer className='site-footer'>
        <div>
          <p className='site-footer__headline'>Trails Buddy Platform Rebuild</p>
          <p className='site-footer__text'>
            Frontend scaffold in place. Next phases wire live map, search, and account features.
          </p>
        </div>
        <div className='site-footer__links'>
          <Link to='/about'>About</Link>
          <Link to='/help'>Help</Link>
          <Link to='/press'>Press</Link>
          <Link to='/settings'>Settings</Link>
        </div>
      </footer>
    </div>
  );
};

export default ShellLayout;
