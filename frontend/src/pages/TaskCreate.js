import React from 'react';
import TaskForm from '../components/TaskForm';

const TaskCreate = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <TaskForm isEditing={false} />
        </div>
      </div>
    </div>
  );
};

export default TaskCreate; 