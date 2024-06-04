import React, { useState , useEffect , useContext } from 'react';
import axios from 'axios';
import './css/LoginForm.css';
import icon from '../img/icone.png';
import { Navigate , useNavigate  } from 'react-router-dom';
import API_URL from '../utils/apiConfig';
//import { UserContext } from './UserContext'; 

const LoginForm = () => {
    
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  const [emailHistory, setEmailHistory] = useState([]);

  //const { tokenExpired ,  updateTokenExpired , updateUser , checkLogin} = useContext(UserContext); 

  const baseURL = `${API_URL}/Usuario/Login`

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(baseURL, {
        email,
        password,
      });

      
      if (response.data.flag) {
        
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        const updatedEmailHistory = [...new Set([email, ...emailHistory])];
        setEmailHistory(updatedEmailHistory);
        localStorage.setItem('emailHistory', JSON.stringify(updatedEmailHistory));

        
       // <Navigate to="/chamados" /> ;
        navigate('/chamados');

      } else {
        
        setError(response.data.message);
      }
    } catch (error) {
        console.error('Erro de login:', error);
        if (error.response && error.response.status === 401) {
          setError('Email ou senha inválidos. Por favor, tente novamente.');
        } else {
          setError('Erro ao efetuar o login. Por favor, tente novamente.');
        }
    }
  };

   
  useEffect(() => {

    const savedEmails = JSON.parse(localStorage.getItem('emailHistory')) || [];
    setEmailHistory(savedEmails); 

  }, []);
  
  return (
    <div className="formContainer">
        <div className="formBox">
            <img src={icon} alt="WebChamados" className="icon" />
            <span className="appName" >WebChamados</span><br />
            <span className="telaLogin">Fazer login</span>
            {error && <p className="error">{error}</p>} 
            <form onSubmit={handleSubmit}>
                <input type="email" list="emailHistory" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <datalist id="emailHistory">
                  {emailHistory.map((email, index) => ( <option key={index} value={email} /> ))}
                </datalist>
                <input type="password" placeholder='Senha'  value={password} onChange={(e) => setPassword(e.target.value)}/>
                
                <button type="submit">Fazer login</button>
            </form>
            <div className="forgotPassword">
                <div className="divider"></div>
                <a href="#">Esqueceu sua senha?</a>                
            </div>            
        </div>
    </div>
  );

};

export default LoginForm;
