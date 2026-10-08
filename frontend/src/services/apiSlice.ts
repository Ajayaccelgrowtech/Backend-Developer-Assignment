import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type {
  User,
  Lead,
  Customer,
  Deal,
  Activity,
  OverviewMetrics,
  PipelineStage,
  ExecutivePerformance,
  ApiResponseWrapper
} from '../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Auth', 'User', 'Lead', 'Customer', 'Deal', 'Activity', 'Analytics', 'Timeline'],
  endpoints: (builder) => ({
    // Auth Endpoints
    login: builder.mutation<
      ApiResponseWrapper<{ user: User; tokens: { accessToken: string; refreshToken: string } }>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      }),
      invalidatesTags: ['Auth', 'Analytics']
    }),
    getProfile: builder.query<ApiResponseWrapper<User>, void>({
      query: () => '/auth/profile',
      providesTags: ['Auth']
    }),

    // Analytics Endpoints
    getOverviewMetrics: builder.query<ApiResponseWrapper<OverviewMetrics>, void>({
      query: () => '/analytics/overview',
      providesTags: ['Analytics', 'Lead', 'Customer', 'Deal', 'Activity']
    }),
    getPipelineMetrics: builder.query<ApiResponseWrapper<{ pipeline: PipelineStage[] }>, void>({
      query: () => '/analytics/pipeline',
      providesTags: ['Analytics', 'Deal']
    }),
    getTeamPerformance: builder.query<ApiResponseWrapper<{ performance: ExecutivePerformance[] }>, void>({
      query: () => '/analytics/team-performance',
      providesTags: ['Analytics']
    }),

    // Lead Endpoints
    getLeads: builder.query<
      ApiResponseWrapper<Lead[]>,
      { status?: string; priority?: string; source?: string; search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/leads',
        params
      }),
      providesTags: ['Lead']
    }),
    createLead: builder.mutation<ApiResponseWrapper<Lead>, Partial<Lead>>({
      query: (body) => ({
        url: '/leads',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Lead', 'Analytics']
    }),
    updateLeadStatus: builder.mutation<ApiResponseWrapper<Lead>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Lead', 'Analytics']
    }),
    convertLead: builder.mutation<
      ApiResponseWrapper<{ lead: Lead; customer: Customer; deal: Deal }>,
      {
        id: string;
        dealName: string;
        dealValue: number;
        probability?: number;
        expectedClosingDate: string;
        dealStage?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/convert`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Lead', 'Customer', 'Deal', 'Analytics']
    }),

    // Customer Endpoints
    getCustomers: builder.query<
      ApiResponseWrapper<Customer[]>,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/customers',
        params
      }),
      providesTags: ['Customer']
    }),

    // Deal Endpoints
    getDeals: builder.query<
      ApiResponseWrapper<Deal[]>,
      { stage?: string; minAmount?: number; maxAmount?: number; search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/deals',
        params
      }),
      providesTags: ['Deal']
    }),
    createDeal: builder.mutation<ApiResponseWrapper<Deal>, Partial<Deal>>({
      query: (body) => ({
        url: '/deals',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Deal', 'Analytics']
    }),
    updateDealStage: builder.mutation<ApiResponseWrapper<Deal>, { id: string; stage: string; lossReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/deals/${id}/stage`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Deal', 'Analytics']
    }),

    // Activity Endpoints
    getActivities: builder.query<
      ApiResponseWrapper<Activity[]>,
      { status?: string; type?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/activities',
        params
      }),
      providesTags: ['Activity']
    }),
    createActivity: builder.mutation<ApiResponseWrapper<Activity>, Partial<Activity>>({
      query: (body) => ({
        url: '/activities',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Activity', 'Analytics']
    }),
    completeActivity: builder.mutation<ApiResponseWrapper<Activity>, string>({
      query: (id) => ({
        url: `/activities/${id}/complete`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Activity', 'Analytics']
    }),

    // User Management Endpoints (Admin)
    getUsers: builder.query<ApiResponseWrapper<User[]>, { role?: string; status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/users',
        params
      }),
      providesTags: ['User']
    }),
    createUser: builder.mutation<ApiResponseWrapper<User>, Partial<User>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body
      }),
      invalidatesTags: ['User']
    }),
    toggleUserStatus: builder.mutation<ApiResponseWrapper<User>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive }
      }),
      invalidatesTags: ['User']
    })
  })
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useGetOverviewMetricsQuery,
  useGetPipelineMetricsQuery,
  useGetTeamPerformanceQuery,
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
  useConvertLeadMutation,
  useGetCustomersQuery,
  useGetDealsQuery,
  useCreateDealMutation,
  useUpdateDealStageMutation,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useCompleteActivityMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useToggleUserStatusMutation
} = apiSlice;
