import { View, Text, StyleSheet, Image } from "react-native"
import { useQuery } from "@tanstack/react-query"
import { getReportViolators } from "../../../util/getReportViolators"
import useAppStore from "../../../store/useAppStore"

interface ReportViolatorsProps {
  id: number;
}

const ReportViolators = ({ id }: ReportViolatorsProps) => {
  const { base_url, token } = useAppStore()
    
  const { data, isLoading, isError } = useQuery({
    queryKey: ['report_violators', id],
    queryFn: () => getReportViolators({ base_url, token, report_id: id })
  })

  if (isLoading) {
    return <Text style={styles.message}>Loading violators...</Text>
  }

  if (isError) {
    return <Text style={styles.message}>Failed to load violators.</Text>
  }

  if (!data || data.length === 0) {
    return <Text style={styles.message}>No violators recorded.</Text>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Violators</Text>
      {data.map((item: any) => (
        <View key={item.id} style={styles.violatorCard}>
          <Image 
            source={{ uri: item.violators.photo }}
            style={styles.photo}
          />
          <View style={styles.info}>
            <Text style={styles.name}>
              {item.violators.first_name} {item.violators.last_name}
            </Text>
            <Text style={styles.details}>Age: {item.violators.age}</Text>
            <Text style={styles.details}>Address: {item.violators.address}</Text>
            <Text style={styles.details}>Zone: {item.violators.zone.zone_name}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

export default ReportViolators

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 6,
  },
  violatorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photo: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: "#e5e7eb",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
    color: "#4b5563",
  },
})
