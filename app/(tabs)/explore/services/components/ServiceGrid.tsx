import Card from "@/components/Card";
import { Service } from "@/types/serviceTypes";
import React from "react";
import { Dimensions, FlatList } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface CardItem {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
}

interface ServiceGridProps {
  services: Service[];
  maxItems?: number;
  onItemPress: (serviceId: string) => void;
}

const convertServiceToCardItem = (service: Service): CardItem => ({
  id:
    typeof service.serviceId === "number"
      ? service.serviceId
      : Number(service.serviceId),
  title: service.serviceName,
  subtitle:
    service.locationBased.city || service.locationBased.formattedAddress,
  rating: 4.5, // Default rating
  image: service.mainImageUrl
    ? `http://192.168.1.9:8080${service.mainImageUrl}`
    : "https://via.placeholder.com/160x96/e2e8f0/64748b?text=No+Image",
});

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  maxItems,
  onItemPress,
}) => {
  const displayServices = maxItems ? services.slice(0, maxItems) : services;

  return (
    <FlatList
      data={displayServices}
      keyExtractor={(item) => item.serviceId.toString()}
      numColumns={2}
      columnWrapperStyle={
        displayServices.length > 1
          ? { justifyContent: "space-between" }
          : undefined
      }
      renderItem={({ item }) => (
        <Card
          item={convertServiceToCardItem(item)}
          width={CARD_WIDTH}
          onPress={() => onItemPress(item.serviceId.toString())}
        />
      )}
      contentContainerStyle={{ paddingBottom: 16 }}
      scrollEnabled={false}
    />
  );
};

export default ServiceGrid;
