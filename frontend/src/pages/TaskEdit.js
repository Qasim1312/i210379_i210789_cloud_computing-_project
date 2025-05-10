import React from 'react';
import { useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';

const TaskEdit = () => {
  const { id } = useParams();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <TaskForm taskId={id} isEditing={true} />
        </div>
      </div>
    </div>
  );
};

export default TaskEdit; 