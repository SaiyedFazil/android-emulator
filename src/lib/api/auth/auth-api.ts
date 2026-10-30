import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { ApiSession } from "@/types/auth.types";

export interface InvitationInfo {
  email: string;
  firstName: string;
  lastName: string;
  /** Null until organizations exist. */
  organizationName: string | null;
}

/**
 * The browser's auth calls. Signing in and refreshing are not here: the Next server does them
 * (`auth.ts`), so the refresh token never reaches the browser.
 */
export const authApi = {
  /** Ends this device's session on the backend. */
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  /** Ends every session of the user, this one included. */
  logoutAll: async (): Promise<void> => {
    await api.post("/auth/logout/all");
  },

  /** Always answers the same message, whether or not the address has an account. */
  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>("/auth/password/forgot", {
      email,
    });
    return response.data;
  },

  verifyResetLink: async (token: string): Promise<ApiResponse<{ email: string }>> => {
    const response = await api.post<ApiResponse<{ email: string }>>("/auth/password/reset/verify", {
      token,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post("/auth/password/reset", { token, password });
  },

  verifyInvitation: async (token: string): Promise<ApiResponse<InvitationInfo>> => {
    const response = await api.post<ApiResponse<InvitationInfo>>("/auth/invitations/verify", {
      token,
    });
    return response.data;
  },

  acceptInvitation: async (payload: {
    token: string;
    username: string;
    password: string;
  }): Promise<void> => {
    await api.post("/auth/invitations/accept", payload);
  },

  /** The user's signed-in devices, newest activity first. */
  getSessions: async (): Promise<ApiResponse<ApiSession[]>> => {
    const response = await api.get<ApiResponse<ApiSession[]>>("/auth/sessions");
    return response.data;
  },

  revokeSession: async (id: string): Promise<void> => {
    await api.delete(`/auth/sessions/${id}`);
  },

  revokeOtherSessions: async (): Promise<ApiResponse<{ revoked: number }>> => {
    const response = await api.post<ApiResponse<{ revoked: number }>>(
      "/auth/sessions/revoke-others"
    );
    return response.data;
  },
};
