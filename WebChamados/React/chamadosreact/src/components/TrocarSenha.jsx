import React ,{ useState , useEffect} from 'react';
import HeaderNavbar from './HeaderNavbar';
import { useNavigate } from 'react-router-dom';
import './css/NovoUsuario.css';
import API_URL from '../utils/apiConfig';
import getAxiosInstance from '../utils/axiosInstance';
import {accessToken} from '../utils/UserToken';


const TrocarSenha = () => {
  const navigate = useNavigate();


  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [erro, setErro] = useState(null);
  const [msg, setMsg] = useState(null);

  const storedToken = localStorage.getItem('accessToken');

  const baseURL = `${API_URL}/Usuario/AtualizaNovaSenha`;
  
  const axiosInstance = getAxiosInstance(baseURL, storedToken);


  useEffect(() => {

    const token = accessToken();

    setEmail(token.email);       

  }, []);

  const handleSair = () => {
    navigate('/chamados');
  };

  const handleLimpar = () => {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro(null);
    setMsg(null);
  }

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;
    return re.test(password);
  };

  const validaCampos = () => {
    
    if (!senhaAtual || !confirmarSenha || !novaSenha) {
      setErro('Todos os campos são obrigatórios.');
      return false;
    }

    if (senhaAtual.length < 5) {
      setErro('A senha deve ter no mínimo 5 caracteres.');
      return false;
    }

    if (novaSenha === senhaAtual) {
      setErro('A senha atual é igual a senha antiga.');
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A senha de confirmação não coincide com a nova senha.');
      return false;
    }


    if (!validatePassword(novaSenha)) {
      setErro('A nova senha deve ter pelo menos 5 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.');
      return false;
    }
    
    return true ;

  }

  const handleSalvar = () => {
    setErro(null);
    setMsg(null);

    if(validaCampos()) {
        AtualizarNovaSenha();
    } 
  };

  const AtualizarNovaSenha = async() => {

    const user = {
      email: email,
      senhaAtual: senhaAtual,
      novaSenha: novaSenha,
      confirmaSenha: confirmarSenha
    };

    try {
        const response = await axiosInstance.post(`${baseURL}?email=${user.email}`, user);
        setErro(null);
        if (response.status === 200) {
            setMsg("Senha alterada com sucesso!");
        }else{
            console.log("Erro ao alterar senha.");
            setErro("Erro ao alterar senha.");
        }
    }
    catch(error){
        console.log("Erro ao alterar senha. " + error);
        setErro("Erro ao alterar senha: " + error);
    }
  };

  
  return (
    <div>
      <HeaderNavbar />
      <main className='appp'>
        <div className="container">
      
            <h1>Trocar senha</h1>
            {erro && <div className="alert alert-danger">{erro}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            <form>

                <div className="row g-3 campoInput">
                    <div className="col-md-8 campoInput ">
                        <label htmlFor="validationDefaulEmail" className="form-label">Email</label>
                        <input type="email" className="form-control textFile"  placeholder="name@example.com" id="validationDefaulEmail" value={email} disable />
                    </div>
                </div>

                <div className="row g-3 campoInput">
                    <div className="col-md-6 campoInput">
                        <label htmlFor="validationDefaulsenhaAtual" className="form-label">Senha atual</label>
                        <input type="password" className="form-control textFile"   id="validationDefaulsenhaAtual" value={senhaAtual} 
                               onChange={(e) => setSenhaAtual(e.target.value)} required />
                    </div>
                </div>

                <div className="row g-3 campoInput">
                    <div className="col-md-6 campoInput">
                        <label htmlFor="validationDefaulsenhaNova" className="form-label">Nova Senha</label>
                        <input type="password" className="form-control textFile"   id="validationDefaulsenhaNova" value={novaSenha} 
                               onChange={(e) => setNovaSenha(e.target.value)} required />
                    </div>
                </div>
                <div className="row g-3 campoInput">
                    <div className="col-md-6 campoInput">
                        <label htmlFor="validationDefaulConfSenha" className="form-label">Confirmação Nova Senha</label>
                        <input type="password" className="form-control textFile"   id="validationDefaulConfSenha" value={confirmarSenha} 
                               onChange={(e) => setConfirmarSenha(e.target.value)} required />
                    </div>
                </div>  

                <div className="mb-3 btnsNovoUsusuario">
                    <button type="button" className="btn btn-primary me-2 botoes" onClick={handleSalvar}>Salvar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleSair}>Voltar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleLimpar}>Limpar Campos</button>
                </div>

            </form>

            
        </div>
      </main>
    </div>
  );
};

export default TrocarSenha;