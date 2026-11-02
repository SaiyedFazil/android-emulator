import api from "@/lib/axios";
import type { ApiPlan, PlanInput } from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";

/** Plans (`/admin/plans`). Everyone in the admin console reads; the owner and admins write. */
export const plansApi = {
  /** Every plan, ordered by name. */
  getPlans: async (): Promise<ApiResponse<ApiPlan[]>> => {
    const response = await api.get<ApiResponse<ApiPlan[]>>("/admin/plans");
    return response.data;
  },

  createPlan: async (body: PlanInput): Promise<ApiResponse<ApiPlan>> => {
    const response = await api.post<ApiResponse<ApiPlan>>("/admin/plans", body);
    return response.data;
  },

  /** Sends only the fields that changed. */
  updatePlan: async (uuid: string, changes: Partial<PlanInput>): Promise<ApiResponse<ApiPlan>> => {
    const response = await api.patch<ApiResponse<ApiPlan>>(`/admin/plans/${uuid}`, changes);
    return response.data;
  },

  deletePlan: async (uuid: string): Promise<void> => {
    await api.delete(`/admin/plans/${uuid}`);
  },
};
