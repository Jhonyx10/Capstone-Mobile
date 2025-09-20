import React from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import LottieView from 'lottie-react-native';

interface BarChartComponentProps {
  labels: string[];
  data: number[];
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  labels,
  data,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth, labels.length);

  return (
    <View style={styles.container}>
      <View className="flex flex-row items-center">
        <LottieView
          style={{ width: 30, height: 30 }}
          source={require('../assets/animation/Chart.json')}
          autoPlay={true}
          loop={false}
        />
        <Text className="font-medium ml-1">Violation Chart Data</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={{
            labels: labels,
            datasets: [{ data: data }],
          }}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => 'green',
            labelColor: () => '#000000',
            propsForBackgroundLines: {
              stroke: '#e0e0e0',
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
  },
  chart: {
    borderRadius: 16,
  },
});

export default BarChartComponent;
