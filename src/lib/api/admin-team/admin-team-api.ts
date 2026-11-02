import api from "@/lib/axios";
import type { InvitedTeamMember, TeamInvite, TeamMember, TeamRole } from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";

/** The platform team (`/admin/team`). Everyone in the admin console reads it; only the owner writes. */
export const adminTeamApi = {
  getTeam: async (): Promise<ApiResponse<TeamMember[]>> => {
    const response = await api.get<ApiResponse<TeamMember[]>>("/admin/team");
    return response.data;
  },

  /** Creates the account (or restores a removed member's) and emails the invitation. */
  invite: async (body: TeamInvite): Promise<ApiResponse<InvitedTeamMember>> => {
    const response = await api.post<ApiResponse<InvitedTeamMember>>("/admin/team", body);
    return response.data;
  },

  /** The person is signed out everywhere and signs in again with the new role. */
  changeRole: async (uuid: string, role: TeamRole): Promise<ApiResponse<TeamMember>> => {
    const response = await api.patch<ApiResponse<TeamMember>>(`/admin/team/${uuid}`, { role });
    return response.data;
  },

  /** A new invitation link; the previous one stops working. */
  resendInvite: async (uuid: string): Promise<void> => {
    await api.post(`/admin/team/${uuid}/resend-invite`);
  },

  /** Signs them out everywhere; they can't sign in until reactivated. */
  suspend: async (uuid: string): Promise<ApiResponse<TeamMember>> => {
    const response = await api.post<ApiResponse<TeamMember>>(`/admin/team/${uuid}/suspend`);
    return response.data;
  },

  reactivate: async (uuid: string): Promise<ApiResponse<TeamMember>> => {
    const response = await api.post<ApiResponse<TeamMember>>(`/admin/team/${uuid}/reactivate`);
    return response.data;
  },

  /** Signs them out and removes the account; inviting the email again restores it. */
  remove: async (uuid: string): Promise<void> => {
    await api.delete(`/admin/team/${uuid}`);
  },
};
