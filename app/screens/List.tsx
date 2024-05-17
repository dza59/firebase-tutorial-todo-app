import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface Todo {
  title: string;
  done: boolean;
  id: string;
}

const List = ({ navigation }: any) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState('');

  useEffect(() => {
    const todoRef = collection(FIRESTORE_DB, 'todos');
    const subscriber = onSnapshot(todoRef, (snapshot) => {
      const loadedTodos: Todo[] = [];
      snapshot.docs.forEach((doc) => {
        loadedTodos.push({ id: doc.id, ...doc.data() } as Todo);
      });
      setTodos(loadedTodos);
    });

    return () => subscriber();
  }, []);

  const addTodo = async () => {
    const docRef = await addDoc(collection(FIRESTORE_DB, 'todos'), {
      title: todo,
      done: false,
    });
    console.log('Document written with ID: ', docRef.id);
    setTodo('');
  };

  const toggleDone = async (item: Todo) => {
    const ref = doc(FIRESTORE_DB, 'todos', item.id);
    await updateDoc(ref, { done: !item.done });
  };

  const deleteTodo = async (item: Todo) => {
    const ref = doc(FIRESTORE_DB, 'todos', item.id);
    await deleteDoc(ref);
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <View className='flex-row items-center justify-between border p-2.5 my-2.5 rounded bg-red-50'>
      <TouchableOpacity
        onPress={() => toggleDone(item)}
        className='flex-row items-center justify-between w-full'
      >
        {item.done ? (
          <Ionicons name='checkmark-circle' size={24} color='green' />
        ) : (
          <Entypo name='circle' size={24} color='black' />
        )}
        <Text className='flex-1 px-1'>{item.title}</Text>
        <Ionicons
          name='trash-bin-outline'
          size={24}
          color='red'
          onPress={() => deleteTodo(item)}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className='mx-5'>
      <View className='flex-row items-center my-5'>
        <TextInput
          className='flex-1 h-10 border rounded p-2.5'
          placeholder='Add some Todo text'
          onChangeText={(text) => setTodo(text)}
          value={todo}
        />
        <Button
          className='bg-blue-500 text-white ml-2 px-4 py-2 rounded'
          title='Add Todo'
          onPress={addTodo}
          disabled={todo === ''}
        />
      </View>
      {todos.length > 0 && (
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default List;
