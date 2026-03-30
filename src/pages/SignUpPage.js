import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { signUp } from '../api/v1/auth';
import { getApiErrorMessage } from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signInSession } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUp({ displayName, email, password });
      signInSession(result.user, result.tokens);
      navigate('/passbook');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to create account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-block auth-page auth-page--signup'>
      <Card className='auth-card auth-card--split auth-shell-card'>
        <div className='auth-journey'>
          <h1 className='page-title'>Start your National Parks passbook</h1>
          <p className='page-subtitle'>
            Build your memory collection across all U.S. National Parks with
            digital stamps, travel notes, and visit tracking.
          </p>
          <ul className='auth-benefits'>
            <li>Save park visits and stamp entries</li>
            <li>Track progress across National Parks</li>
            <li>Keep a personal park passport for every trip</li>
          </ul>
          <p className='page-subtitle'>
            Already have an account? <Link to='/signin'>Sign in</Link>
          </p>
        </div>

        <form className='auth-form' onSubmit={onSubmit}>
          <label>
            <span>Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
              required
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
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
              aria-describedby={error ? 'signup-error' : undefined}
              required
            />
          </label>

          {error ? (
            <p id='signup-error' className='error-copy' role='alert'>
              {error}
            </p>
          ) : null}

          <Button type='submit' disabled={loading}>
            {loading ? 'Creating account...' : 'Create passbook account'}
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default SignUpPage;
