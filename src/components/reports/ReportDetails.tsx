import { View, Text, StyleSheet, ScrollView, Image } from "react-native"
import useAppStore from "../../../store/useAppStore"
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation";
import ReportViolators from "./ReportViolatorsDetails";

type ReportDetailsRouteProp = RouteProp<RootStackParamList, "report_details">;
const ReportDetails = () => {
    const { reports } = useAppStore()
    const route = useRoute<ReportDetailsRouteProp>();
    const { id } = route.params;

    const details = reports.find((report) => report.id === id)

    const formattedTime = new Date(`1970-01-01T${details?.time}`).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: true }
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Incident Report Details</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <Text style={styles.value}>{details?.incident_type?.category?.category_name}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Incident</Text>
                    <Text style={styles.value}>{details?.incident_type?.incident_name}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.sectionHalf}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{details?.date}</Text>
                    </View>
                    <View style={styles.sectionHalf}>
                        <Text style={styles.label}>Time</Text>
                        <Text style={styles.value}>{formattedTime}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>
                        {details?.location?.zone?.zone_name}, {details?.location?.location_name}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{details?.report_description}</Text>
                </View>

                <ReportViolators id={id}/>

                <View style={styles.section}>
                    <Text style={styles.label}>Evidences</Text>
                    <View style={styles.evidenceGrid}>
                        {details?.evidences?.map((evidence) => (
                            <View key={evidence.id} style={styles.evidenceCard}>
                                <Image 
                                    source={{ uri: evidence.file_url }}
                                    style={styles.photo}
                                />
                                {evidence.remarks && (
                                  <Text style={styles.remark}>{evidence.remarks}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}
export default ReportDetails

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#f9fafb",
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#111827",
    },
    section: {
        marginBottom: 14,
    },
    sectionHalf: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: "#111827",
    },
    evidenceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    evidenceCard: {
        width: 100,
        alignItems: "center",
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginBottom: 6,
        backgroundColor: "#e5e7eb",
    },
    remark: {
        fontSize: 12,
        color: "#374151",
        textAlign: "center",
    },
})
