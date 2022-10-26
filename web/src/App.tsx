import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import './App.css';

function App() {
  const history = useHistory();
  const testClick = () => {
    history.push('/login');
  };

  return (
    <div className='App'>
      <Button type='primary' onClick={testClick}>
        Click
      </Button>
    </div>
  );
}

export default App;
