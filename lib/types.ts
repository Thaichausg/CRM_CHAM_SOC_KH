export interface Customer {
  contractNo: string;
  product: string;
  issueDate: string;
  status: string;
  agent: string;
  effectiveDate: string;
  paymentCycle: string;
  dueDate: string;
  premium: string;
  ape: string;
  pendingFee: string;
  policyHolder: string;
  insured: string;
  name: string;
  phone: string;
  premiumNumber: number;
  apeNumber: number;
  pendingFeeNumber: number;
  dueDateObj: string;
  daysToDue: number;
}

export interface CustomerGroup {
  name: string;
  totalApe: number;
  group: string;
}

export interface CareTask {
  id: string;
  customerName: string;
  phone: string;
  dueDate: string;
  paymentCycle: string;
  premium: number;
  ape: number;
  status: string;
  daysToDue: number;
  task: string;
  deadline: string;
  notes: string;
  completed: boolean;
}

export interface PipelineItem {
  id: string;
  customer: string;
  stage: string;
  opportunity: string;
  value: number;
  probability: number;
  expectedRevenue: number;
  nextStep: string;
  owner: string;
  notes: string;
}

export interface Script {
  id: string;
  situation: string;
  goal: string;
  content: string;
}

export type Page = 'dashboard' | 'customers' | 'classification' | 'care' | 'pipeline' | 'scripts' | 'reports' | 'import';
