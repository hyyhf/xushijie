import { createContext, useContext } from 'react';
import { UserProfile } from '../services/authService';

// User Context
export interface UserContextType {
    user: UserProfile | null;
    isLoading: boolean;
}

export const UserContext = createContext<UserContextType>({ user: null, isLoading: true });

export function useUser() {
    return useContext(UserContext);
}
