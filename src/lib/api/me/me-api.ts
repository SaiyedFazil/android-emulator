import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Me } from "@/types/auth.types";

/** The fields a user can change on their own profile; an empty phone is `null`. */
export interface ProfileFields {
  firstName: string;
  lastName: string;
  phone: string | null;
  timezone: string;
}

/** The signed-in user's own account. */
export const meApi = {
  getMe: async (): Promise<ApiResponse<Me>> => {
    const response = await api.get<ApiResponse<Me>>("/me");
    return response.data;
  },

  /** Sends only the fields that changed. */
  updateMe: async (changes: Partial<ProfileFields>): Promise<ApiResponse<Me>> => {
    const response = await api.patch<ApiResponse<Me>>("/me", changes);
    return response.data;
  },

  /** Other devices are signed out; this one stays signed in. */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post("/me/password", { currentPassword, newPassword });
  },

  /** Emails the user a reset link. */
  sendResetEmail: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>("/me/password/reset-email");
    return response.data;
  },
};
