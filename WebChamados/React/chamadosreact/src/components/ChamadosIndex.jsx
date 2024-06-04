import React , { useState , useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import './css/ChamadosIndex.css';
import HeaderNavbar from './HeaderNavbar';
import API_URL from '../utils/apiConfig';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import getAxiosInstance from '../utils/axiosInstance';
import  BtnEditarChamado  from './btnEditarChamado';


const ChamadosIndex = () => {
  const [gridApi, setGridApi] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate(); 
  const [erro, setErro] = useState(null);
  const [msg, setMsg] = useState(null);  
  const [show, setShow] = useState(false);

  const [chamadoSelecionado, setchamadoSelecionado] = useState(null);

  let storedToken = localStorage.getItem('accessToken');
  const baseURLRetornaChamados = `${API_URL}/Chamado/RetornaChamados`
  const baseURLExcluirChamado = `${API_URL}/Chamado/ExcluirChamado`


  const axiosRetornaChamadosInstance = getAxiosInstance(baseURLRetornaChamados, storedToken);
   

  const retornaChamados = async() =>{   

    setErro(null);

    await axiosRetornaChamadosInstance.get(baseURLRetornaChamados)      
    .then(response => {    
      setData(response.data);

     })
    .catch(error=> {
        console.log("Usuarios.refreshResponse.catch - " + error);
        setErro("Erro ao retornar chamados.");   

    })        
  };

  useEffect(() => {

      retornaChamados();  

  }, [] );  

  const onGridReady = (params) => {
    setGridApi(params.api);
  };
 

  
  const formatDate = (dateStr) => {
    if (!dateStr) {
      return ''; 
    }
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAbrirChamado = () => {
    navigate('/abrirChamado');
  };

  const handleEditarChamado = (chamado) => {
    setchamadoSelecionado(chamado)

    navigate('/EditarChamado', { state: { chamado }});
  };

  const columnDefs = [
    {
      headerName: '',
      field: 'abrir',      
      flex: 1,
      cellRenderer: BtnEditarChamado,
      cellRendererParams: { handleEditarChamado },
      filter: false       ,
      minWidth: 55,
      maxWidth: 76,
      flex: 2,  
    },
    { headerName: 'Id', field: 'id' ,
      minWidth: 55,
      maxWidth: 80,
      flex: 2,  
    },
    { 
      headerName: 'Dt Abertura', 
      field: 'dtAbertura',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 100,
      maxWidth: 148,
      flex: 2 
    },
    { headerName: 'Título', field: 'titulo' ,width: 80},
    { headerName: 'Status', field: 'status' ,
      minWidth: 100,
      maxWidth: 148,
      flex: 2
    },    
    { headerName: 'Solicitante', field: 'emailSolicitante',
      minWidth: 100,
      maxWidth: 200,
      flex: 2
    },
    { headerName: 'Responsavel', field: 'responsavel' ,
      minWidth: 100,
      maxWidth: 200,
      flex: 2
    },
    { 
      headerName: 'Dt Fechamento', 
      field: 'dtFechamento',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 100,
      maxWidth: 148,
      flex: 2 
    }
    
  ];


  const defaultColDef = { 
    sortable: true,
    flex: 1, filter: true,
    floatingFilter: true
  }




  
  return (
    <div>
      <HeaderNavbar />
      <main className='appp'>
        <div className="container">  

          <h1>Chamados</h1>
            {erro && <div className="alert alert-danger">{erro}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}
            <div align='right'>
              <button type="button" className="btn btn-primary btnIncluir" onClick={handleAbrirChamado}>Abrir Chamado</button>
            </div>

            <div className="ag-theme-alpine" style={{ height: '568px', width: '100%' }}>
              <AgGridReact
                rowData={data}
                columnDefs={columnDefs}
                onGridReady={onGridReady}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                frameworkComponents={{ btnEditarChamado: BtnEditarChamado }}
                cellRenderer="btnEditarChamado" 
              />
            </div>
        </div>        
      </main>
    </div>
  );
};

export default ChamadosIndex;
