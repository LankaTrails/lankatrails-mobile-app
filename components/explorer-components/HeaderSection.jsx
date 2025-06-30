import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Heart, Share } from 'lucide-react-native';
import { router } from 'expo-router';

import PropTypes from 'prop-types';

const HeaderSection = ({ isFavourite, handleFavourite, handleShare }) => {
  return (
    <View className="flex-row items-center justify-between mt-5 mb-2 px-4">
      <TouchableOpacity onPress={() => router.push('/explore')}>
        <ArrowLeft size={34} color="#008080" />
      </TouchableOpacity>
      <Text className="text-primary text-3xl font-bold">Galle</Text>
      <View className="flex-row">
        <TouchableOpacity className="mr-4" onPress={handleFavourite}>
          <Heart size={30} color="#008080" fill={isFavourite ? '#008080' : 'none'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Share size={30} color="#008080" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

HeaderSection.propTypes = {
  isFavourite: PropTypes.bool.isRequired,
  handleFavourite: PropTypes.func.isRequired,
  handleShare: PropTypes.func.isRequired,
};

export default HeaderSection;
