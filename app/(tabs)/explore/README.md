# Explore Module - New Structure

## Quick Links

- 📚 **[Detailed Architecture Documentation](./ARCHITECTURE.md)** - Complete guide to folder structure, routing, and data flow
- 🚀 **[Migration Guide](#migration-guide)** - How to update existing code
- ✅ **[Current Status](#current-status)** - What's implemented and what's pending

## Overview

The explore module has been restructured for better modularity and maintainability following React Native routing best practices.

## New Folder Structure

```
app/(tabs)/explore/
├── _layout.tsx                    # Main explore layout with route definitions
├── index.tsx                      # Search/Home screen (unchanged)
├── search/
│   ├── _layout.tsx               # Search section layout
│   ├── results.tsx               # Search results (formerly searchResult.tsx)
│   └── components/
│       └── [future components]   # Search-specific components
├── services/
│   ├── _layout.tsx               # Services section layout
│   ├── [serviceId].tsx           # Service detail view (formerly ServiceView.tsx)
│   ├── provider/
│   │   └── [providerId].tsx      # Service provider page (formerly ServiceProviderPage.tsx)
│   └── components/
│       └── ServiceGrid.tsx       # Service grid component (extracted)
├── categories/
│   ├── _layout.tsx               # Categories layout
│   ├── [category].tsx            # Category listing (moved from root)
│   └── components/
│       └── [future components]   # Category-specific components
├── places/
│   ├── _layout.tsx               # Places layout
│   ├── [placeId].tsx            # Place detail view (new)
│   └── components/
│       └── PlaceGrid.tsx        # Place grid component (extracted)
├── support/
│   ├── _layout.tsx              # Support section layout
│   ├── complaints.tsx           # Complaints page (formerly ComplainPage.tsx)
│   └── help.tsx                 # Help page (placeholder)
└── components/
    ├── MapSelector.tsx          # Map selector (formerly MapSelectorComponent.tsx)
    └── shared/                  # Shared explore components
        ├── AnimatedCard.tsx     # Reusable animated card (extracted)
        ├── SectionHeader.tsx    # Section header component (extracted)
        └── LoadingStates.tsx    # Loading state components (extracted)
```

## Key Changes

### 1. **Modular Components**

- Extracted reusable components into separate files
- `AnimatedCard`, `SectionHeader`, `LoadingStates` are now shared components
- `ServiceGrid` and `PlaceGrid` are domain-specific components

### 2. **Better Routing Structure**

- Services: `/explore/services/[serviceId]` (instead of `/explore/ServiceView`)
- Places: `/explore/places/[placeId]` (new route for place details)
- Provider: `/explore/services/provider/[providerId]`
- Search Results: `/explore/search/results`
- Categories: `/explore/categories/[category]`
- Support: `/explore/support/complaints`

### 3. **Component Organization**

- Domain-specific components in their respective folders
- Shared components in `components/shared/`
- Each section has its own layout file for nested routing

### 4. **Legacy Files Status**

The following files remain in the root for backward compatibility:

- `accommodation-foods-transport.tsx/.jsx`
- `FoodItemView.tsx`
- `ServiceViewCopy.tsx`

These should be migrated to the new structure in future updates.

## Migration Guide

### For Navigation Updates:

- Update service navigation from `/explore/ServiceView` to `/explore/services/[serviceId]`
- Update place navigation to `/explore/places/[placeId]`
- Update search results navigation to `/explore/search/results`

### For Component Usage:

- Import shared components from `../components/shared/`
- Import domain components from their respective folders
- Use modular loading states instead of inline components

## Benefits

1. **Better Organization**: Clear separation of concerns
2. **Reusability**: Components can be easily shared across screens
3. **Maintainability**: Easier to locate and update specific features
4. **Scalability**: Easy to add new features within each domain
5. **Type Safety**: Better TypeScript support with organized imports
6. **Performance**: Smaller bundle sizes with code splitting

## Current Status

### ✅ Completed

- [x] **Modular folder structure** with domain separation
- [x] **Nested routing system** with proper layouts
- [x] **Reusable components** (AnimatedCard, SectionHeader, LoadingStates)
- [x] **Service and Place grids** extracted to separate components
- [x] **Updated navigation paths** to new route structure
- [x] **Search results functionality** fully migrated
- [x] **Two-level filtering system** (category → sub-type)
- [x] **"View all" button redirection** to filtered tabs
- [x] **Hidden headings** in filtered tabs for cleaner UI

### 🔄 In Progress

- [ ] **Testing new route structure** and fixing any remaining routing issues
- [ ] **Performance optimization** of component renders

### 📋 Next Steps

- [ ] **Migrate legacy files** (accommodation-foods-transport.tsx, FoodItemView.tsx, ServiceViewCopy.tsx)
- [ ] **Add error boundaries** for better error handling
- [ ] **Implement unit tests** for extracted components
- [ ] **Add more domain-specific components** as needed
- [ ] **Update API documentation** for new component interfaces

### 📚 Documentation

- ✅ **Architecture documentation** - Comprehensive guide available in [ARCHITECTURE.md](./ARCHITECTURE.md)
- ✅ **Route structure documentation** - Complete routing patterns and examples
- ✅ **Component usage examples** - How to use extracted components
- ✅ **Data flow documentation** - API integration and state management patterns
