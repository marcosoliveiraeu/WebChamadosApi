import './App.css';
import React , {useState , useEffect, useContext} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ChamadosIndex from './components/ChamadosIndex';
import Usuarios from './components/Usuarios';
import TrocarSenha from './components/TrocarSenha';
import PrivateRoute from './components/PrivateRoute'; 
import PrivateAdminRoute from './components/PrivateAdminRoute'; 

import {accessToken , refreshValido , getNewRefreshToken} from './utils/UserToken';
import NovoUsuario from './components/NovoUsuario';
import EditarUsuario from './components/EditarUsuario';
import AbrirChamado from './components/AbrirChamado';
import EditarChamado from './components/EditarChamado';

const App = () => {
  
  const [tokenExpired, setTokenExpired] = useState(false);


  useEffect(() => {
    
    console.log("App.useEffect");

    let token = accessToken();
    if(token){
      //se existir um token no storage      
      
          if(token.isExp){
          //se o access token do storage está expirado   
              
              if(refreshValido()){
              // se o refresh for válido            
              
                //busca novos tokens usando o refresh token
                  getNewRefreshToken();
                  token = accessToken();
  
                  setTokenExpired(false);
  
              }else{                
                setTokenExpired(true);
              }        
  
          }else
          {
            setTokenExpired(false);
          }
      }
      else
      {       
        setTokenExpired(true);
      }


  }, []);

 
  return (
    <Router>
      
        <Routes>
         

          <Route path="/" element={<Navigate to={"/login"} />} />

          <Route path="/login" element={tokenExpired ?  <LoginForm /> : <Navigate to={"/chamados"} />} />
                    
          <Route element={<PrivateRoute />}>
            <Route path="/trocarSenha" element={<TrocarSenha />} />          
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/chamados" element={<ChamadosIndex />} />          
          </Route>

          <Route element={<PrivateAdminRoute />}>
            <Route path="/usuarios" element={<Usuarios />} />          
          </Route>
          
          <Route element={<PrivateAdminRoute />}>
            <Route path="/novoUsuario" element={<NovoUsuario />} />          
          </Route>

          <Route element={<PrivateAdminRoute />}>
            <Route path="/editarUsuario" element={<EditarUsuario />} />          
          </Route>

          <Route element={<PrivateAdminRoute />}>
            <Route path="/editarChamado" element={<EditarChamado />} />          
          </Route>

          <Route element={<PrivateAdminRoute />}>
            <Route path="/abrirChamado" element={<AbrirChamado />} />          
          </Route>
          
          

        </Routes>
    
    </Router>
  );
};

export default App;
