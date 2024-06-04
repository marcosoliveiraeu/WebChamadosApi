import React ,  { useState , useEffect}  from 'react';
import HeaderNavbar from './HeaderNavbar';
import { useLocation , useNavigate } from 'react-router-dom';
import API_URL from '../utils/apiConfig';
import getAxiosInstance from '../utils/axiosInstance';
import './css/EditarChamado.css';
import {accessToken} from '../utils/UserToken';

const EditarChamado = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { chamado } = location.state || {};
    

    const [id, setId] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [solicitante, setSolicitante] = useState('');
    const [dtAbertura, setDtAbertura] = useState('');
    const [dtFechamento, setDtFechamento] = useState('');
    const [erro, setErro] = useState(null);
    const [msg, setMsg] = useState(null);
  
    const storedToken = localStorage.getItem('accessToken');
  
    const baseURL = `${API_URL}/Chamado/EditarChamado`;  
    const axiosInstanceEditarChamado = getAxiosInstance(baseURL, storedToken);
    
    const usuarioLogado = accessToken();
    const emailUsuarioLogado = usuarioLogado.email;
  
    const formatarData = (dataISO) => {
        if (!dataISO) {
            return '';
        }
        const date = new Date(dataISO);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0'); // Meses são indexados de 0 a 11
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    };
      
    useEffect(() => {
  
      if (chamado) {
        setId(chamado.id);
        setTitulo(chamado.titulo);
        setDescricao(chamado.descricao);
        setStatus(chamado.status);
        setResponsavel(chamado.responsavel);
        setSolicitante(chamado.emailSolicitante);
        setDtAbertura(formatarData(chamado.dtAbertura));
        setDtFechamento(formatarData(chamado.dtFechamento));
  
      }
    }, []);

    const validaCampos = () => {

        if (!titulo || !descricao ) {
            setErro('Todos os campos são obrigatórios.');
            return false;
        }
        if (titulo.length > 60) {
            setErro('O título deve ter no máximo 100 caracteres.');
            return false;
        }
        if (descricao.length > 500) {
            setErro('A descrição deve ter no máximo 500 caracteres.');
            return false;
        }


        return true;
    }

    const handleSalvar = () => {
        
        setErro(null);
        setMsg(null);
    
        if(validaCampos()) {
            AtualizarChamado();
        } 

    };

    const handleVoltar = () => {
        navigate('/chamados');
    };

    const handleAssumir = () => {

               
        setResponsavel(emailUsuarioLogado);    
        
        if (status === "Pendente"){
            setStatus("Em Andamento")
        } 
         

    };

    const handleStatus=(e) => {


        setStatus(e.target.value)

        if (e.target.value === "Pendente"){
            setResponsavel('');
            setDtFechamento('');
        }else{

            setResponsavel(emailUsuarioLogado); 

            if (e.target.value === "Cancelado" || e.target.value === "Resolvido"||e.target.value === "BackLog"){

                const today = new Date();
                const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
                setDtFechamento(formattedDate);

            }else if (e.target.value === "Em Andamento"){
                setDtFechamento('');            
            }
        }
       
        
    }
    
    const AtualizarChamado = async() =>{

        try 
        {
            const chamadoData = {
                id: id,
                titulo: titulo,
                descricao: descricao,
                status: status,
                responsavel: responsavel
            };

            setErro(null);
            setMsg(null);
            
            const response = await axiosInstanceEditarChamado.put(baseURL, chamadoData);
            
            if (response.status === 200) {
                setMsg("Chamado alterado com sucesso!");
            }else{
                console.log("Falha ao alterar chamado.");
                setErro("Erro ao alterar chamado.");
            }

        }
        catch(error)
        {
            console.log("Falha ao incluir usuário. " + error);
            setErro("Erro ao incluir usuário: " + error);
        }


    }

  
    return (
        <div>
          <HeaderNavbar />
          <main className='appp'>
            <div className="container">

                <h1>Editar Chamado</h1>
                {erro && <div className="alert alert-danger">{erro}</div>}
                {msg && <div className="alert alert-success">{msg}</div>}

                <div className="row g-3 ">

                    <div className="col-md-2 ">
                        <label htmlFor="validationid" className="form-label">ID</label>
                        <input type="text" className="form-control" id="validationid" value={id} readOnly />
                    </div>

                    <div className="col-md-4 ">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={status} onChange={(e) => handleStatus(e)}>
                            <option value="Pendente">Pendente</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Resolvido">Resolvido</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="BackLog">BackLog</option>
                        </select>
                    </div>

                    <div className="col-md-2 ">
                        <label htmlFor="validationdtAbertura" className="form-label">Data Abertura</label>
                        <input type="text" className="form-control" id="validationdtAbertura" value={dtAbertura} readOnly />
                    </div>
                    <div className="col-md-2 ">
                        <label htmlFor="validationdtConclusao" className="form-label">Data Conclusão</label>
                        <input type="text" className="form-control" id="validationdtConclusao" value={dtFechamento} readOnly />

                    </div>
                    
                </div>

                <div className="row g-3 ">
                    <div className="col-md-12 campostext">
                        <label htmlFor="validationtitulo" className="form-label">Título Chamado</label>
                        <input type="text" className="form-control" id="validationtitulo" value={titulo}  maxLength={60}
                            onChange={(e) => setTitulo(e.target.value)} required />
                    </div>
                </div>

                <div className="row g-3 ">
                    
                    <div className="col-md-4 campostext">
                        <label htmlFor="validationsolicitante" className="form-label">Solicitante</label>
                        <input type="text" className="form-control" id="validationsolicitante" value={solicitante}  disable readOnly/>
                    </div>
                    <div className="col-md-4 campostext">
                        <label htmlFor="validationresponsavel" className="form-label">Responsavel</label>
                        <input type="text" className="form-control" id="validationresponsavel" value={responsavel}  disable readOnly/>
                    </div>
                    <div className="col-md-4 campostext campodiv">                    
                        <button type="button" className="btn btn-primary botoes" onClick={handleAssumir}>Assumir Chamado</button>
                    </div>
                   
                </div>
                
                

                <div className="col-md-12 campostext">
                    <label htmlFor="validationtitulo" className="form-label">Descrição</label>
                    <textarea type="textarea" className="form-control" id="validationtitulo" value={descricao} style={{ height: '200px' }} maxLength={500}
                              onChange={(e) => setDescricao(e.target.value)} required />
                </div>

                <div className="mb-3 btnsNovoUsusuario">
                    <button type="button" className="btn btn-primary botoes" onClick={handleSalvar}>Salvar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleVoltar}>Voltar</button>
                </div>


            </div>
          </main>
        </div>
);
}


export default EditarChamado;