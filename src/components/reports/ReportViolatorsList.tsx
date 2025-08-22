import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import useAppStore from "../../../store/useAppStore";
import useInvolveViolator from "../../../store/useInvolveViolatorState";
import { Violator } from "../../types/ViolatorType";

const ReportViolatorsList = () => {
    const { violators } = useAppStore();
    const involveViolator = useInvolveViolator((state) => state.involveViolator);
    const setInvolveViolator = useInvolveViolator((state) => state.setInvolveViolator);

  const handleAddViolator = (violator: Violator) => {
    setInvolveViolator(violator);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Violator List</Text>
      {violators.map((violator) => {
        const isSelected = involveViolator.some((v) => v.id === violator.id);

        return (
          <TouchableOpacity
            key={violator.id}
            style={[
              styles.card,
              isSelected && { backgroundColor: "#e0f7fa", opacity: 0.6 }, // visual feedback
            ]}
            onPress={() => handleAddViolator(violator)}
            disabled={isSelected} // disables touch if already selected
          >
            {violator.photo ? (
              <Image source={{ uri: violator.photo }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "#999" }}>No Photo</Text>
              </View>
            )}
            <View style={styles.cardDetails}>
              <View>
                <Text>{violator.last_name}</Text>
                <Text>{violator.first_name}</Text>
              </View>
              <View>
                <Text>{violator.age}</Text>
                <Text>
                  {violator?.zone?.zone_name}, {violator.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default ReportViolatorsList;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  card: {
    flexDirection: "row",
    margin: 10,
    padding: 8,
    borderRadius: 8,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
