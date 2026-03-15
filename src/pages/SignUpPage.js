import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { signUp } from '../api/v1/auth';
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
      navigate('/explore');
    } catch (submitError) {
      setError(submitError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-block'>
      <Card className='auth-card'>
        <h1 className='page-title'>Create Account</h1>
        <p className='page-subtitle'>
          Start saving trails and building personal route lists.
        </p>

        <form className='auth-form' onSubmit={onSubmit}>
          <label>
            <span>Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className='error-copy'>{error}</p> : null}

          <Button disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default SignUpPage;
