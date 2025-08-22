import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { getViolators } from "../../../util/Violators"
import { useQuery } from "@tanstack/react-query"
import useAppStore from "../../../store/useAppStore"
import { Violator } from "../../types/ViolatorType"
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";
import { useEffect } from "react"

type ViolatorsDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "violator"
>;

const Violators = () => {
  const { base_url, token } = useAppStore()
  const setViolators = useAppStore((state) => state.setViolators);
  const navigation = useNavigation<ViolatorsDetailsNavigationProp>();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["violators"],
    queryFn: () => getViolators({ token, base_url }),
  })

  useEffect(() => {
    if(data) {
      setViolators(data)
    }
  }, [data])
  
  if (isLoading) return <View><Text>Loading....</Text></View>

  if (isError) return <View><Text>Error Fetching Data..</Text></View>

  const renderItem = ({ item }: { item: Violator }) => {
    return (
      <TouchableOpacity style={styles.card} 
        onPress={()=> navigation.navigate('violators_details', { id: item.id })}
      >
       {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.image} />
        ) : (
        <View style={[styles.image, { justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ color: "#999" }}>No Photo</Text>
        </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{item.last_name}, {item.first_name}</Text>
          <Text style={styles.text}>Age: {item.age}</Text>
          <Text style={styles.text}>Address: {item?.zone?.zone_name}, {item.address}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
  )
}

export default Violators

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    width: '100%'
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: "#555",
  },
})
