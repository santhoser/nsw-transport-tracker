import { create } from 'zustand';
import type { Journey, Place, SavedTrip } from '../domain/types';

/** Place chosen in the picker screen, consumed by the add-trip form. */
interface PickerState {
  target: 'from' | 'to' | null;
  from: Place | null;
  to: Place | null;
  route: string | null;
  setRoute: (r: string | null) => void;
  setPlace: (t: 'from' | 'to', p: Place | null) => void;
  begin: (t: 'from' | 'to') => void;
  pick: (p: Place) => void;
  reset: () => void;
}

/** Draft state for the add-trip form; the picker screen writes the chosen place here. */
export const usePicker = create<PickerState>((set, get) => ({
  target: null,
  from: null,
  to: null,
  route: null,
  setRoute: (route) => set({ route }),
  setPlace: (t, p) => set(t === 'from' ? { from: p } : { to: p }),
  begin: (target) => set({ target }),
  pick: (place) => {
    const t = get().target;
    if (t) set(t === 'from' ? { from: place, target: null } : { to: place, target: null });
  },
  reset: () => set({ target: null, from: null, to: null, route: null }),
}));

/** Journey passed from trip board to the detail screen (avoids serialising through route params). */
interface SelectedState {
  journey: Journey | null;
  trip: SavedTrip | null;
  select: (j: Journey, t: SavedTrip) => void;
}

export const useSelected = create<SelectedState>((set) => ({
  journey: null,
  trip: null,
  select: (journey, trip) => set({ journey, trip }),
}));
