export type Role = 'Admin' | 'Sales Manager' | 'Sales Executive';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Email' | 'Phone' | 'Other';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted' | 'Lost';
export type LeadPriority = 'Low' | 'Medium' | 'High';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: User | null;
  description?: string;
  isConverted: boolean;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  originalLeadId: Lead | string;
  assignedTo: User;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'Qualification' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  _id: string;
  name: string;
  leadId: Lead | string;
  customerId: Customer | string;
  assignedTo: User;
  value: number;
  probability: number;
  expectedRevenue: number;
  expectedClosingDate: string;
  stage: DealStage;
  lossReason?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Follow-up' | 'Reminder' | 'Note';
export type ActivityStatus = 'Pending' | 'Completed' | 'Overdue';

export interface Activity {
  _id: string;
  type: ActivityType;
  title: string;
  description?: string;
  assignedTo: User;
  createdBy: User;
  dueDate: string;
  status: ActivityStatus;
  isOverdue?: boolean;
  relatedModel: 'Lead' | 'Customer' | 'Deal';
  relatedId: string;
  completedAt?: string;
  createdAt: string;
}

export interface OverviewMetrics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  totalCustomers: number;
  totalDeals: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  expectedRevenue: number;
  conversionRatePercentage: number;
  pendingActivities: number;
  overdueActivities: number;
}

export interface PipelineStage {
  stage: DealStage;
  count: number;
  totalValue: number;
  totalExpectedRevenue: number;
}

export interface ExecutivePerformance {
  executive: {
    id: string;
    name: string;
    email: string;
  };
  assignedLeads: number;
  convertedLeads: number;
  wonDeals: number;
  closedRevenue: number;
  conversionRatePercentage: number;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
