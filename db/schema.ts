import { pgTable, text, integer, numeric, timestamp, boolean, serial } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  contractNo: text('contract_no').notNull(),
  product: text('product'),
  issueDate: text('issue_date'),
  status: text('status'),
  agent: text('agent'),
  effectiveDate: text('effective_date'),
  paymentCycle: text('payment_cycle'),
  dueDate: text('due_date'),
  premium: text('premium'),
  ape: text('ape'),
  pendingFee: text('pending_fee'),
  policyHolder: text('policy_holder'),
  insured: text('insured'),
  name: text('name'),
  phone: text('phone'),
  premiumNumber: integer('premium_number').default(0),
  apeNumber: integer('ape_number').default(0),
  pendingFeeNumber: integer('pending_fee_number').default(0),
  dueDateObj: text('due_date_obj'),
  daysToDue: integer('days_to_due').default(0),
});

export const customerProfiles = pgTable('customer_profiles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  birthday: text('birthday'),
  gender: text('gender'),
  address: text('address'),
  phone: text('phone'),
  contractCount: text('contract_count'),
  rank: text('rank'),
  cmnd: text('cmnd'),
  age: integer('age'),
});

export const customerGroups = pgTable('customer_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  totalApe: integer('total_ape').default(0),
  group: text('group_name').default('Thường'),
});

export const careTasks = pgTable('care_tasks', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phone: text('phone'),
  dueDate: text('due_date'),
  paymentCycle: text('payment_cycle'),
  premium: integer('premium').default(0),
  ape: integer('ape').default(0),
  status: text('status'),
  daysToDue: integer('days_to_due').default(0),
  task: text('task'),
  deadline: text('deadline'),
  notes: text('notes'),
  completed: boolean('completed').default(false),
});

export const pipelineItems = pgTable('pipeline_items', {
  id: serial('id').primaryKey(),
  customer: text('customer').notNull(),
  stage: text('stage').default('Tiếp cận'),
  opportunity: text('opportunity'),
  value: integer('value').default(0),
  probability: integer('probability').default(0),
  expectedRevenue: integer('expected_revenue').default(0),
  nextStep: text('next_step'),
  owner: text('owner'),
  notes: text('notes'),
});

export const scripts = pgTable('scripts', {
  id: serial('id').primaryKey(),
  situation: text('situation').notNull(),
  goal: text('goal'),
  content: text('content'),
});
