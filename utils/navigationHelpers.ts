import { ServiceCategory } from '@/types/serviceTypes';
import { router } from 'expo-router';

/**
 * Navigate to the appropriate service detail page based on service category and ID
 * @param serviceId - The ID of the service
 * @param category - The category of the service
 */
export function navigateToServiceDetail(serviceId: number, category: ServiceCategory) {
    console.log("🧭 navigateToServiceDetail called with:", {
        serviceId,
        category,
        serviceIdType: typeof serviceId,
        categoryType: typeof category
    });

    // Add null/undefined checks
    if (serviceId === null || serviceId === undefined) {
        console.error("❌ ServiceId is null or undefined");
        return;
    }

    if (!category) {
        console.error("❌ Category is null or undefined");
        return;
    }

    const categoryRoutes = {
        [ServiceCategory.ACCOMMODATION]: `/explore/services/accommodation/${serviceId}`,
        [ServiceCategory.ACTIVITY]: `/explore/services/activity/${serviceId}`,
        [ServiceCategory.FOOD_BEVERAGE]: `/explore/services/food-beverage/${serviceId}`,
        [ServiceCategory.TOUR_GUIDE]: `/explore/services/tour-guide/${serviceId}`,
        [ServiceCategory.TRANSPORT]: `/explore/services/transport/${serviceId}`,
    };

    const route = categoryRoutes[category];
    console.log("🛤️ Generated route:", route);

    if (route) {
        console.log("✅ Navigating to category-specific route:", route);
        router.push(route as any);
    } else {
        console.error(`❌ Unknown service category: ${category}`);
        console.log("⚠️ Using fallback route");
        // Fallback to the general service router
        router.push(`/explore/services/${serviceId}?category=${category}` as any);
    }
}

/**
 * Navigate to service detail with string category
 * @param serviceId - The ID of the service
 * @param category - The category as string
 */
export function navigateToServiceDetailString(
    serviceId: number,
    category: 'ACCOMMODATION' | 'ACTIVITY' | 'FOOD_BEVERAGE' | 'TOUR_GUIDE' | 'TRANSPORT'
) {
    return navigateToServiceDetail(serviceId, ServiceCategory[category]);
}

/**
 * Create an onPress handler for service cards
 * This is a convenient helper for components that display service cards
 * @param service - The service object containing serviceId and category
 * @returns onPress handler function
 */
export function createServiceCardHandler(service: { serviceId: number; category: ServiceCategory | string }) {
    return () => {
        console.log("🎯 createServiceCardHandler called with service:", {
            serviceId: service?.serviceId,
            category: service?.category,
            serviceType: typeof service
        });

        if (!service) {
            console.error("❌ Service object is null or undefined");
            return;
        }

        if (!service.serviceId) {
            console.error("❌ Service ID is missing from service object");
            return;
        }

        if (typeof service.category === 'string') {
            console.log("🔄 Converting string category to enum:", service.category);
            const categoryEnum = ServiceCategory[service.category as keyof typeof ServiceCategory];
            if (categoryEnum) {
                console.log("✅ Successfully converted category:", categoryEnum);
                navigateToServiceDetail(service.serviceId, categoryEnum);
            } else {
                console.error(`❌ Invalid service category: ${service.category}`);
                console.log("⚠️ Using fallback navigation");
                router.push(`/explore/services/${service.serviceId}` as any);
            }
        } else {
            console.log("✅ Using direct category enum");
            navigateToServiceDetail(service.serviceId, service.category);
        }
    };
}
