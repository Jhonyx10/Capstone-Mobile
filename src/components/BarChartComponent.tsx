import React from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import LottieView from 'lottie-react-native';
import { useColorScheme } from 'nativewind';

interface BarChartComponentProps {
  labels: string[];
  data: number[];
  title?: string;
}

// theme colors (same green as the gradient cards and the tab bar)
const GREEN = '#5D8736';
const GREEN_RGB = '93, 135, 54';

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  labels,
  data,
  title = 'Chart Data',
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenWidth = Dimensions.get('window').width;
  // fits the screen (minus the page margins); scrolls sideways if there are many bars
  const chartWidth = Math.max(screenWidth - 64, labels.length * 70);

  const background = isDark ? '#1E293B' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View className="flex flex-row items-center">
        <LottieView
          style={{ width: 30, height: 30 }}
          source={require('../assets/animation/Chart.json')}
          autoPlay={true}
          loop={false}
        />
        <Text className="font-medium ml-1 text-gray-800 dark:text-white">
          {title}
        </Text>
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
            backgroundColor: background,
            backgroundGradientFrom: background,
            backgroundGradientTo: background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(${GREEN_RGB}, ${opacity})`,
            labelColor: () => (isDark ? '#CBD5E1' : '#475569'),
            fillShadowGradient: GREEN,
            fillShadowGradientOpacity: 1,
            barPercentage: 0.6,
            propsForBackgroundLines: {
              stroke: isDark ? '#334155' : '#E5E7EB',
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
    borderRadius: 16,
    padding: 8,
  },
  chart: {
    borderRadius: 16,
  },
});

export default BarChartComponent;
