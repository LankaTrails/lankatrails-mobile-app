import api from '@/api/axiosInstance';

/** Notification channels stored in the backend's user_preferences row. */
export interface NotificationPreferences {
    notificationsEnabled: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    const { data } = await api.get('/auth/logged-user');
    const prefs = data?.data?.userPreferences ?? {};
    return {
        notificationsEnabled: prefs.notificationsEnabled ?? true,
        pushNotifications: prefs.pushNotifications ?? true,
        emailNotifications: prefs.emailNotifications ?? true,
        smsNotifications: prefs.smsNotifications ?? false,
    };
}

/** Partial update: only the fields sent are changed. */
export async function updateNotificationPreferences(
    changes: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const { data } = await api.put('/user/user-preferences', changes);
    return data.data as NotificationPreferences;
}
