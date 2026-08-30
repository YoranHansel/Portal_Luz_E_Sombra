import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastrar from './pages/Cadastrar'
import Agendamento from './pages/Agendamento'
import Sair from './pages/Sair'
import AdminHome from './pages/AdminHome'
import AdminAlbuns from './pages/AdminAlbuns'

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/cadastrar' element={<Cadastrar />} />
          <Route path='/agendamento' element={<Agendamento />} />
          <Route path='/sair' element={<Sair />} />
          <Route path='/admin/home' element={<AdminHome />} />
          <Route path='/admin' element={<AdminHome />} />
          <Route path='/admin/albuns' element={<AdminAlbuns />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
