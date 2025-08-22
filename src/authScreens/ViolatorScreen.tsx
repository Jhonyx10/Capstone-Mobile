import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation"; 
import Violators from '../components/violators/Violators';

const ViolatorScreen = () => {
    type ViolatorFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'violator'>;
    const navigation = useNavigation<ViolatorFormNavigationProp>();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Violators</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('violator_form')}>
                    <Text style={styles.btnTitle}>+ Add Violator</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
                <Violators />
            </View>
        </View>
    )
}
export default ViolatorScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'skyblue',
    },
    btnTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "#fff",
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
});
