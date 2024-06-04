import React ,  { useState , useEffect}  from 'react';
import HeaderNavbar from './HeaderNavbar';
import { useLocation , useNavigate } from 'react-router-dom';
import API_URL from '../utils/apiConfig';
import getAxiosInstance from '../utils/axiosInstance';

const EditarUsuario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('');
  const [erro, setErro] = useState(null);
  const [msg, setMsg] = useState(null);

  const storedToken = localStorage.getItem('accessToken');

  const baseURL = `${API_URL}/Usuario/AlterarUsuario`;  
  const axiosInstanceNovoUser = getAxiosInstance(baseURL, storedToken);


  useEffect(() => {

    if (user) {
      setNome(user.nome);
      setSobrenome(user.sobrenome);
      setEmail(user.email);
      setPerfil(getPerfilLabel(user.perfil));

    }
  }, []);


  function getPerfilLabel(valor) {
    switch (valor) {
      case 1:
        return "Admin";
      case 2:
        return "Dev";
      case 3:
        return "Padrão";
      default:
        return "Desconhecido";
    }
  }


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

  const AtualizarUsuario = async() =>{
    
    const perfilCode = traduzirPerfil(perfil);
    const userData = {
      email: email,
      nome: nome,
      sobrenome: sobrenome,
      perfil: perfilCode
    };

    try {
        const response = await axiosInstanceNovoUser.put(`${baseURL}?email=${userData.email}`, userData);
        setErro(null);
        if (response.status === 200) {
            setMsg("Usuário alterado com sucesso!");
        }else{
            console.log("Falha ao incluir usuário.");
            setErro("Erro ao incluir usuário.");
        }
    }
    catch(error){
        console.log("Falha ao incluir usuário. " + error);
        setErro("Erro ao incluir usuário: " + error);
    }


  }

  const validaCampos = () => {    
    
    if (!nome || !sobrenome || !email || !perfil) {
      setErro('Todos os campos são obrigatórios.');
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

    return true ;

  }

  const handleCancelar = () => {
    navigate('/usuarios');
  };

  const handleSalvar = () => {
    setErro(null);
    setMsg(null);

    if(validaCampos()) {
        AtualizarUsuario();
    } 
  }
  
  return (
    <div>
      <HeaderNavbar />
      <main className='appp'>
        <div className="container">
      
            <h1>Editar Usuário</h1>
            {erro && <div className="alert alert-danger">{erro}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            <form>

                <div className="row g-3 campoInput">
                    <div className="col-md-8 campoInput ">
                        <label htmlFor="validationDefaulEmail" className="form-label">Email</label>
                        <input type="email" className="form-control textFile"  placeholder="name@example.com" id="validationDefaulEmail" 
                               value={email} disabled />
                    </div>
                </div> 

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
                

                <div className="mb-3 btnsNovoUsusuario">
                    <button type="button" className="btn btn-primary me-2 botoes" onClick={handleSalvar}>Salvar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleCancelar}>Cancelar</button>
                </div>

            </form>

            
        </div>

      </main>
    </div>
  );
};

export default EditarUsuario;