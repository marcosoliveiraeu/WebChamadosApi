import HeaderNavbar from './HeaderNavbar';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/NovoUsuario.css';
import API_URL from '../utils/apiConfig';
import getAxiosInstance from '../utils/axiosInstance';

const NovoUsuario = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState('');
  const [erro, setErro] = useState(null);
  const [msg, setMsg] = useState(null);


  const storedToken = localStorage.getItem('accessToken');

  const baseURL = `${API_URL}/Usuario/Registrar`;
  
  const axiosInstanceNovoUser = getAxiosInstance(baseURL, storedToken);
   

  const IncluiNovoUsuario = async() =>{   
    const perfilCode = traduzirPerfil(perfil);
    const userData = {
      email: email,
      password: senha,
      nome: nome,
      sobrenome: sobrenome,
      perfil: perfilCode
    };
   

    try {
      const response = await axiosInstanceNovoUser.post(baseURL, userData);
      setErro(null);
      if (response.status === 200) {
        
        setMsg("Usuário incluído com sucesso!");
        
        
      }else{
        console.log("Falha ao incluir usuário.");
        setErro("Erro ao incluir usuário.");
        
      }
    } catch (error) {

      if (error.response && error.response.status === 400) {

        const errorData = error.response.data;
    
        // Verifica se a resposta contém o erro de nome de usuário duplicado
        const duplicateUserError = errorData.errors.find(err => err.code === "DuplicateUserName");
    
        if (duplicateUserError) {
          setErro(`Erro: O email ${userData.email} já está cadastrado!`);
        } else {
          console.log("Erro ao incluir usuário:", error);
          setErro("Erro ao incluir usuário: " + error.message);
        }
      } else {

        console.log("Erro ao incluir usuário:", error);
        setErro("Erro ao incluir usuário: " + error.message);
      }
     
      
    }    
  };

  const traduzirPerfil = (perfilTexto) => {
    switch (perfilTexto) {
      case "Admin":
        return 1;
      case "Dev":
        return 2;
      case "Padrão":
        return 3;
      default:
        return null;
    }
  };

  const handleSalvar = () => {

    setErro(null);
    setMsg(null);

    if(validaCampos()) {
        IncluiNovoUsuario();
    }    
  };


  const validaCampos = () => {
    
    if (!nome || !sobrenome || !email || !senha || !confirmarSenha || !perfil) {
      setErro('Todos os campos são obrigatórios.');
      return false;
    }
    if (email.length > 100) {
      setErro('O email deve ter no máximo 100 caracteres.');
      return false;
    }
    if (senha.length < 5) {
      setErro('A senha deve ter no mínimo 5 caracteres.');
      return false;
    }
    if (nome.length > 20) {
      setErro('O nome deve ter no máximo 20 caracteres.');
      return false;
    }
    if (sobrenome.length > 100) {
      setErro('O sobrenome deve ter no máximo 100 caracteres.');
      return false;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return false;
    }

    if (!validateEmail(email)) {
      setErro('O email inserido é inválido.');
      return false;
    }

    if (!validatePassword(senha)) {
      setErro('A senha deve ter pelo menos 5 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.');
      return false;
    }
    
    return true ;

  }

  const handleLimpar = () => {
    setNome("");
    setSobrenome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setPerfil("");
    setErro(null);
    setMsg(null);
  }

  const handleCancelar = () => {
    navigate('/usuarios');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;
    return re.test(password);
  };

  return (
    <div>
      <HeaderNavbar />
      <main className='appp'>
        <div className="container">
      
            <h1>Novo Usuário</h1>
            {erro && <div className="alert alert-danger">{erro}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            <form>
                <div className="row g-3 campoInput">
                    <div className="col-md-4 campoInput">
                        <label htmlFor="validationDefaulNome" className="form-label">Nome</label>
                        <input type="text" className="form-control" id="validationDefaulNome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    </div>
                    <div className="col-md-4 campoInput">
                        <label htmlFor="validationDefaultSobrenome" className="form-label">Sobrenome</label>
                        <input type="text" className="form-control" id="validationDefaultSobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
                    </div>
                    <div className="col-md-4 campoInput">
                        <label htmlFor="validationDefaultUsername" className="form-label">Perfil</label>
                        <select className="form-select" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Admin">Admin</option>
                            <option value="Dev">Dev</option>
                            <option value="Padrão">Padrão</option>
                        </select>
                    </div>
                </div>
                <div className="row g-3 campoInput">
                    <div className="col-md-8 campoInput ">
                        <label htmlFor="validationDefaulEmail" className="form-label">Email</label>
                        <input type="email" className="form-control textFile"  placeholder="name@example.com" id="validationDefaulEmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>
                <div className="row g-3 campoInput">
                    <div className="col-md-6 campoInput">
                        <label htmlFor="validationDefaulsenha" className="form-label">Senha</label>
                        <input type="password" className="form-control textFile"   id="validationDefaulsenha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                    </div>
                </div>
                <div className="row g-3 campoInput">
                    <div className="col-md-6 campoInput">
                        <label htmlFor="validationDefaulConfSenha" className="form-label">Confirmação Senha</label>
                        <input type="password" className="form-control textFile"   id="validationDefaulConfSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                    </div>
                </div>  

                <div className="mb-3 btnsNovoUsusuario">
                    <button type="button" className="btn btn-primary me-2 botoes" onClick={handleSalvar}>Salvar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleCancelar}>Cancelar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleLimpar}>Limpar Campos</button>
                </div>

            </form>

            
        </div>
      </main>
    </div>
  );
};

export default NovoUsuario;
