import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

export default ({ handleEditarChamado,  data  }) => {

  const handleEditar = () => {

    if (data) { 
        handleEditarChamado(data);
    } else {
      console.log('Dados do usuário não encontrados para edição');
    }
  };


  return (
    <div className='btn-box-edit-chamado'>
      <button type="button" className="btn btn-primary btn-editar-chamado" onClick={handleEditar}> 
        <FontAwesomeIcon icon={faEdit} style={{ fontSize: '14px' }}/>
      </button>
    </div>
  )
}

