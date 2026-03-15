export interface SearchFilters {
  status?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  userType?: string[];
  hostelBlock?: string[];
  roomNumber?: string;
  gatepassType?: string[];
}

export interface SearchResult {
  id: number;
  type: 'gatepass' | 'user' | 'log';
  title: string;
  subtitle: string;
  status?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  loading: boolean;
  showResults: boolean;
}
