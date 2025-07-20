import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/* 
  Props:
    - title?: string
    - onBack?: () => void
*/

const HeaderSection = ({
  title = '',
  onBack,
}) => {
  return (
    <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        className="flex-row items-center"
      >
        <ArrowLeft size={34} color="#008080" />
      </TouchableOpacity>

      {/* Title */}
      <Text
        className="text-primary text-3xl font-bold mx-2 flex-1 text-center"
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Empty space to maintain layout balance */}
      <View style={{ width: 34 }} />
    </View>
  );
};

export default HeaderSection;
