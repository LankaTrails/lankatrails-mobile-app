import Card from "@/components/Card";
import { Service } from "@/types/serviceTypes";
import React from "react";
import { Dimensions, FlatList } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const BASE_URL = process.env.EXPO_PUBLIC_URL;

interface CardItem {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
  price?: string; // Price amount
  priceType?: string; // Price type description
}

interface ServiceGridProps {
  services: Service[];
  maxItems?: number;
  onItemPress: (serviceId: string) => void;
}

const convertServiceToCardItem = (service: Service): CardItem => {
  console.log("🔄 convertServiceToCardItem called with service:", {
    serviceId: service?.serviceId,
    serviceName: service?.serviceName,
    category: service?.category,
    locationBased: service?.locationBased,
    mainImageUrl: service?.mainImageUrl,
    price: service?.price,
    priceType: service?.priceType,
  });

  // Format price display
  let priceAmount = undefined;
  let priceTypeText = undefined;
  if (service?.price && service?.priceType) {
    const priceTypeMap: Record<string, string> = {
      FIXED: "Fixed",
      PER_PERSON: "per person",
      PER_KM: "per km",
      PER_HOUR: "per hour",
      PER_DAY: "per day",
      PER_NIGHT: "per night",
      PER_WEEK: "per week",
      PER_MONTH: "per month",
    };
    const typeDisplay =
      priceTypeMap[service.priceType] ||
      service.priceType.toLowerCase().replace("_", " ");

    priceAmount = `LKR ${service.price}`;
    priceTypeText = service.priceType === "FIXED" ? "" : typeDisplay;
  }

  const cardItem = {
    id:
      typeof service?.serviceId === "number"
        ? service.serviceId
        : Number(service?.serviceId || 0),
    title: service?.serviceName || "Unknown Service",
    subtitle:
      service?.locationBased?.city ||
      service?.locationBased?.formattedAddress ||
      service?.category?.replace("_", " ") ||
      "Service",
    rating: 4.5, // Default rating
    image: service?.mainImageUrl
      ? service.mainImageUrl.startsWith("http")
        ? service.mainImageUrl
        : `${BASE_URL}${service.mainImageUrl}`
      : "https://via.placeholder.com/160x96/e2e8f0/64748b?text=No+Image",
    price: priceAmount,
    priceType: priceTypeText,
  };

  console.log("✅ convertServiceToCardItem result:", cardItem);

  return cardItem;
};

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  maxItems,
  onItemPress,
}) => {
  const displayServices = maxItems ? services.slice(0, maxItems) : services;

  console.log("📋 ServiceGrid rendered with:", {
    totalServices: services?.length || 0,
    displayServices: displayServices?.length || 0,
    maxItems,
    hasOnItemPress: typeof onItemPress === "function",
  });

  return (
    <FlatList
      data={displayServices}
      keyExtractor={(item) => {
        const id = item?.serviceId?.toString() || "unknown";
        console.log("🔑 ServiceGrid keyExtractor for item:", {
          serviceId: item?.serviceId,
          serviceName: item?.serviceName,
          category: item?.category,
        });
        return id;
      }}
      numColumns={2}
      columnWrapperStyle={
        displayServices.length > 1
          ? { justifyContent: "space-between" }
          : undefined
      }
      renderItem={({ item }) => {
        console.log("🎴 ServiceGrid renderItem for:", {
          serviceId: item?.serviceId,
          serviceName: item?.serviceName,
          category: item?.category,
        });

        return (
          <Card
            item={convertServiceToCardItem(item)}
            width={CARD_WIDTH}
            onPress={() => {
              console.log("👆 ServiceGrid Card onPress triggered for:", {
                serviceId: item?.serviceId,
                serviceName: item?.serviceName,
                category: item?.category,
              });
              onItemPress(item.serviceId.toString());
            }}
          />
        );
      }}
      contentContainerStyle={{ paddingBottom: 16 }}
      scrollEnabled={false}
    />
  );
};

export default ServiceGrid;
