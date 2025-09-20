import { View } from "react-native";
import ResponseTracker from "../../components/maps/ResponseTracker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";

type Props = NativeStackScreenProps<RootStackParamList, "response_tracker">;

const TanodTracker = ({ route }: Props) => {
  const { requestId } = route.params; 
  return (
    <View style={{ flex: 1 }}>
      <ResponseTracker requestId={requestId} />
    </View>
  );
};

export default TanodTracker;
