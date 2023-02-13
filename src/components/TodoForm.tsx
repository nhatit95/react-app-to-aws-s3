import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button, Flex, TextField } from "@aws-amplify/ui-react";

interface TodoFormProps {
  addTodo: AddTodo;
}

export const TodoForm: React.FC<TodoFormProps> = ({ addTodo }) => {
  const [newTodo, setNewTodo] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addTodo(newTodo);
    setNewTodo("");
  };

  return (
    <form className="mb-8">
      <Flex className="flex items-center justify-center">
        <TextField
          type="text"
          value={newTodo}
          placeholder="Add a todo"
          onChange={handleChange}
          label=""
          labelHidden={true}
          width="60%"
        />
        <Button
          className="ml-2"
          type="submit"
          variation="primary"
          onClick={handleSubmit}
        >
          Add
        </Button>
      </Flex>
    </form>
  );
};
