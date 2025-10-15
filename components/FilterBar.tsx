import React from "react";
import { FlatList, View } from "react-native";
import FilterButton from "./FilterButton";

interface FilterBarProps {
  tabs: readonly string[];
  selectedTab: string;
  onTabPress: (tab: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  tabs,
  selectedTab,
  onTabPress,
}) => {
  return (
    <View className="px-4 mb-6">
      <FlatList
        data={tabs}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <FilterButton
            filter={item}
            isActive={item === selectedTab}
            onPress={() => onTabPress(item)}
          />
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
    </View>
  );
};

export default FilterBar;
