import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../state/AuthContext';

const primaryNav = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/parks', label: 'Parks' },
  { to: '/nearby', label: 'Nearby' },
];

const ShellLayout = () => {
  const navigate = useNavigate();
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
        <div className='site-header__row'>
          <Link to='/' className='site-header__brand'>
            <span className='site-header__logo'>TB</span>
            <span className='site-header__title'>Trail Buddy</span>
          </Link>

          <form
            className='site-global-search'
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const query = String(formData.get('q') || '').trim();
              const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
              navigate(`/search${suffix}`);
            }}
          >
            <input
              type='search'
              name='q'
              placeholder='Search trails, parks, or locations'
              aria-label='Search trails, parks, or locations'
            />
            <Button type='submit' className='site-global-search__button'>
              Search
            </Button>
          </form>

          <nav
            className='site-header__nav site-header__nav--account'
            aria-label='Account'
          >
            {isAuthenticated ? (
              <span className='site-user-pill'>
                {user?.displayName || 'Explorer'}
              </span>
            ) : null}
            {accountNav.map((item) => (
              <Link
                key={item.to}
                className='site-nav-link site-nav-link--subtle'
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                variant='ghost'
                className='site-signout-btn'
                onClick={signOutSession}
              >
                Sign Out
              </Button>
            ) : null}
          </nav>
        </div>

        <nav
          className='site-header__nav site-header__nav--primary'
          aria-label='Primary'
        >
          {primaryNav.map((item) => (
            <Link key={item.to} className='site-nav-link' to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className='site-main'>
        <Outlet />
      </main>

      <footer className='site-footer'>
        <div>
          <p className='site-footer__headline'>Discover. Hike. Repeat.</p>
          <p className='site-footer__text'>
            Trail Buddy helps you find hikes across National and State Parks
            with map-first exploration and simple trip planning.
          </p>
        </div>
        <div className='site-footer__links'>
          <Link to='/about'>About</Link>
          <Link to='/help'>Help</Link>
          <Link to='/press'>Press</Link>
          <Link to='/pricing'>Pricing</Link>
          <Link to='/settings'>Settings</Link>
        </div>
      </footer>
    </div>
  );
};

export default ShellLayout;
