import React from 'react';

const Task = (props) => {
  return (<li className="mb-3 cursor-pointer" onClick={() => props.clickAction(props.item.id)}>
  <i className={props.item.checked ? 'far fa-check-circle fa-fw' : 'far fa-circle fa-fw'}></i> {props.item.label}
</li>);
}

export default Task;