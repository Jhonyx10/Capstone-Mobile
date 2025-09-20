import { View, Text, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BarChartComponent from '../components/BarChartComponent';

const HomeScreen = () => {
  return (
    <View className="flex-1 relative dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={require('../assets/img/BarangayTanod.png')}
          className="absolute top-0 w-full h-1/2"
          resizeMode="cover"
        />
        <View className="mx-6 mt-10">
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
            }}
          >
            <View className="flex flex-row items-center justify-between ">
              <View className="items-center flex flex-row gap-2">
                <Image
                  source={require('../assets/img/Avatar.png')}
                  className=""
                />
                <View>
                  <Text className="text-white text-2xl font-medium leading-tight">
                    Jhon Doe
                  </Text>
                  <Text className="text-white text-xs leading-none">
                    Barangay Patrol
                  </Text>
                </View>
              </View>
              <View className="bg-white p-2 rounded-3xl">
                <LottieView
                  style={{ width: 30, height: 30 }}
                  source={require('../assets/animation/BellAnimation.json')}
                  autoPlay={true}
                  loop={false}
                />
              </View>
            </View>
            <View className="h-2 w-full rounded-xl items-center bg-white mt-4" />
            <View className="mx-4 mt-2">
              <Text className="text-white">
                All Incident Reports This month
              </Text>
              <View className="flex flex-row justify-between items-center">
                <View className="flex flex-row items-center ">
                  <LottieView
                    style={{ width: 50, height: 50 }}
                    source={require('../assets/animation/Warning.json')}
                    autoPlay={true}
                    loop={false}
                  />
                  <Text className="text-5xl text-white font-semibold">109</Text>
                </View>

                <View className="flex flex-row">
                  <Text className=" ml-2 p-1 bg-lime-400 rounded-lg">+22</Text>
                  <View className="ml-1.5">
                    <Text className="text-xs text-white">ang na dagdagan</Text>
                    <Text className="text-xs text-white">
                      sa iyong na report
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-white mt-2">
                87 Ang iyong na report in last month
              </Text>
            </View>
          </LinearGradient>
          <BarChartComponent
            labels={['Jan', 'Feb', 'Mar', 'Apr']}
            data={[20, 45, 28, 80]}
          />
        </View>
      </ScrollView>
    </View>
  );
};
export default HomeScreen;
