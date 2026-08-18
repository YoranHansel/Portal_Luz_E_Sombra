import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

function App() {
 
  return (
    <div>
      <BrowserRouter>
         <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
         </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
