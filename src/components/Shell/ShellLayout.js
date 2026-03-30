import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../state/AuthContext';

const primaryNav = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/passbook', label: 'Passbook' },
];

const ShellLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOutSession, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const profileMenuRef = useRef(null);
  const profileToggleRef = useRef(null);

  const mobileDrawerNav = useMemo(
    () => [...primaryNav, { to: '/profile', label: 'Profile' }],
    [],
  );

  const profileMenuItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        { to: '/profile', label: 'My Profile' },
        { to: '/passbook', label: 'Passbook' },
      ];
    }

    return [
      { to: '/signin', label: 'Login' },
      { to: '/signup', label: 'Sign Up' },
    ];
  }, [isAuthenticated]);

  const isRouteActive = (to) => {
    if (to === '/') {
      return location.pathname === '/';
    }

    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const onWindowMouseDown = (event) => {
      const target = event.target;
      if (
        profileMenuRef.current?.contains(target) ||
        profileToggleRef.current?.contains(target)
      ) {
        return;
      }

      setIsProfileMenuOpen(false);
    };

    const onWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        profileToggleRef.current?.focus();
      }
    };

    window.addEventListener('mousedown', onWindowMouseDown);
    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('mousedown', onWindowMouseDown);
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const onWindowMouseDown = (event) => {
      const target = event.target;
      if (
        mobileMenuRef.current?.contains(target) ||
        mobileToggleRef.current?.contains(target)
      ) {
        return;
      }

      setIsMobileMenuOpen(false);
    };

    const onWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileToggleRef.current?.focus();
      }
    };

    window.addEventListener('mousedown', onWindowMouseDown);
    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('mousedown', onWindowMouseDown);
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 860) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('q') || '').trim();
    const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
    navigate(`/search${suffix}`);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const onToggleProfileMenu = () => {
    setIsProfileMenuOpen((current) => !current);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className='app-shell'>
      <header className='site-header'>
        <div className='site-header__row'>
          <button
            ref={mobileToggleRef}
            type='button'
            className='site-mobile-menu-toggle'
            aria-label='Open navigation menu'
            aria-expanded={isMobileMenuOpen}
            aria-controls='mobile-navigation-menu'
            onClick={() => {
              setIsMobileMenuOpen((current) => !current);
              setIsProfileMenuOpen(false);
            }}
          >
            <span className='site-mobile-menu-toggle__icon' aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className='sr-only'>Open menu</span>
          </button>

          <Link to='/' className='site-header__brand'>
            <span className='site-header__logo'>NP</span>
            <span>
              <span className='site-header__title'>
                National Parks Explorer
              </span>
              <span className='site-header__subtitle'>
                Parks passbook and travel companion
              </span>
            </span>
          </Link>

          <nav
            className='site-header__nav site-header__nav--primary'
            aria-label='Primary'
          >
            {primaryNav.map((item) => (
              <Link
                key={item.to}
                className={`site-nav-link ${isRouteActive(item.to) ? 'site-nav-link--active' : ''}`.trim()}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form className='site-global-search' onSubmit={onSearchSubmit}>
            <input
              type='search'
              name='q'
              placeholder='Search parks by name, state, city, or ZIP'
              aria-label='Search parks by name, state, city, or ZIP'
            />
            <Button type='submit' className='site-global-search__button'>
              Search
            </Button>
          </form>

          <nav
            className='site-header__nav site-header__nav--account'
            aria-label='Account'
          >
            <button
              ref={profileToggleRef}
              type='button'
              className='site-profile-toggle'
              aria-haspopup='menu'
              aria-expanded={isProfileMenuOpen}
              aria-controls='site-profile-menu'
              onClick={onToggleProfileMenu}
            >
              <span className='site-profile-toggle__avatar' aria-hidden>
                {(user?.displayName || 'P').slice(0, 1).toUpperCase()}
              </span>
              <span className='site-profile-toggle__label'>Account</span>
            </button>

            {isProfileMenuOpen ? (
              <div
                id='site-profile-menu'
                className='site-profile-menu'
                role='menu'
                aria-label='Profile menu'
                ref={profileMenuRef}
              >
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    className='site-profile-menu__link'
                    to={item.to}
                    role='menuitem'
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <button
                    type='button'
                    className='site-profile-menu__link site-profile-menu__link--danger'
                    role='menuitem'
                    onClick={() => {
                      signOutSession();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            ) : null}
          </nav>
        </div>

        {isMobileMenuOpen ? (
          <>
            <button
              type='button'
              className='site-mobile-drawer-backdrop'
              aria-label='Close navigation drawer'
              onClick={closeMobileMenu}
            />
            <aside
              id='mobile-navigation-menu'
              className='site-mobile-drawer'
              role='menu'
              aria-label='Mobile navigation menu'
              ref={mobileMenuRef}
            >
              <div className='site-mobile-drawer__head'>
                <h2 className='site-mobile-drawer__title'>Navigate</h2>
                <button
                  type='button'
                  className='site-mobile-drawer__close'
                  onClick={closeMobileMenu}
                >
                  Close
                </button>
              </div>

              <form className='site-mobile-search' onSubmit={onSearchSubmit}>
                <input
                  type='search'
                  name='q'
                  placeholder='Search parks'
                  aria-label='Search parks'
                />
                <Button type='submit' className='site-global-search__button'>
                  Go
                </Button>
              </form>

              <div className='site-mobile-drawer__group'>
                <p className='site-mobile-drawer__group-label'>Main</p>
                {mobileDrawerNav.map((item) => (
                  <Link
                    key={item.to}
                    className={`site-mobile-drawer__link ${isRouteActive(item.to) ? 'site-mobile-drawer__link--active' : ''}`.trim()}
                    to={item.to}
                    role='menuitem'
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </aside>
          </>
        ) : null}
      </header>

      <main className='site-main'>
        <Outlet />
      </main>
    </div>
  );
};

export default ShellLayout;
