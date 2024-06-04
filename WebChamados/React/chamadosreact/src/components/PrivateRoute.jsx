import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {accessToken , refreshValido , getNewRefreshToken} from '../utils/UserToken';

const PrivateRoute = () => {
  let isAuthenticated = false;

  let token = accessToken();

  if(token){
    //se existir um token no storage      
    
        if(token.isExp){
        //se o access token do storage está expirado   
            
            if(refreshValido()){
            // se o refresh for válido            
            
                //busca novos tokens usando o refresh token
                getNewRefreshToken();

                isAuthenticated = true;
            }        

        }
        else
        {
          isAuthenticated = true;
        }
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
