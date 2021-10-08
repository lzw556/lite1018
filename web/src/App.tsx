import React from 'react';
import {Button} from 'antd';
import {useHistory} from "react-router-dom";
import {GetNetworkRequest} from './apis/network';
import './App.css';

function App() {
    const history = useHistory()
    const testClick = () => {
        history.push('/login')
    }

    return (
        <div className="App">
            <Button type="primary" onClick={testClick}>Click</Button>
        </div>
    );
}

export default App;
