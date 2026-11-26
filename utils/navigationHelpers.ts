import { ServiceCategory } from '@/types/commonTypes';
import { router, type Href } from 'expo-router';

/** Route segment for each backend service category (app/(tabs)/explore/services/<slug>/[serviceId]). */
export const CATEGORY_SLUGS: Record<ServiceCategory, string> = {
    [ServiceCategory.ACCOMMODATION]: 'accommodation',
    [ServiceCategory.ACTIVITY]: 'activity',
    [ServiceCategory.FOOD_BEVERAGE]: 'food-beverage',
    [ServiceCategory.TOUR_GUIDE]: 'tour-guide',
    [ServiceCategory.TRANSPORT]: 'transport',
};

/** Detail screen for a service, or null for an unknown category. */
export function serviceDetailHref(serviceId: number | string, category: ServiceCategory | string | null | undefined): Href | null {
    const slug = category ? CATEGORY_SLUGS[String(category).toUpperCase() as ServiceCategory] : undefined;
    if (!slug || serviceId === null || serviceId === undefined) return null;
    return `/explore/services/${slug}/${serviceId}` as Href;
}

export function navigateToServiceDetail(serviceId: number, category: ServiceCategory | string) {
    const href = serviceDetailHref(serviceId, category);
    if (href) router.push(href);
}

/** onPress handler for a service card. */
export function createServiceCardHandler(service: { serviceId: number; category: ServiceCategory | string }) {
    return () => {
        if (service?.serviceId) navigateToServiceDetail(service.serviceId, service.category);
    };
}
