import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { violatorsDetails } from "../../../util/ViolatorsDetails";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation";
import useAppStore from "../../../store/useAppStore";
import { Report } from "../../types/ReportType";

type ViolatorsDetailsRouteProp = RouteProp<RootStackParamList, "violators_details">;

const ViolatorsDetails = () => {
  const { base_url, token } = useAppStore();
  const route = useRoute<ViolatorsDetailsRouteProp>();
  const { id } = route.params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["violators_details", id],
    queryFn: () => violatorsDetails({ base_url, token, violators_id: id }),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load violator details.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: data.photo }} style={styles.image} />

        <Text style={styles.name}>
          {data.last_name}, {data.first_name}
        </Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>{data.age}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Zone:</Text>
          <Text style={styles.value}>{data.zone?.zone_name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.address}</Text>
        </View>
      </View>

<Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>
  Violator's Records
</Text>

  {data.reports && data.reports.length > 0 ? (
    data.reports.map((report: Report) => (
      <TouchableOpacity key={report.id} style={styles.reportCard}>
        <Text style={styles.reportTitle}>Report #{report.id}</Text>
        <Text style={styles.reportDesc}>{report.report_description}</Text>
        <Text style={styles.reportMeta}>
          Date: {report.date} | Time: {report.time}
        </Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text style={styles.noReports}>No records found</Text>
  )}

    </ScrollView>
  );
};

export default ViolatorsDetails;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: "center",
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  infoSection: {
    flexDirection: "row",
    marginBottom: 10,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#555",
    width: 80,
  },
  value: {
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
  },
  reportCard: {
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 15,
  marginVertical: 8,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
},
reportTitle: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
  color: "#333",
},
reportDesc: {
  fontSize: 14,
  color: "#555",
  marginBottom: 5,
},
reportMeta: {
  fontSize: 12,
  color: "#888",
},
noReports: {
  fontSize: 14,
  color: "#777",
  textAlign: "center",
  marginTop: 10,
},
});
