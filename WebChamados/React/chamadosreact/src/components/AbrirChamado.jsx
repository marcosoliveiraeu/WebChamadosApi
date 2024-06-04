import HeaderNavbar from './HeaderNavbar';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../utils/apiConfig';
import getAxiosInstance from '../utils/axiosInstance';
import './css/NovoUsuario.css';
import {accessToken} from '../utils/UserToken';

const AbrirChamado = () => {
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [erro, setErro] = useState(null);
    const [msg, setMsg] = useState(null);


    const storedToken = localStorage.getItem('accessToken');

    const baseURL = `${API_URL}/Chamado/AbrirChamado`;
    
    const axiosInstanceNovoChamado = getAxiosInstance(baseURL, storedToken);



    const SalvarNovoChamado = async() => {

        try{
            const chamadoData = {
                titulo: titulo,
                descricao: descricao
            };
            
            const usuarioLogado = accessToken();

            const response = await axiosInstanceNovoChamado.post(`${baseURL}?emailSolicitante=${usuarioLogado.email}`, chamadoData);

            setErro(null);
            setMsg(null);

            if (response.status === 200) {              
              setMsg(response.data.message);
            }else{
              console.log("Falha ao abrir chamado.");
              setErro("Erro ao abrir chamado.");              
            }

        }
        catch(error){
            console.log("Falha ao abrir chamado: " + error);
              setErro("Erro ao abrir chamado: " + error );   
        }

    }

    const validaCampos= () => {
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

        return true ;

    }

    const handleSalvar = () => {
        
        setErro(null);
        setMsg(null);

        if(validaCampos()) {
            SalvarNovoChamado();
        }            

    };

    const handleVoltar = () => {
        navigate('/Chamados');
    };

    const handleLimpar = () => {
        setTitulo("");
        setDescricao("");
        setErro(null);
        setMsg(null);
    };
    

    return (
        <div>
          <HeaderNavbar />
          <main className='appp'>
            <div className="container">

                <h1>Abrir Chamado</h1>
                {erro && <div className="alert alert-danger">{erro}</div>}
                {msg && <div className="alert alert-success">{msg}</div>}

                <div className="col-md-12 ">
                    <label htmlFor="validationtitulo" className="form-label">Título Chamado</label>
                    <input type="text" className="form-control" id="validationtitulo" value={titulo}  maxLength={60}
                           onChange={(e) => setTitulo(e.target.value)} required />
                </div>

                <div className="col-md-12 campoInput">
                    <label htmlFor="validationtitulo" className="form-label">Descrição</label>
                    <textarea type="textarea" className="form-control" id="validationtitulo" value={descricao} style={{ height: '200px' }} maxLength={500}
                              onChange={(e) => setDescricao(e.target.value)} required />
                </div>

                <div className="mb-3 btnsNovoUsusuario">
                    <button type="button" className="btn btn-primary botoes" onClick={handleSalvar}>Salvar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleVoltar}>Voltar</button>
                    <button type="button" className="btn btn-primary botoes" onClick={handleLimpar}>Limpar Campos</button>
                </div>

            </div>
      </main>
    </div>
  );
};

export default AbrirChamado;
