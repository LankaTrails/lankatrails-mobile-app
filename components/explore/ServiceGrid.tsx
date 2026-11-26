import { BACKEND_URL } from "@/utils/config";
import Card from "@/components/Card";
import { Service } from "@/types/serviceTypes";
import React from "react";
import { Dimensions, FlatList } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const BASE_URL = BACKEND_URL;

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

  // Format price display
  let priceAmount = undefined;
  let priceTypeText = undefined;
  const servicePrice = service?.prices?.[0]?.amount;
  const servicePriceType = service?.prices?.[0]?.priceType;

  if (servicePrice && servicePriceType) {
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
      priceTypeMap[servicePriceType] ||
      servicePriceType.toLowerCase().replace("_", " ");

    priceAmount = `LKR ${servicePrice}`;
    priceTypeText = servicePriceType === "FIXED" ? "" : typeDisplay;
  }

  const cardItem = {
    id:
      typeof service?.serviceId === "number"
        ? service.serviceId
        : Number(service?.serviceId || 0),
    title: service?.serviceName || "Unknown Service",
    subtitle:
      service?.locations?.[0]?.city ||
      service?.locations?.[0]?.formattedAddress ||
      service?.category?.replace("_", " ") ||
      "Service",
    rating: (service as any)?.averageRating || 0, // Use actual average rating
    image: service?.mainImageUrl
      ? service.mainImageUrl.startsWith("http")
        ? service.mainImageUrl
        : `${BASE_URL}${service.mainImageUrl}`
      : "https://via.placeholder.com/160x96/e2e8f0/64748b?text=No+Image",
    price: priceAmount,
    priceType: priceTypeText,
  };


  return cardItem;
};

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  maxItems,
  onItemPress,
}) => {
  const displayServices = maxItems ? services.slice(0, maxItems) : services;


  return (
    <FlatList
      data={displayServices}
      keyExtractor={(item) => {
        const id = item?.serviceId?.toString() || "unknown";
        return id;
      }}
      numColumns={2}
      columnWrapperStyle={
        displayServices.length > 1
          ? { justifyContent: "space-between" }
          : undefined
      }
      renderItem={({ item }) => {

        return (
          <Card
            item={convertServiceToCardItem(item)}
            width={CARD_WIDTH}
            onPress={() => {
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
