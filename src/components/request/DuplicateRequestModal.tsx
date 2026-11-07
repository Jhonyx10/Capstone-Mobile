import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Icon from '../Icon';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const DuplicateRequestModal = ({ visible, onClose }: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 items-center justify-center bg-black/50 px-6">
      <View className="w-full items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
        <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <Icon name="alert-triangle" color="#EF4444" size={22} />
        </View>

        <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
          Request already sent
        </Text>
        <Text className="mb-5 text-center text-[#5B5B5B] dark:text-gray-300">
          There is already a request for this type of incident within 50 meters
          of your location. A tanod has been notified and help is on the way.
        </Text>

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          className="w-full items-center rounded-lg bg-[#5D8736] p-4"
        >
          <Text className="font-bold text-white">Okay</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default DuplicateRequestModal;
