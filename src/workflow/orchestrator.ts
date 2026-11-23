import { create } from 'zustand';

// Define workflow states
export type WorkflowState = 'initial' | 'event-created' | 'case-registered' | 'case-assigned' | 'in-progress' | 'completed' | 'exported';

// Define workflow actions
export type WorkflowAction = 
  | { type: 'CREATE_EVENT' }
  | { type: 'REGISTER_CASE' }
  | { type: 'ASSIGN_CASE' }
  | { type: 'START_REPAIR' }
  | { type: 'COMPLETE_REPAIR' }
  | { type: 'EXPORT_RESULTS' }
  | { type: 'GO_OFFLINE' }
  | { type: 'GO_ONLINE' };

// Workflow context interface
interface WorkflowContext {
  state: WorkflowState;
  pendingChanges: boolean;
  conflicts: any[];
  lastSync: Date | null;
  dispatch: (action: WorkflowAction) => void;
}

// Initial state
const initialState: WorkflowContext = {
  state: 'initial',
  pendingChanges: false,
  conflicts: [],
  lastSync: null,
};

// Workflow reducer
function workflowReducer(state: WorkflowContext, action: WorkflowAction): WorkflowContext {
  switch (action.type) {
    case 'CREATE_EVENT':
      return { ...state, state: 'event-created' };
    case 'REGISTER_CASE':
      return { ...state, state: 'case-registered' };
    case 'ASSIGN_CASE':
      return { ...state, state: 'case-assigned', pendingChanges: true };
    case 'START_REPAIR':
      return { ...state, state: 'in-progress', pendingChanges: true };
    case 'COMPLETE_REPAIR':
      return { ...state, state: 'completed', pendingChanges: true };
    case 'EXPORT_RESULTS':
      return { ...state, state: 'exported' };
    case 'GO_OFFLINE':
      return { ...state, pendingChanges: true };
    case 'GO_ONLINE':
      return { ...state, pendingChanges: false, lastSync: new Date() };
    default:
      return state;
  }
}

// Create the workflow store
export const useWorkflowStore = create<WorkflowContext>((set) => ({
  ...initialState,
  dispatch: (action: WorkflowAction) => set((state) => workflowReducer(state, action)),
}));

// Workflow orchestrator class
export class WorkflowOrchestrator {
  private store = useWorkflowStore;

  // Create a new event
  async createEvent(eventData: any): Promise<void> {
    this.store.dispatch({ type: 'CREATE_EVENT' });
    // Implementation would save event to database
  }

  // Register a new case
  async registerCase(caseData: any): Promise<void> {
    this.store.dispatch({ type: 'REGISTER_CASE' });
    // Implementation would save case to database
  }

  // Assign a case to a repairer
  async assignCase(caseId: string, repairerId: string): Promise<void> {
    this.store.dispatch({ type: 'ASSIGN_CASE' });
    // Implementation would update case assignment
  }

  // Start repair work
  async startRepair(caseId: string): Promise<void> {
    this.store.dispatch({ type: 'START_REPAIR' });
    // Implementation would update case status
  }

  // Complete repair work
  async completeRepair(caseId: string, outcome: string): Promise<void> {
    this.store.dispatch({ type: 'COMPLETE_REPAIR' });
    // Implementation would update case status and outcome
  }

  // Export results
  async exportResults(eventId: string): Promise<any> {
    this.store.dispatch({ type: 'EXPORT_RESULTS' });
    // Implementation would generate and download export
    return {};
  }

  // Handle going offline
  goOffline(): void {
    this.store.dispatch({ type: 'GO_OFFLINE' });
  }

  // Handle coming back online
  async goOnline(): Promise<void> {
    this.store.dispatch({ type: 'GO_ONLINE' });
    // Implementation would sync pending changes
  }

  // Get current workflow state
  getState(): WorkflowState {
    return this.store.getState().state;
  }

  // Check if there are pending changes
  hasPendingChanges(): boolean {
    return this.store.getState().pendingChanges;
  }

  // Get conflicts
  getConflicts(): any[] {
    return this.store.getState().conflicts;
  }

  // Get last sync time
  getLastSync(): Date | null {
    return this.store.getState().lastSync;
  }
}

// Create a singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();
