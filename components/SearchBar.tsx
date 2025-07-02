import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function SearchBar({ onPress }: { onPress?: () => void }) {
  const [searchText, setSearchText] = useState('');

  return (
    <View className="relative mb-4">
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search your favorite places"
                className="bg-gray-100 rounded-full py-5 px-4 pr-12 text-gray-700 hover:bg-gray-200 focus:bg-white focus:border focus:border-primary "
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                className="absolute right-3 top-3 p-1 hover:bg-gray-300 rounded-full"
                activeOpacity={0.7}
                onPress={onPress}
              >
                <MagnifyingGlassIcon size={24} color="#6B7280" style={{
                  marginRight: 5,
                  marginTop: 2,
                  opacity: 0.8,
                }} />
              </TouchableOpacity>
            </View>
  )
}

export default SearchBar