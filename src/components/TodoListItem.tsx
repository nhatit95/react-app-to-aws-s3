import { CheckboxField, Flex, TextField } from "@aws-amplify/ui-react";
import React, { useState } from "react";
import { Dropdown } from "./Dropdown";

interface TodoListItemProps {
  todo: Todo;
  toggleComplete: ToggleComplete;
  onRemoveTodo: RemoveTodo;
  editTodo: EditTodo;
}

export const TodoListItem: React.FC<TodoListItemProps> = ({
  todo,
  toggleComplete,
  onRemoveTodo,
  editTodo,
}) => {
  const [isEditOn, setIsEditOn] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>(todo.text);

  const onDelete = () => {
    onRemoveTodo(todo);
  };

  const onTodoUpdate = (e: any) => {
    let text = e.target.value;
    setInputText(text);
    editTodo(text);
  };

  const dropdownOptions: Array<Option> = [
    {
      value: "Delete",
      onClick: onDelete,
      color: "red",
    },
  ];
  return (
    <li className={todo.complete ? "todo-row completed" : "todo-row"}>
      <Flex>
        <CheckboxField
          labelHidden
          className="inline pt-1"
          label=""
          name=""
          value="yes"
          onChange={() => toggleComplete(todo)}
          checked={todo.complete}
        />
        {isEditOn ? (
          <TextField
            type="text"
            label=""
            labelHidden={true}
            value={inputText}
            onChange={(e) => onTodoUpdate(e)}
          />
        ) : (
          <span>{todo.text}</span>
        )}
      </Flex>
      <Dropdown options={dropdownOptions} />
    </li>
  );
};
