import { ProgressCircle } from '@adobe/react-spectrum';

const Loader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <ProgressCircle aria-label='Loading...' isIndeterminate />
  </div>
);

export default Loader;
