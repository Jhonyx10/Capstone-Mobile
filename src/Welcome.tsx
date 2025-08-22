import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./Navigation"; // ✅ import the type

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'welcome'
>;

const Welcome = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    return(
        <View style={styles.container}>
            <LottieView
                style={styles.lottie}
                source={require('../assets/animation/doctors.json')}
                autoPlay
                loop
            />
            <View style={styles.content}>
                <Text style={styles.title}>Barangay Igpit Tanod</Text>
                <TouchableOpacity  onPress={() => navigation.navigate("login")} style={styles.button}>
                    <Text style={styles.btnTitle}>Login</Text>
                </TouchableOpacity>
            </View>
    </View>
    )
}
export default Welcome

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 300,
    height: 200,
  },
  content: {
    marginTop: 5,
    width: '100%',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic'
  },
  button: {
    width: '70%',
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});