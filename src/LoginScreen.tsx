import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./Navigation"; 
import useAppStore from '../store/useAppStore';
import { Mutation, useMutation } from '@tanstack/react-query';
import { Login } from '../util/Login';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'login'>;

const LoginScreen = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const navigation = useNavigation<LoginScreenNavigationProp>();

    const setLogin = useAppStore(state => state.setLogin);
    const setUser = useAppStore(state => state.setUser);
    const setToken = useAppStore(state => state.setToken);
    const base_url = useAppStore(state => state.base_url);


  const LoginMutation = useMutation({
    mutationFn: Login,
    onSuccess: async (data) => {
      setToken(data.token);
      setUser(data.user);
      setLogin(true);
      navigation.navigate('authTabs')
    },
    onError: (error: any) => {
      console.error("Login failed:", error.message);
    },
  });

  const handleLogin = () => {
    LoginMutation.mutate({ base_url, name, password });
  };

  
  return (
    <KeyboardAvoidingView  
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
      enabled
    >
      <Text style={styles.inputTitle}>Login Page</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Username</Text>
        <TextInput 
          value={name}
          onChangeText={setName}
          autoCapitalize='none'
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Password</Text>
        <TextInput 
          value={password}
          onChangeText={setPassword}
          autoCapitalize='none'
          style={styles.input}
        />
      </View>
     <TouchableOpacity 
      style={styles.button} 
      onPress={handleLogin} 
      disabled={LoginMutation.isPending}
    >
      {LoginMutation.isPending 
        ? <ActivityIndicator color="#fff" /> 
        : <Text style={styles.btnTitle}>Login</Text>
      }
    </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f4f4',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
    padding: 6,
    margin: 10,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 6,
    margin: 10,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'skyblue',
  },
  btnTitle: {
    color: '#fff',
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});
