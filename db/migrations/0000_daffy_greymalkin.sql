CREATE TABLE "care_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text,
	"due_date" text,
	"payment_cycle" text,
	"premium" integer DEFAULT 0,
	"ape" integer DEFAULT 0,
	"status" text,
	"days_to_due" integer DEFAULT 0,
	"task" text,
	"deadline" text,
	"notes" text,
	"completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "customer_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"total_ape" integer DEFAULT 0,
	"group_name" text DEFAULT 'Thường'
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_no" text NOT NULL,
	"product" text,
	"issue_date" text,
	"status" text,
	"agent" text,
	"effective_date" text,
	"payment_cycle" text,
	"due_date" text,
	"premium" text,
	"ape" text,
	"pending_fee" text,
	"policy_holder" text,
	"insured" text,
	"name" text,
	"phone" text,
	"premium_number" integer DEFAULT 0,
	"ape_number" integer DEFAULT 0,
	"pending_fee_number" integer DEFAULT 0,
	"due_date_obj" text,
	"days_to_due" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "pipeline_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer" text NOT NULL,
	"stage" text DEFAULT 'Tiếp cận',
	"opportunity" text,
	"value" integer DEFAULT 0,
	"probability" integer DEFAULT 0,
	"expected_revenue" integer DEFAULT 0,
	"next_step" text,
	"owner" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"situation" text NOT NULL,
	"goal" text,
	"content" text
);
