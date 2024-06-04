
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

    const currentTime = Date.now() / 1000;


    const verificaAutenticacao = () => {
        
        let token = accessToken();

        if(token){

            if(token.isExp){

                if(refreshValido()){
                    getNewRefreshToken();
                    return true;
                }else{
                    return false;
                }
            }
            else
            {
                return true;
            }

        }
        else
        {
            return false;
        }

    }


    // Função para buscar o token do armazenamento local
    const accessToken = () => {

        const storedToken = localStorage.getItem('accessToken');

        if (storedToken) {
        const decodedToken = jwtDecode(storedToken);
        return {
            name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            isExp: decodedToken.exp < currentTime
        }
        }

        return null;
    
    };


  
  // busca o refresh token do storage
    const refreshToken = () => {

        const storedToken = localStorage.getItem('refreshToken');

        if (storedToken) {    
        const decodedToken = jwtDecode(storedToken);
        return {
            name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            isExp: decodedToken.exp < currentTime
        }
        }

        return null;
    
    };


    // retorna se o refresh está expirado ou não
    const refreshValido =() => {

        const refresh = refreshToken();

        if(refresh){
             return (!refresh.isExp) ? true : false;
        }

        return null;
    };


    const isAdmin =() => {

        const token = accessToken();

        if(token){
            return (token.role === "Admin" ? true : false)
        }

        return false

    }



    // 
    const getNewRefreshToken = async () => {

        try{

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

        }catch(error){
            
            console.log("UserToken.getNewRefreshToken - erro: " + error)
        }

    };


    export { accessToken, refreshToken, refreshValido, getNewRefreshToken , isAdmin , verificaAutenticacao};