import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import Map from "../../components/maps/RequestLocation";
import RequestForm from "../../components/request/RequestForm";
import useAppStore from "../../../store/useAppStore";

const Home = () => {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const { user } = useAppStore();

  return (
    <View style={styles.container}>
      <Map onLocationChange={(coords) => setUserCoords(coords)} />
      {/* {userCoords && (
        <Text>
          Current Location: {userCoords[1]}, {userCoords[0]}
        </Text>
      )} */}
       <RequestForm userCoords={userCoords} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
