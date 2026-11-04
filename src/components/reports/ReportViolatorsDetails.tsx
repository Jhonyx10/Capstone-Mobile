import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getReportViolators } from '../../../util/getReportViolators';
import useAppStore from '../../../store/useAppStore';
import Enter from '../Enter';

interface ReportViolatorsProps {
  id: number;
}

const ReportViolators = ({ id }: ReportViolatorsProps) => {
  const { base_url, token } = useAppStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['report_violators', id],
    queryFn: () => getReportViolators({ base_url, token, report_id: id }),
  });

  return (
    <View>
      <Text className="mb-3 text-[15px] font-bold text-gray-800 dark:text-white">
        Violators
      </Text>

      {isLoading ? (
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#5D8736" />
          <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Loading violators...
          </Text>
        </View>
      ) : isError ? (
        <Text className="text-sm text-red-500">Failed to load violators.</Text>
      ) : !data || data.length === 0 ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          No violators recorded.
        </Text>
      ) : (
        <View className="gap-2">
          {/* rows arrive after the data loads, so they come in one by one */}
          {data.map((item: any, i: number) => {
            const v = item.violators;
            return (
              <Enter
                key={item.id}
                index={i}
                className="flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-slate-700"
              >
                {v?.photo ? (
                  <Image
                    source={{ uri: v.photo }}
                    className="h-14 w-14 rounded-full bg-gray-200"
                  />
                ) : (
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
                    <Text className="text-sm font-bold text-lime-700 dark:text-lime-400">
                      {(v?.first_name?.[0] ?? '?').toUpperCase()}
                      {(v?.last_name?.[0] ?? '').toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-semibold text-gray-800 dark:text-white">
                    {v?.first_name} {v?.last_name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Age {v?.age ?? '—'}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {v?.zone?.zone_name ?? 'No zone'}
                    {v?.address ? `, ${v.address}` : ''}
                  </Text>
                </View>
              </Enter>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ReportViolators;
