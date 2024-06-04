
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
//import axiosInstance from '../utils/AxiosInstance';

export const UserContext = createContext(); 

export const UserProvider = ({ children }) => {
    
  const [user, setUser] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);


  const updateTokenExpired = (expired) => {
    setTokenExpired(expired);
  };

  const updateUser = () => {
    
    let decodedToken = getTokenFromStorage();
    
    setUser({
      name: decodedToken.name,
      email: decodedToken.email,
      role: decodedToken.role,
      exp: decodedToken.exp
      });
  };

  // Função para buscar o token do armazenamento local
  const getTokenFromStorage = () => {
    const storedToken = localStorage.getItem('accessToken');

    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      return {
        name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        exp: decodedToken.exp
      }
    }

    return null;
    
  };

  // busca o refresh token do storage
  const getRefreshTokenFromStorage = () => {
    const storedToken = localStorage.getItem('refreshToken');

    console.log("getRefreshTokenFromStorage 1");


    if (storedToken) {    
      console.log("getRefreshTokenFromStorage 2");  
      const decodedToken = jwtDecode(storedToken);
      return {
        name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        exp: decodedToken.exp
      }
    }

    console.log("getRefreshTokenFromStorage 3");
    return null;
    
  };



  const checkLogin = async () => 
  {

      try 
      {
    
        let token = getTokenFromStorage();

        console.log("a");

        if (token) 
        {
        
          console.log("b");

          const currentTime = Date.now() / 1000;

          if (token.exp < currentTime) 
          {          

              console.log("c");
              console.log("token.exp: " + token.exp);       
              
              let refreshToken = getRefreshTokenFromStorage() ;

              if (refreshToken){

                if (refreshToken.exp < currentTime) {
                  // refresh expirado , precisa fazer login novamente
                  console.log("refresh expirado , precisa fazer login novamente");
      
                  // refresh token inválido
                  setUser(null);
                  setTokenExpired(true);                      

                }
                else
                {          

                  // refresh ainda dentro da data de validade
                  // busca novos tokens e role                    
       
                  const storedRefreshToken = localStorage.getItem('refreshToken');

                  const baseURL = 'https://localhost:7137/api/Usuario/Refresh';

                  const axiosInstance = axios.create({
                    baseURL,
                    headers:{Authorization: `Bearer ${storedRefreshToken}`}
                  });

                  axiosInstance.interceptors.request.use(async (request) => {                                      
                    request.headers.Authorization = `Bearer ${storedRefreshToken}`;                   
                    return request;
                  });
              
                               
                  const refreshResponse = await axiosInstance.post(baseURL);
                    
                  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

                  localStorage.setItem('accessToken', newAccessToken);
                  localStorage.setItem('refreshToken', newRefreshToken);
                        
                  token = jwtDecode(newAccessToken);
      
                  setTokenExpired(false)
                        
                  setUser({
                      name: token['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                      email: token['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                      role: token['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                      exp: token.exp
                  });

                    
                    console.log("Chamada da API Refresh token OK , novos tokens atualizados");            
                 
                }
              }
              else
              {
                console.log("refresh token não encontrado");
      
                // refresh token não encontrado
                setUser(null);
                setTokenExpired(true);
              }              
            
          } 
          else 
          {
            console.log("f");
          
          
            // token válido , retorna as informações

            console.log(token.name);
            console.log(token.email);
            console.log(token.role);
            console.log(token.exp);
          
            setTokenExpired(false)

            setUser({
              name: token.name,
              email: token.email,
              role: token.role,
              exp: token.exp
            });
          }
        } 
        else 
        {
          console.log("g");
          // não foi encontrado token no storage

          setUser(null);
          setTokenExpired(true) ;        
        
          console.log(tokenExpired);      
       

        }

      } 
      catch (error) 
      {

        console.log("catch do UserContext checkLogin : " , error )

        setUser(null);
        setTokenExpired(true);
      }      

  };

    
  useEffect(() => {  
    
    console.log("UserContext useEffect" )

    //checkLogin();
    
  }, []);
  

  return (
    <UserContext.Provider value={{ user, tokenExpired , updateTokenExpired , updateUser , checkLogin , getTokenFromStorage}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

