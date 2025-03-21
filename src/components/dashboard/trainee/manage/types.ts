export interface SimulationData {
  id: string;
  name: string;
  version: string;
  level: string;
  type: string;
  status: 'Published' | 'Draft' | 'Archive';
  tags: string[];
  estTime: string;
  lastModified: string;
  modifiedBy: {
    name: string;
    email: string;
  };
  createdOn: string;
  createdBy: {
    name: string;
    email: string;
  };
  isLocked?: boolean;
}