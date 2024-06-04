import React, { useState , useEffect , useContext }from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import icon from '../img/icone.png';
import {Navigate, useNavigate } from 'react-router-dom';
import './css/HeaderNavbar.css';

import {accessToken , refreshValido , getNewRefreshToken} from '../utils/UserToken';

const HeaderNavbar = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [roleAdmin, setRoleAdmin] = useState(false);



  useEffect(() => {
    
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

                setUsername(token.name);
                setRoleAdmin(token.role === "Admin" ? true : false);

            }else{           
              console.log("HeaderNavBar.useEffect - refresh token expirado");     
              handleLogout();              
            }        

        }else
        {
          setUsername(token.name);
          setRoleAdmin(token.role === "Admin" ? true : false);
        }
    }
    else
    {
      console.log("HeaderNavBar.useEffect - usuario não autenticado");  

      // vai para pagina login 
       navigate('/login');
       
    }

  }, []);



  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };


  const handleUsuarios = () => {
    navigate('/usuarios');
  };

  const handleChamados = () => {
    navigate('/chamados');

  };

  const handleTrocarSenha = () => {
    navigate('/trocarSenha');
  };
  

  return (
    <Navbar bg="light" expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand href="#home" className="d-flex align-items-center" onClick={handleChamados}>
          <img src={icon} alt="WebChamados" className="icon" />
          <span className="titulo">WebChamados</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown title={`Olá, ${username}`} id="basic-nav-dropdown" className="username-dropdown">
              <NavDropdown.Item onClick={handleTrocarSenha}>Trocar a senha</NavDropdown.Item>
              {roleAdmin && <NavDropdown.Item onClick={handleUsuarios} >Usuários</NavDropdown.Item>}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Sair</NavDropdown.Item>
              
            </NavDropdown>
            <NavDropdown title={`Olá, ${username}`} id="mobile-nav-dropdown" className="d-lg-none">
              <NavDropdown.Item onClick={handleTrocarSenha}>Trocar a senha</NavDropdown.Item>
              {roleAdmin && <NavDropdown.Item onClick={handleUsuarios}>Usuários</NavDropdown.Item>}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Sair</NavDropdown.Item>
              
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderNavbar;
