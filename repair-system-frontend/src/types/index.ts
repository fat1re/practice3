export interface User {
  id: number;
  fio: string;
  phone: string;
  login: string;
  role: 'Manager' | 'Specialist' | 'Operator' | 'Customer' | 'QualityManager';
}

export interface RepairRequest {
  id: number;
  number: string;
  dateAdded: string;
  climateTechType: string;
  climateTechModel: string;
  problemDescription: string;
  requestStatus: 'Открыта' | 'В процессе ремонта' | 'Завершена' | 'Ожидание комплектующих';
  completionDate: string | null;
  repairParts: string | null;
  master: User | null;
  client: User;
  comments: Comment[];
}

export interface Comment {
  id: number;
  message: string;
  createdAt: string;
  master: User;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}