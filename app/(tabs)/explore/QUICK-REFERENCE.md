# Explore Module - Quick Reference

## 🚀 Quick Start

### Adding a New Screen

```typescript
// 1. Create the screen file
// app/(tabs)/explore/[domain]/new-screen.tsx
import { useLocalSearchParams } from "expo-router";

export default function NewScreen() {
  const params = useLocalSearchParams();
  return <YourComponent />;
}

// 2. Add to layout (if needed)
// app/(tabs)/explore/[domain]/_layout.tsx
<Stack.Screen name="new-screen" options={{ title: "New Screen" }} />;
```

### Navigation Between Screens

```typescript
// Forward navigation with parameters
router.push({
  pathname: "/explore/services/[serviceId]",
  params: { serviceId: "123", additionalData: "value" },
});

// Back navigation
router.back();

// Replace current screen
router.replace("/explore/search/results");
```

## 📂 File Locations

### Components

```
AnimatedCard      → components/shared/AnimatedCard.tsx
SectionHeader     → components/shared/SectionHeader.tsx
LoadingStates     → components/shared/LoadingStates.tsx
ServiceGrid       → services/components/ServiceGrid.tsx
PlaceGrid         → places/components/PlaceGrid.tsx
MapSelector       → components/MapSelector.tsx
```

### Screens

```
Search Home       → index.tsx
Search Results    → search/results.tsx
Service Detail    → services/[serviceId].tsx
Provider Detail   → services/provider/[providerId].tsx
Place Detail      → places/[placeId].tsx
Category Listing  → categories/[category].tsx
Support/Help      → support/complaints.tsx
```

## 🔗 Common Navigation Patterns

### From Search Results

```typescript
// To service detail
const handleServicePress = useCallback((serviceId: string) => {
  router.push({
    pathname: "/explore/services/[serviceId]",
    params: { serviceId },
  });
}, []);

// To place detail
const handlePlacePress = useCallback((placeId: string) => {
  router.push({
    pathname: "/explore/places/[placeId]",
    params: { placeId, type: "public_place" },
  });
}, []);
```

### From Home/Index

```typescript
// To search results
const navigateToSearchResult = useCallback(
  (params: any) => {
    router.push({
      pathname: "/explore/search/results",
      params,
    });
  },
  [router]
);
```

## 📡 API Integration

### Service Search

```typescript
import { searchServices } from "@/services/serviceSearch";
import { ServiceSearchRequest } from "@/types/serviceTypes";

const request: ServiceSearchRequest = {
  city: "Colombo",
  category: ServiceCategory.ACCOMMODATION,
  accommodationType: "HOTEL",
};

const response = await searchServices(request);
```

### Google Places

```typescript
import { fetchGroupedPlaces } from "@/services/googlePlacesService";

const places = await fetchGroupedPlaces(lat, lng);
```

## 🎨 Using Shared Components

### AnimatedCard

```typescript
import { AnimatedCard } from "../components/shared/AnimatedCard";

<AnimatedCard delay={300}>
  <YourContent />
</AnimatedCard>;
```

### SectionHeader

```typescript
import { SectionHeader } from "../components/shared/SectionHeader";

<SectionHeader
  title="Services"
  location="Colombo"
  isNearby={false}
  showSeeMore={true}
  onSeeMore={() => handleSeeMore("Services")}
/>;
```

### ServiceGrid

```typescript
import { ServiceGrid } from "../services/components/ServiceGrid";

<ServiceGrid
  services={services}
  maxItems={6}
  onItemPress={handleServicePress}
/>;
```

## 🔄 State Management

### Local State Pattern

```typescript
const MyScreen = () => {
  // UI State
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");

  // Data State
  const [data, setData] = useState([]);

  // Computed State
  const filteredData = useMemo(() => {
    return data.filter(/* your filter logic */);
  }, [data, selectedTab]);
};
```

### URL Parameters

```typescript
const MyScreen = () => {
  const params = useLocalSearchParams();
  const { serviceId, category, location } = params;

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails(serviceId);
    }
  }, [serviceId]);
};
```

## 🎯 Filtering System

### Two-Level Filtering

```typescript
// Main categories
const TABS = ["All", "Accommodation", "Food & Beverage", "Transport"];

// Sub-types for each category
const ACCOMMODATION_TYPES = ["← Back", "All", "Hotel", "Resort", "Villa"];

// Dynamic filter rendering
<FilterBar
  tabs={selectedTab !== "All" ? getSubTypesForCategory(selectedTab) : TABS}
  selectedTab={selectedTab !== "All" ? selectedSubType : selectedTab}
  onTabPress={handleTabPress}
/>;
```

## 🔍 Common Debugging

### Route Issues

```typescript
// Check current route
console.log("Current route:", router.pathname);

// Check params
console.log("Route params:", params);

// Verify layout structure
// Make sure _layout.tsx exists for nested routes
```

### Component Issues

```typescript
// Check component imports
import { AnimatedCard } from "../components/shared/AnimatedCard";
// NOT: import AnimatedCard from '...'  (wrong import style)

// Verify props are passed correctly
<ServiceGrid
  services={services} // Make sure this is an array
  onItemPress={handlePress} // Make sure this function exists
/>;
```

## 📱 Platform-Specific Notes

### iOS

- Deep linking works automatically with expo-router
- Navigation animations are smooth by default

### Android

- Ensure StatusBar is set correctly for each screen
- Handle back button behavior appropriately

### Web

- URLs reflect the route structure
- Browser back/forward buttons work correctly

## 💡 Tips & Tricks

1. **Always use absolute paths** for navigation to avoid relative path issues
2. **Define interfaces** for route parameters to catch typing errors early
3. **Use useCallback** for navigation functions to prevent unnecessary re-renders
4. **Implement loading states** for better user experience
5. **Handle errors gracefully** with user-friendly messages
6. **Test deep linking** by manually typing URLs in browser (web) or using linking APIs

## 📞 Need Help?

- Check the detailed [ARCHITECTURE.md](./ARCHITECTURE.md) for comprehensive documentation
- Look at existing screens for implementation patterns
- Test changes with the development server running: `npx expo start`
