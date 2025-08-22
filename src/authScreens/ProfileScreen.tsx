import { View, Text, StyleSheet } from 'react-native';
import useAppStore from '../../store/useAppStore';
import LogoutBtn from '../components/LogoutBtn';
const ProfileScreen = () => {
    const { user } = useAppStore()
    
    return(
        <View style={styles.container}>
            <Text>Profile Page</Text>
            <Text>{user.name}</Text>
            <Text>{user.email}</Text>
            <Text>{user.role}</Text>
            <LogoutBtn/>
        </View>
    )
}
export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})