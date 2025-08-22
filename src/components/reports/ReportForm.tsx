import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  ScrollView, 
  TextInput,
  Image,
  TouchableOpacity,
  Alert 
} from "react-native";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import useCategories from "../../hooks/useCategory";
import useIncidentType from "../../hooks/useIncidentType";
import useZones from "../../hooks/useZone";
import useLocations from "../../hooks/useLocations";
import { Category } from "../../types/CategoryType";
import { Zone } from "../../types/ZoneType";
import { Location } from "../../types/LocationType";
import { IncidentType } from "../../types/IncidentType";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import useAppStore from "../../../store/useAppStore";
import { useCameraPermission } from "react-native-vision-camera";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";
import usePhotoStore from "../../../store/usePhotoStore";
import { useMutation } from "@tanstack/react-query";
import { fileReport } from "../../../util/FileReport";
import { useQueryClient } from "@tanstack/react-query";
import { Evidence } from "../../types/Evidence";
import { FileReport } from "../../types/FileReport";
import { Violator } from "../../types/ViolatorType";
import useInvolveViolator from "../../../store/useInvolveViolatorState";

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "report_form"
>;

const ReportForm = () => {
  const { user, token, base_url } = useAppStore();
  const { involveViolator, clearInvolveViolator } = useInvolveViolator();
  const { data: categories } = useCategories();
  const { data: incidentTypes } = useIncidentType();
  const { data: zones } = useZones();
  const { data: locations } = useLocations();
  const { hasPermission, requestPermission } = useCameraPermission();
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { evidence, clearEvidence } = usePhotoStore();
  const queryClient = useQueryClient()

  const [category, setCategory] = useState("");
  const [zone, setZone] = useState("");

  const [formData, setFormData] = useState<{
    incident_type_id: string;
    date: string;
    time: string;
    location_id: string;
    report_description: string;
    user_id: number | undefined;
    evidence: Evidence[];
    violators: Violator[];
  }>({
    incident_type_id: "",
    date: "",
    time: "",
    location_id: "",
    report_description: "",
    user_id: user.id,
    evidence: [],
    violators: [],
  });


  useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    evidence: evidence, 
    violators: involveViolator
  }));
}, [evidence, involveViolator]);

  const CreateReport = useMutation({
    mutationFn: fileReport,
    onSuccess: () => {
      Alert.alert("Success")
      setFormData({
        incident_type_id: "",
        date: "",
        time: "",
        location_id: "",
        report_description: "",
        user_id: user.id,
        evidence: [],
        violators: [],
      });
      clearEvidence();
      clearInvolveViolator();
      queryClient.invalidateQueries({ queryKey: ['reports']})
      navigation.goBack();
    }
  })

  const handleSubmit = () => {
    const payload: FileReport = {
      incident_type_id: formData.incident_type_id,
      date: formData.date,
      time: formData.time,
      location_id: formData.location_id,
      report_description: formData.report_description,
      user_id: formData.user_id,   
      evidence: evidence  ,
      violators: involveViolator
    }
     CreateReport.mutate({base_url, token, formData: payload});
  }

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmDate = (selectedDate: Date) => {
    setFormData((prev) => ({
      ...prev,
      date: selectedDate.toISOString().split("T")[0],
    }));
    hideDatePicker();
  };

  const handleConfirmTime = (selectedTime: Date) => {
    setFormData((prev) => ({
      ...prev,
      time: selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    hideTimePicker();
  };

  const filterIncident = incidentTypes?.filter(
    (incident: IncidentType) =>
      incident?.category_id?.toString() === category
  );

  const filterLocations = locations?.filter(
    (location: Location) => location?.zone_id?.toString() === zone
  );

   const handleOpenCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
     navigation.navigate("camera", { status: "evidence" });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Incident Report</Text>
        <Text style={styles.subHeader}>
          Fill out the form below to report an incident
        </Text>
      </View>

      {/* Category Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Incident Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            style={styles.picker}
          >
            <Picker.Item
              label="Select Incident Category"
              color="#888"
              value=""
            />
            {categories?.map((cat: Category) => (
              <Picker.Item
                key={cat.id}
                value={cat.id.toString()}
                label={cat.category_name}
                color="#000"
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Incident Type Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Incident Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.incident_type_id}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                incident_type_id: value,
              }))
            }
            style={styles.picker}
          >
            <Picker.Item label="Select Incident Type" color="#888" value="" />
            {filterIncident?.map((incident: IncidentType) => (
              <Picker.Item
                key={incident.id}
                value={incident.id.toString()}
                label={incident.incident_name}
                color="#000"
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Zone Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Zone</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={zone}
            onValueChange={(value) => setZone(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Zone" color="#888" value="" />
            {zones?.map((zone: Zone) => (
              <Picker.Item
                key={zone.id}
                value={zone.id.toString()}
                label={zone.zone_name}
                color="#000"
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Location Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Location</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.location_id}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                location_id: value,
              }))
            }
            style={styles.picker}
          >
            <Picker.Item label="Select Location" color="#888" value="" />
            {filterLocations?.map((location: Location) => (
              <Picker.Item
                key={location.id}
                value={location.id.toString()}
                label={location.location_name}
                color="#000"
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Date Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <Button title="📅 Pick a Date" onPress={showDatePicker} color="#007BFF" />
        <Text style={styles.value}>
          {formData.date ? formData.date : "No date selected"}
        </Text>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />
      </View>

      {/* Time Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Time</Text>
        <Button title="⏰ Pick a Time" onPress={showTimePicker} color="#007BFF" />
        <Text style={styles.value}>
          {formData.time ? formData.time : "No time selected"}
        </Text>
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
        />
      </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('violators_list')}>
            <Text>Add Violators</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.evidence}>
       {involveViolator.length > 0 ? (
          involveViolator.map((v, i) => (
            <View key={i}>
              {v.photo ? (
                <Image source={{ uri: v.photo }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, { justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ color: "#999" }}>No Photo</Text>
                </View>
              )}
              <Text>{v.last_name}</Text>
              <Text>{v.first_name}</Text>
              <Text>{v.age}</Text>
              <Text>{v?.zone?.zone_name}, {v.address}</Text>
            </View>
          ))
        ) : (
          <Text>No Involved Violator</Text>
        )}
        </View>

      {/* Report Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Report Description</Text>
        <TextInput
          placeholder="Write a detailed report description..."
          value={formData.report_description}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              report_description: text,
            }))
          }
          style={styles.textArea}
          multiline
        />
      </View>
          <TouchableOpacity style={styles.deleteBtn}
            onPress={() => clearEvidence()}
          >
            <Text style={styles.deleteBtnText}>Clear</Text>
          </TouchableOpacity>
     <View style={styles.evidence}>
       {evidence.length > 0 ? (
        evidence.map((img, i) => (
          <>
          <Image
             key={i}
              source={{ uri: "file://" + img.incident_evidence }}
              style={{ width: 100, height: 100, margin: 5 }}
          />
          </>
        ))
      ) : (
        <Text>No evidence photos yet</Text>
      )}
     </View>
      <TouchableOpacity onPress={handleOpenCamera} style={styles.button}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.btnText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReportForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    alignItems: "center",
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  field: {
    marginVertical: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
     photo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  value: {
    marginTop: 8,
    fontSize: 15,
    color: "#444",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    minHeight: 100,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'skyblue',
    borderRadius: 10,
    marginTop: 10
  },
  btnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
    buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  evidence: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
   deleteBtn: {
    height: 30,
    width: 80,
    backgroundColor: 'tomato',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF'
  }
});
