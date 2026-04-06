import { Customer, CustomerGroup, CareTask, PipelineItem, Script } from './types';

let customers: Customer[] = [];
let customerGroups: CustomerGroup[] = [];
let careTasks: CareTask[] = [];
let pipelineItems: PipelineItem[] = [];
let scripts: Script[] = [];

export function setCustomers(data: Customer[]) { customers = data; }
export function getCustomers(): Customer[] { return customers; }

export function setCustomerGroups(data: CustomerGroup[]) { customerGroups = data; }
export function getCustomerGroups(): CustomerGroup[] { return customerGroups; }

export function setCareTasks(data: CareTask[]) { careTasks = data; }
export function getCareTasks(): CareTask[] { return careTasks; }

export function setPipelineItems(data: PipelineItem[]) { pipelineItems = data; }
export function getPipelineItems(): PipelineItem[] { return pipelineItems; }

export function setScripts(data: Script[]) { scripts = data; }
export function getScripts(): Script[] { return scripts; }

export function addPipelineItem(item: PipelineItem) { pipelineItems.push(item); }
export function updatePipelineItem(id: string, updates: Partial<PipelineItem>) {
  const idx = pipelineItems.findIndex(p => p.id === id);
  if (idx >= 0) pipelineItems[idx] = { ...pipelineItems[idx], ...updates };
}
export function deletePipelineItem(id: string) {
  pipelineItems = pipelineItems.filter(p => p.id !== id);
}

export function addCareTask(task: CareTask) { careTasks.push(task); }
export function updateCareTask(id: string, updates: Partial<CareTask>) {
  const idx = careTasks.findIndex(t => t.id === id);
  if (idx >= 0) careTasks[idx] = { ...careTasks[idx], ...updates };
}
export function deleteCareTask(id: string) {
  careTasks = careTasks.filter(t => t.id !== id);
}

export function updateScript(id: string, updates: Partial<Script>) {
  const idx = scripts.findIndex(s => s.id === id);
  if (idx >= 0) scripts[idx] = { ...scripts[idx], ...updates };
}

export function getDashboardStats() {
  const totalContracts = customers.length;
  const totalApe = customers.reduce((sum, c) => sum + (c.apeNumber || 0), 0);
  const totalPremium = customers.reduce((sum, c) => sum + (c.premiumNumber || 0), 0);
  const activeContracts = customers.filter(c => c.status?.includes('Đang hiệu lực')).length;
  const lapsedContracts = customers.filter(c => c.status?.includes('Mất hiệu lực')).length;
  const dueSoon = careTasks.filter(t => t.daysToDue >= 0 && t.daysToDue <= 30).length;
  const overdue = careTasks.filter(t => t.daysToDue < 0).length;
  const pipelineValue = pipelineItems.reduce((sum, p) => sum + (p.value || 0), 0);
  const expectedRevenue = pipelineItems.reduce((sum, p) => sum + (p.expectedRevenue || 0), 0);

  return {
    totalContracts,
    totalApe,
    totalPremium,
    activeContracts,
    lapsedContracts,
    dueSoon,
    overdue,
    pipelineValue,
    expectedRevenue,
    vipCustomers: customerGroups.filter(g => g.group === 'VIP').length,
  };
}
