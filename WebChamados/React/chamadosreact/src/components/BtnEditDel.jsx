import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';


export default ({ handleEditarUsuario,  data , handleShow }) => {

  const handleEditar = () => {

    if (data) { 
      handleEditarUsuario(data);
    } else {
      console.log('Dados do usuário não encontrados para edição');
    }
  };


  const handleShowModal = () => {
    if (data) { 
      handleShow(data);
    } else {
      console.log('erro ao carregar modal');
    }
  }

  return (
    <div className='btn-box-edit-del'>
      <button type="button" className="btn btn-outline-primary btn-square" onClick={handleEditar}> 
          <FontAwesomeIcon icon={faEdit} style={{ fontSize: '14px' }}/>
      </button>
      <button type="button" className="btn btn-outline-primary btn-square" onClick={handleShowModal} > 
          <FontAwesomeIcon icon={faTrash} style={{ fontSize: '14px' }}/>
      </button>

    </div>
  )
}

