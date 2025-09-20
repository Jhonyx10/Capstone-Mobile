import { View, Text, StyleSheet } from 'react-native';

const Hotline = () => {
    return(
        <View style={styles.container}>
            <Text>Hotline Page</Text>
        </View>
    )
}
export default Hotline;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})