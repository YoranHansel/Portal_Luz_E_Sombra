import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastrar from './pages/Cadastrar'
import Agendamento from './pages/Agendamento'
import Sair from './pages/Sair'


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
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
