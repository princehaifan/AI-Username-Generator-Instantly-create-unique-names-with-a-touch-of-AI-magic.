
export type WordPosition = 'before' | 'after';

export type Category = 'Random' | 'Gaming' | 'Tech' | 'Fantasy' | 'Space' | 'Nature' | 'Mystical';

export type AvailabilityStatus = 'unchecked' | 'checking' | 'available' | 'taken';

export interface Username {
  id: string;
  name: string;
  availability: AvailabilityStatus;
}
