import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";

interface SearchBarProps {
  onPress?: () => void;
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

function SearchBar({
  onPress,
  onSearch,
  placeholder = "Search your favorite places",
  defaultValue = "",
}: SearchBarProps) {
  const [searchText, setSearchText] = useState(defaultValue);

  const handleSearch = () => {
    if (onSearch && searchText.trim()) {
      onSearch(searchText.trim());
    } else if (onPress) {
      onPress();
    }
  };

  const handleSubmitEditing = () => {
    handleSearch();
  };

  return (
    <View className="relative">
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder={placeholder}
        className="bg-gray-100 rounded-full py-5 px-4 pr-12 text-gray-700 hover:bg-gray-200 focus:bg-white focus:border focus:border-primary "
        placeholderTextColor="#9CA3AF"
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="search"
      />
      <TouchableOpacity
        className="absolute right-3 top-3 p-1 hover:bg-gray-300 rounded-full"
        activeOpacity={0.7}
        onPress={handleSearch}
      >
        <MagnifyingGlassIcon
          size={24}
          color="#6B7280"
          style={{
            marginRight: 5,
            marginTop: 2,
            opacity: 0.8,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

export default SearchBar;
