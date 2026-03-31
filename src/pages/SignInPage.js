import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { signIn } from '../api/v1/auth';
import { getApiErrorMessage } from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const SignInPage = () => {
  const navigate = useNavigate();
  const { signInSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn({ email, password });
      signInSession(result.user, result.tokens);
      navigate('/passbook');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-block auth-page auth-page--signin page-shell'>
      <Card className='auth-card auth-card--modern auth-shell-card'>
        <h1 className='auth-modern__title'>Sign in</h1>
        <p className='auth-modern__lede'>
          Sync visits and stamps across devices. No clutter—just your account.
        </p>

        <form className='auth-form auth-form--modern' onSubmit={onSubmit}>
          <label>
            <span>Email</span>
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signin-error' : undefined}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signin-error' : undefined}
              required
            />
          </label>

          {error ? (
            <p id='signin-error' className='error-copy' role='alert'>
              {error}
            </p>
          ) : null}

          <Button type='submit' disabled={loading}>
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>

        <p className='auth-modern__switch'>
          New here? <Link to='/signup'>Create an account</Link>
        </p>

        <ul className='auth-modern__micro'>
          <li>Passbook stamps & visit log</li>
          <li>Notes and dates per park</li>
        </ul>
      </Card>
    </section>
  );
};

export default SignInPage;
