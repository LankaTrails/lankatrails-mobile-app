import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const Header = ({ title = '', onBack }) => {
  return (
    <View className="bg-white shadow-sm">
      <View className=" mt-16 mb-2 px-4  flex-row items-center justify-between ">
        <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
          className="flex-row items-center"
        >
          <ArrowLeft size={36} color="#008080" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-primary">{title}</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );
};

export default Header;
