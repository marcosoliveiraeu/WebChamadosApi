import React , { useState , useEffect } from 'react';
import './css/Usuarios.css';
import HeaderNavbar from './HeaderNavbar';
import {isAdmin} from '../utils/UserToken';
import { useNavigate  } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import  BtnEditDel  from './BtnEditDel';
import API_URL from '../utils/apiConfig';
import {verificaAutenticacao} from '../utils/UserToken';
import getAxiosInstance from '../utils/axiosInstance';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";



const Usuarios = () => {
  const [gridApi, setGridApi] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate(); 
  const [erro, setErro] = useState(null);
  const [msg, setMsg] = useState(null);  
  const [show, setShow] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  let storedToken = localStorage.getItem('accessToken');
  const baseURLRetUser = `${API_URL}/Usuario/RetornarUsuarios`
  const baseURLDelUser = `${API_URL}/Usuario/ExcluirUsuario`

  const axiosRetornarUsuariosInstance = getAxiosInstance(baseURLRetUser, storedToken);
   

  const retornaUsuarios = async() =>{   
    await axiosRetornarUsuariosInstance.get(baseURLRetUser)      
    .then(response => {    
      setData(response.data);

     })
    .catch(error=> {
        console.log("Usuarios.refreshResponse.catch - " + error);

    })        
  };
  

  useEffect(() => {
    if(isAdmin()){
        retornaUsuarios();
    }
    else{
        navigate('/chamados');
    }
    
  }, [] );  

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

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const handleEditarUsuario = (user) => {
    setSelectedUser(user)

    navigate('/EditarUsuario', { state: { user }});

  };

  const excluirUsuario = async() => {

    if(verificaAutenticacao() && selectedUser){

      let storedToken = localStorage.getItem('accessToken');
      
      const axiosExcluirUsuarioInstance = getAxiosInstance(baseURLDelUser, storedToken);

      try {
        
        const response = await axiosExcluirUsuarioInstance.delete(`${baseURLDelUser}?email=${selectedUser.email}`);

        setErro(null);
        setShow(false);

        if (response.status === 200) {
          setMsg("Usuário excluído com sucesso!");
          retornaUsuarios()
         
        } else {
          setErro("Erro ao excluído usuário.");          
        }
      } catch (error) {
        setErro("Erro ao excluído usuário:" + error);    
      }    

    }
    else{
      navigate('/login');
    }
    
  };

  const handleShow = (user) => {
    setSelectedUser(user);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
  };



  const columnDefs = [
    { headerName: 'Nome', field: 'nome' },
    { headerName: 'Sobrenome', field: 'sobrenome' },
    { headerName: 'Perfil', field: 'perfil', valueGetter: (params) => getPerfilLabel(params.data.perfil) },
    { headerName: 'Email', field: 'email' },
    {
      headerName: 'Ação',
      field: 'actions',
      width: 120,
      flex: 1,
      cellRenderer: BtnEditDel,
      cellRendererParams: { handleEditarUsuario,  handleShow},
      filter: false         
    }
  ];


  const defaultColDef = { 
    sortable: true,
    flex: 1, filter: true,
    floatingFilter: true
  }


  const handleNovoUsuario = () => {
    navigate('/novoUsuario');
  };



  return (
    <div>
      <HeaderNavbar />
      <main className='appp'>
        <div className="container">  

            <h1 className='tituloUsuario'>Usuários</h1>
            {erro && <div className="alert alert-danger">{erro}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}
            <div align='right'>
              <button type="button" className="btn btn-primary btnIncluir" onClick={handleNovoUsuario}>Incluir novo usuário</button>
            </div>

            <div className="ag-theme-alpine" style={{ height: '568px', width: '100%' }}>
              <AgGridReact
                rowData={data}
                columnDefs={columnDefs}
                onGridReady={onGridReady}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                frameworkComponents={{ btnEditDel: BtnEditDel }}
                cellRenderer="btnEditDel" 
              />
            </div>
        </div>        

        <Modal
          show={show}
          onHide={handleClose}   
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              Excluir usuário
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>        
            <p>
              Deseja realmente excluir o usuário com o e-mail: {selectedUser?.email}?          
            </p>
          </Modal.Body>
          <Modal.Footer className="custom-modal-footer">
            <Button variant="secondary"  onClick={handleClose}>
              Fechar
            </Button>
            <Button variant="primary"  onClick={excluirUsuario}>
              Confirmar
              
            </Button>
          </Modal.Footer>
        </Modal>

      </main>
    </div>
  );
};



export default Usuarios;

