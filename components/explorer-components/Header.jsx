import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const Header = ({ title = '', onBack }) => {
  return (
    <View className="bg-white shadow-sm">
      <View className="px-6 mt-6  flex-row items-center justify-between ">
        <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
          className="flex-row items-center"
        >
          <ArrowLeft size={36} color="#008080" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-primary">{title}</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );
};

export default Header;
