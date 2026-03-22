import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      navigate('/explore');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-block'>
      <Card className='auth-card'>
        <h1 className='page-title'>Welcome back, explorer</h1>
        <p className='page-subtitle'>
          Sign in to continue building lists, saving routes, and tracking your
          next adventure.
        </p>

        <form className='auth-form' onSubmit={onSubmit}>
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

          <Button disabled={loading}>
            {loading ? 'Signing in...' : 'Continue to Trail Buddy'}
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default SignInPage;
