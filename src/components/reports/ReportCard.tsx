import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import useAppStore from '../../../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../../../util/Report';
import { Report } from '../../types/ReportType';
import { useNavigation } from "@react-navigation/native";
import { useEffect } from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";

type ReportDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "report"
>;

const ReportCard = () => {
    const { base_url, token } = useAppStore();
    const setReport = useAppStore((state) => state.setReport)
    const navigation = useNavigation<ReportDetailsNavigationProp>();

    const { data, isError, isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: () => getReports({ base_url, token }),
    });

    useEffect(() => {
        if(data) {
            setReport(data)
        }
    }, [data])
    
    if (isLoading) {
        return <Text style={styles.loadingText}>Fetching Reports...</Text>;
    }

    if (isError) {
        return <Text style={styles.errorText}>Error fetching reports.</Text>;
    }

    const renderReports = ({ item }: { item: Report }) => {
        const formattedTime = new Date(`1970-01-01T${item?.time}`).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: true }
        );

        return(
            <TouchableOpacity style={styles.card} activeOpacity={0.8} 
            onPress={() => navigation.navigate('report_details', {id: item.id})}
            >
            <View style={styles.cardHeader}>
                <Text style={styles.categoryText}>
                    {item?.incident_type?.category?.category_name || "Unknown Category"}
                </Text>
                <Text style={styles.incidentText}>
                    {item?.incident_type?.incident_name || "Unknown Incident"}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.detailText}>📅 {item.date || "No Date"}</Text>
                <Text style={styles.detailText}>⏰ {formattedTime || "No Time"}</Text>
                <Text style={styles.detailText}>
                    📍 {item?.location?.zone?.zone_name || "Unknown Zone"},{" "}
                    {item?.location?.location_name || "Unknown Location"}
                </Text>
            </View>
        </TouchableOpacity>
        )
    };

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReports}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
};

export default ReportCard;

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2c3e50",
    },
    incidentText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#e74c3c",
        marginTop: 2,
    },
    cardBody: {
        marginTop: 8,
    },
    detailText: {
        fontSize: 13,
        color: "#555",
        marginTop: 4,
    },
    loadingText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 14,
        color: "#888",
    },
    errorText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 14,
        color: "red",
        fontWeight: "500",
    },
});
