import { Text, View, StyleSheet, ActivityIndicator, Alert,TouchableOpacity } from "react-native";
import useAppStore from "../../../store/useAppStore";
import { Dropdown } from "react-native-element-dropdown";
import useCategories from "../../hooks/useCategory";
import { useState } from "react";
import { Category } from "../../types/CategoryType";
import { useMutation, QueryClient } from "@tanstack/react-query";
import { sendRequest } from "../../../util/postRequest";
import { RequestResponse } from "../../types/RequestResponseType";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";

type ResponseTrackerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
   "response_tracker"
>;

interface coordinateProps {
    userCoords: [number, number] | null;
}

const RequestForm = ({ userCoords }: coordinateProps) => {
    const navigation = useNavigation<ResponseTrackerScreenNavigationProp>()
    const { user, base_url, token } = useAppStore()
    const setStatus = useAppStore((state) => state.setStatus)
    const { data: categories = [], isLoading } = useCategories()
    const [formData, setFormData ] = useState<RequestResponse>({
        user_id: user?.id ?? null,
        category_id: "",
        latitude: userCoords?.[1] ?? null,
        longitude: userCoords?.[0] ?? null,
        })
      const queryClient = new QueryClient()

    const requestMutation = useMutation({
        mutationFn: (payload: RequestResponse) =>
        sendRequest({ base_url, token, formData: payload }),
        onSuccess: () => {
            setFormData((prev) => ({ ...prev, category_id: "" }));
            queryClient.invalidateQueries({ queryKey: ['request'] })
            setStatus(true);
            Alert.alert("success!")
            if (user?.id) {
              navigation.navigate("response_tracker", { requestId: user.id });
            }
        },
        });

    const handleSubmit = () => {
        if (!user?.id || !userCoords) {
            Alert.alert("User location not ready yet.");
            return;
        }
        if (!formData.category_id) {
            Alert.alert("Please select a category.");
            return;
        }

        const payload: RequestResponse = {
            user_id: user.id,
            category_id: formData.category_id,
            latitude: userCoords[1],
            longitude: userCoords[0],
        };

        requestMutation.mutate(payload);
        };


    return (
        <View style={styles.container}>
            <Dropdown
                style={styles.dropdown}
                data={categories}
                labelField="category_name"
                valueField="id"
                placeholder="Select Category"
                onChange={(item: Category) =>
                setFormData((prev) => ({ ...prev, category_id: item.id.toString() }))
                }
            />
             {isLoading && <Text>Loading categories...</Text>}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Emergency Request</Text>
                </TouchableOpacity>
        </View>
    )
}
export default RequestForm

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  dropdown: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: 'tomato',
    height: 180,
    width: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
