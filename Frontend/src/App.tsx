import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Landing } from './components/LAnding';
import { Room } from './components/Room';
import './App.css'

function App() {
  

  return (
       <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>} />
        <Route path="/room" element={<Room/>} />

      
    </Routes>
    </BrowserRouter>
  )
}

export default App
