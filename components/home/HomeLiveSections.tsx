import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { getMyTrips } from "@/services/tripService";
import { searchServicesByLocation } from "@/services/serviceSearch";
import { serviceDetailHref } from "@/utils/navigationHelpers";
import { fileUrl } from "@/utils/config";
import type { Trip } from "@/types/triptypes";

const DEFAULT_CITY = "Galle";

interface FeaturedItem {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  rating?: number;
  onPress: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

/** Upcoming trips and services near the next destination, both from the backend. */
export default function HomeLiveSections() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [featured, setFeatured] = useState<FeaturedItem[] | null>(null);
  const [featuredCity, setFeaturedCity] = useState(DEFAULT_CITY);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        let upcoming: Trip[] = [];
        try {
          const res = await getMyTrips();
          const today = new Date().toISOString().slice(0, 10);
          upcoming = (res.data ?? [])
            .filter((t) => (t.endDate ?? t.startDate) >= today)
            .sort((a, b) => a.startDate.localeCompare(b.startDate));
        } catch {
          // the section shows its empty state
        }
        if (!active) return;
        setTrips(upcoming);

        const next = upcoming[0];
        const city = next?.locations?.[0]?.city || next?.startLocation?.city || DEFAULT_CITY;
        setFeaturedCity(city);
        try {
          const res = await searchServicesByLocation(city);
          const services = (res.data?.services ?? []).map<FeaturedItem>((s) => ({
            key: `s-${s.serviceId}`,
            title: s.serviceName,
            subtitle: s.locations?.[0]?.city ?? city,
            image: fileUrl(s.mainImageUrl),
            rating: s.averageRating,
            onPress: () => {
              const href = serviceDetailHref(s.serviceId, s.category);
              if (href) router.push(href);
            },
          }));
          const providers = (res.data?.providers ?? []).map<FeaturedItem>((p) => ({
            key: `p-${p.providerId}-${p.category}`,
            title: p.businessName,
            subtitle: `${p.category?.replace("_", " ").toLowerCase()} · ${p.location?.city ?? city}`,
            image: fileUrl(p.coverImageUrl),
            onPress: () =>
              router.push({
                pathname: "/explore/services/provider/[providerId]",
                params: { providerId: String(p.providerId), category: p.category, city },
              }),
          }));
          if (active) setFeatured([...services, ...providers].slice(0, 10));
        } catch {
          if (active) setFeatured([]);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View>
      <View style={{ marginHorizontal: 16, marginTop: 28 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#1f2937" }}>Your trips</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/trips")}>
            <Text style={{ color: "#008080", fontWeight: "600" }}>See all</Text>
          </TouchableOpacity>
        </View>
        {trips === null ? (
          <ActivityIndicator style={{ marginVertical: 24 }} color="#008080" />
        ) : trips.length === 0 ? (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/trips")}
            style={{ marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: "white", flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="add-circle-outline" size={28} color="#008080" />
            <Text style={{ marginLeft: 12, color: "#374151", flex: 1 }}>
              No upcoming trips yet. Plan one and add stays, rides and activities to it.
            </Text>
          </TouchableOpacity>
        ) : (
          trips.slice(0, 3).map((trip) => {
            const days = daysUntil(trip.startDate);
            return (
              <TouchableOpacity
                key={trip.tripId}
                onPress={() => router.push(`/trips/${trip.tripId}`)}
                style={{ marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: "white", flexDirection: "row", alignItems: "center" }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#e6f2f2", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="map-outline" size={22} color="#008080" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#1f2937" }}>{trip.tripName}</Text>
                  <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {trip.numberOfAdults + (trip.numberOfChildren ?? 0)} travellers
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: days <= 0 ? "#16a34a" : "#008080" }}>
                  {days <= 0 ? "On now" : `In ${days} day${days === 1 ? "" : "s"}`}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={{ marginTop: 28 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#1f2937", marginHorizontal: 16 }}>
          Popular in {featuredCity}
        </Text>
        <Text style={{ fontSize: 14, color: "#6b7280", marginHorizontal: 16, marginBottom: 12 }}>
          Stays, rides, food and experiences from LankaTrails providers
        </Text>
        {featured === null ? (
          <ActivityIndicator style={{ marginVertical: 24 }} color="#008080" />
        ) : featured.length === 0 ? (
          <Text style={{ marginHorizontal: 16, color: "#6b7280" }}>
            No listings here yet. Try Explore to search another area.
          </Text>
        ) : (
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={item.onPress}
                activeOpacity={0.85}
                style={{ width: 200, marginRight: 12, backgroundColor: "white", borderRadius: 16, overflow: "hidden" }}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: "100%", height: 110 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: "100%", height: 110, backgroundColor: "#e5e7eb" }} />
                )}
                <View style={{ padding: 10 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>{item.title}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: "#6b7280", flex: 1, textTransform: "capitalize" }}>
                      {item.subtitle}
                    </Text>
                    {!!item.rating && (
                      <Text style={{ fontSize: 12, color: "#f59e0b", fontWeight: "600" }}>★ {item.rating.toFixed(1)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}
