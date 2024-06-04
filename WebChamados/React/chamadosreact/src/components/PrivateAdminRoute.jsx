import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {accessToken , refreshValido , getNewRefreshToken} from '../utils/UserToken';

const PrivateAdminRoute = () => {
    
  let isAuthenticated = false;
  let isAdmin = false;

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

                isAdmin = token.role === 'Admin' ? true : false;
                isAuthenticated = true;
            }        

        }
        else
        {
          isAdmin = token.role === 'Admin' ? true : false;
          isAuthenticated = true;
        }
  }

  if (!isAuthenticated){
    return <Navigate to="/login" />
  }else if(!isAdmin){
    return <Navigate to="/chamados" />
  }else{
    return <Outlet />
  }
 
};

export default PrivateAdminRoute;