import { View, Text, StyleSheet } from "react-native"
import useResponseStore from "../../store/useResponseStore";

interface TimerProps {
  seconds: number;
  currentDistance: number;
}

const ResponseTimer = ({ seconds, currentDistance }: TimerProps) => {
  const { distance } = useResponseStore();

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>Time: {formatTime(seconds)}</Text>
      <Text style={styles.timerText}>Distance: {distance.toFixed(2)} Km</Text>
      <Text style={styles.timerText}>Current Distance: {currentDistance.toFixed(2)} Km</Text>
    </View>
  );
};

export default ResponseTimer

const styles = StyleSheet.create({
    timerContainer: {
    position: "absolute",
    top: 100,
    left: 60,
    transform: [{ translateX: -50 }], 
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
})