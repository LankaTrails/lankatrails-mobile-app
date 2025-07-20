# LankaTrails Mobile App - Explore Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Routing System](#routing-system)
4. [Data Flow & Transfer](#data-flow--transfer)
5. [Component Architecture](#component-architecture)
6. [API Integration](#api-integration)
7. [Navigation Patterns](#navigation-patterns)
8. [State Management](#state-management)
9. [Best Practices](#best-practices)

---

## Overview

The Explore module is the core feature of the LankaTrails mobile app, responsible for:

- **Location-based search** for services and places
- **Multi-level filtering** (category → sub-category)
- **Service discovery** and detailed views
- **Public place exploration**
- **User support** and feedback

The module follows a **modular architecture** with domain-specific routing and reusable components.

---

## Folder Structure

```
app/(tabs)/explore/
├── 📁 _layout.tsx                    # Main explore layout & route definitions
├── 📄 index.tsx                      # Home/Search screen
├── 📄 README.md                      # Module overview (this file)
│
├── 📁 search/                        # Search functionality
│   ├── _layout.tsx                   # Search nested routing
│   ├── results.tsx                   # Search results (main search screen)
│   └── components/
│       └── [future components]       # Search-specific UI components
│
├── 📁 services/                      # Service-related functionality
│   ├── _layout.tsx                   # Services nested routing
│   ├── [serviceId].tsx              # Individual service details
│   ├── provider/
│   │   └── [providerId].tsx         # Service provider details
│   └── components/
│       └── ServiceGrid.tsx          # Service listing grid component
│
├── 📁 categories/                    # Category-based listings
│   ├── _layout.tsx                   # Categories nested routing
│   ├── [category].tsx               # Category-specific listings
│   └── components/
│       └── [future components]       # Category-specific UI
│
├── 📁 places/                        # Public places functionality
│   ├── _layout.tsx                   # Places nested routing
│   ├── [placeId].tsx                # Individual place details
│   └── components/
│       └── PlaceGrid.tsx            # Places listing grid
│
├── 📁 support/                       # User support features
│   ├── _layout.tsx                   # Support nested routing
│   ├── complaints.tsx               # Complaint submission
│   └── help.tsx                     # Help documentation
│
├── 📁 components/                    # Shared components
│   ├── MapSelector.tsx              # Map location picker
│   └── shared/                      # Cross-domain components
│       ├── AnimatedCard.tsx         # Reusable animation wrapper
│       ├── SectionHeader.tsx        # Consistent section headers
│       └── LoadingStates.tsx        # Loading UI states
│
└── 📁 [Legacy Files]                # To be migrated
    ├── accommodation-foods-transport.tsx
    ├── FoodItemView.tsx
    └── ServiceViewCopy.tsx
```

---

## Routing System

### Route Structure

The explore module uses **nested routing** with expo-router for clean URL patterns:

```typescript
// Main Routes
/explore                              # Home/Search screen
/explore/search/results              # Search results with filters
/explore/services/[serviceId]        # Service detail view
/explore/services/provider/[providerId] # Provider profile
/explore/places/[placeId]           # Place detail view
/explore/categories/[category]       # Category listings
/explore/support/complaints          # Support features
```

### Layout Hierarchy

```typescript
// Main Layout: app/(tabs)/explore/_layout.tsx
export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Explore" }} />
      <Stack.Screen name="search" options={{ title: "Search" }} />
      <Stack.Screen name="services" options={{ title: "Services" }} />
      {/* ... other nested routes */}
    </Stack>
  );
}

// Search Layout: search/_layout.tsx
export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="results"
        options={{
          headerShown: false,
          title: "Search Results",
        }}
      />
    </Stack>
  );
}
```

### Dynamic Routes

- **`[serviceId].tsx`** - Captures service IDs for detail views
- **`[placeId].tsx`** - Captures place IDs for location details
- **`[category].tsx`** - Captures category names for filtered listings
- **`[providerId].tsx`** - Captures provider IDs for business profiles

---

## Data Flow & Transfer

### 1. Search Flow

```typescript
// 1. User initiates search from index.tsx
const handleSearch = useCallback(async (searchTerm: string) => {
  // Save to recent searches
  await saveRecentSearch({
    name: searchTerm,
    searchQuery: searchTerm,
    searchType: "location",
  });

  // Navigate to results with params
  router.push({
    pathname: "/explore/search/results",
    params: {
      location: searchTerm,
      searchQuery: searchTerm,
    },
  });
}, []);

// 2. Results screen receives params via useLocalSearchParams()
const SearchResultsScreen = () => {
  const params = useLocalSearchParams();
  const searchLocation = params.location as string;

  // Fetch data based on params
  useEffect(() => {
    fetchServices();
    fetchPlaces();
  }, [searchLocation]);
};
```

### 2. Service Detail Flow

```typescript
// 1. User clicks service card in search results
const handleServicePress = useCallback((serviceId: string) => {
  router.push({
    pathname: "/explore/services/[serviceId]",
    params: { serviceId },
  });
}, []);

// 2. Service detail screen receives serviceId
const ServiceDetailScreen = () => {
  const { serviceId } = useLocalSearchParams();

  // Fetch detailed service data
  useEffect(() => {
    fetchServiceDetails(serviceId);
  }, [serviceId]);
};
```

### 3. Filter State Transfer

```typescript
// Search state is maintained within the search/results.tsx component
const [selectedTab, setSelectedTab] = useState<string>("All");
const [selectedSubType, setSelectedSubType] = useState<string>("All");

// Filter changes trigger API calls with new parameters
const fetchServices = useCallback(async () => {
  let searchRequest: ServiceSearchRequest = { city: searchLocation };

  // Add category filtering
  if (selectedTab !== "All") {
    const category = TAB_TO_CATEGORY_MAP[selectedTab];
    searchRequest.category = category;

    // Add sub-type filtering
    if (selectedSubType !== "All") {
      searchRequest.accommodationType = ACCOMMODATION_TYPE_MAP[selectedSubType];
    }
  }

  const response = await searchServices(searchRequest);
}, [selectedTab, selectedSubType, searchLocation]);
```

---

## Component Architecture

### Reusable Components

#### AnimatedCard

```typescript
// Location: components/shared/AnimatedCard.tsx
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

// Usage across multiple screens
<AnimatedCard delay={300}>
  <ServiceCard service={service} />
</AnimatedCard>;
```

#### SectionHeader

```typescript
// Location: components/shared/SectionHeader.tsx
interface SectionHeaderProps {
  title: string;
  location: string;
  isNearby: boolean;
  showSeeMore?: boolean;
  onSeeMore?: () => void;
}

// Consistent headers across all screens
<SectionHeader
  title="Services"
  location={searchLocation}
  isNearby={isNearbySearch}
/>;
```

### Domain-Specific Components

#### ServiceGrid

```typescript
// Location: services/components/ServiceGrid.tsx
interface ServiceGridProps {
  services: Service[];
  maxItems?: number;
  onItemPress: (serviceId: string) => void;
}

// Handles service listing with card layout
<ServiceGrid
  services={categoryServices}
  maxItems={6}
  onItemPress={handleServicePress}
/>;
```

---

## API Integration

### Service Search API

```typescript
// Location: services/serviceSearch.ts
interface ServiceSearchRequest {
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  category?: ServiceCategory;
  accommodationType?: AccommodationType;
  activityType?: ActivityType;
  vehicleType?: VehicleType;
  foodAndBeverageType?: FoodBeverageType;
  tourGuideType?: TourGuideType;
}

// API call from search/results.tsx
const response = await searchServices(searchRequest);
```

### Google Places API

```typescript
// Location: services/googlePlacesService.ts
export const fetchGroupedPlaces = async (lat: number, lng: number) => {
  // Fetches public places from Google Places API
  // Groups by place type (restaurants, attractions, etc.)
  return groupedPlaces;
};

// Usage in search results
const groups = await fetchGroupedPlaces(lat, lng);
setGroupedPlaces(groups);
```

### Data Transformation

```typescript
// Convert API responses to UI-friendly format
const convertServiceToCardItem = (service: Service): CardItem => ({
  id: Number(service.serviceId),
  title: service.serviceName,
  subtitle: service.locationBased.city,
  rating: 4.5,
  image: service.mainImageUrl
    ? `${API_BASE_URL}${service.mainImageUrl}`
    : DEFAULT_PLACEHOLDER_IMAGE,
});
```

---

## Navigation Patterns

### 1. Forward Navigation

```typescript
// From search results to service detail
router.push({
  pathname: "/explore/services/[serviceId]",
  params: { serviceId: "123" },
});

// From service detail to provider profile
router.push({
  pathname: "/explore/services/provider/[providerId]",
  params: { providerId: "456" },
});
```

### 2. Back Navigation

```typescript
// Standard back navigation
router.back();

// Programmatic back with specific route
router.push({
  pathname: "/explore/search/results",
});
```

### 3. Tab-based Navigation

```typescript
// Filter tab changes (within same screen)
const handleTabChange = (newTab: string) => {
  setSelectedTab(newTab);
  setSelectedSubType("All"); // Reset sub-filters
};

// "View All" button redirects to filtered view
const handleSeeMore = (category: string) => {
  setSelectedTab(category);
  setSelectedSubType("All");
};
```

---

## State Management

### Local State (Component-Level)

```typescript
// search/results.tsx maintains its own state
const SearchResults = () => {
  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("All");

  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [groupedPlaces, setGroupedPlaces] = useState<PlaceGroup[]>([]);

  // Loading States
  const [servicesLoading, setServicesLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
};
```

### Computed State

```typescript
// Derived state using useMemo for performance
const filteredServices = useMemo(() => {
  return services; // API already filters, no client-side filtering needed
}, [services]);

const groupedServices = useMemo(() => {
  return services.reduce((acc, service) => {
    const category = normalizeCategory(service.category);
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);
}, [services]);
```

### Persistent State

```typescript
// Recent searches stored locally
// Location: utils/recentSearchStorage.ts
export const saveRecentSearch = async (search: RecentSearch) => {
  const searches = await getRecentSearches();
  const updatedSearches = [search, ...searches.slice(0, 9)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));
};
```

---

## Best Practices

### 1. Component Organization

- **Domain separation**: Keep related components in their respective folders
- **Shared components**: Place reusable UI components in `components/shared/`
- **Single responsibility**: Each component handles one specific concern

### 2. Route Structure

- **Nested layouts**: Use layout files for each domain section
- **Dynamic routes**: Use bracket notation for parameterized routes
- **Type safety**: Define parameter interfaces for route params

### 3. Data Fetching

- **Debounced requests**: Prevent excessive API calls during user interaction
- **Loading states**: Show appropriate loading indicators for better UX
- **Error handling**: Gracefully handle API failures with user-friendly messages

### 4. Performance

- **Memo optimization**: Use React.memo for expensive component renders
- **Lazy loading**: Load route components on demand
- **Image optimization**: Implement proper image caching and fallbacks

### 5. Navigation

- **Consistent patterns**: Use similar navigation patterns across the app
- **Deep linking**: Support direct URLs to specific content
- **Back navigation**: Always provide clear way to go back

---

## Example Implementation Flow

### Complete Search-to-Detail Flow

```typescript
// 1. User searches from index.tsx
const handleSearch = async (searchTerm: string) => {
  await saveRecentSearch({ name: searchTerm, searchType: "location" });

  router.push({
    pathname: "/explore/search/results",
    params: { location: searchTerm },
  });
};

// 2. Search results loads with params
const SearchResults = () => {
  const { location } = useLocalSearchParams();

  const fetchServices = useCallback(async () => {
    const request: ServiceSearchRequest = { city: location };
    const response = await searchServices(request);
    setServices(response.data);
  }, [location]);

  const handleServicePress = (serviceId: string) => {
    router.push({
      pathname: "/explore/services/[serviceId]",
      params: { serviceId },
    });
  };

  return <ServiceGrid services={services} onItemPress={handleServicePress} />;
};

// 3. Service detail loads with serviceId
const ServiceDetail = () => {
  const { serviceId } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServiceDetail(serviceId).then(setService);
  }, [serviceId]);

  return <ServiceDetailView service={service} />;
};
```

This architecture ensures maintainable, scalable, and performant code while providing excellent user experience through proper routing and data flow patterns.
