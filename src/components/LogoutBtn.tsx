import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { Logout } from "../../util/Logout";
import useAppStore from "../../store/useAppStore";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../Navigation";

type LogoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'welcome'>;
const LogoutBtn = () => {
    const navigation = useNavigation<LogoutScreenNavigationProp>();
    const setLogin = useAppStore(state => state.setLogin);
    const setUser = useAppStore(state => state.setUser);
    const setToken = useAppStore(state => state.setToken);
    const base_url = useAppStore(state => state.base_url);

    const LogoutMutation = useMutation({
        mutationFn: Logout,
        onSuccess: () => {
            setLogin(false);
            setUser({});
            setToken("");
            navigation.reset({
            index: 0,
            routes: [{ name: 'welcome' as never }],
        });
        },
        onError: (error) => {
            console.log(error)
        }
    })
    return(
        <>
        <TouchableOpacity 
        onPress={() => {
            LogoutMutation.mutate({ base_url, token: useAppStore.getState().token })
        }}
        style={styles.button}
        >
            <Text style={styles.btnTitle}>Logout</Text>
        </TouchableOpacity>
        </>
    )
}
export default LogoutBtn

const styles = StyleSheet.create({
    button: {
        width: 200,
        height: 50,
        borderRadius: 10,
        backgroundColor: 'red',
    },
    btnTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF'
    }
})