import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUserProfile, UserProfileData } from '../data/userProfile';
import { isPageAllowedForPlan } from '../data/packagePermissions';
import { NavPage } from '../types';

interface AccessContextType {
  userProfile: UserProfileData;
  role: string;
  isSuperAdmin: boolean;
  isVeli: boolean;
  isSporcu: boolean;
  isSube: boolean;
  canAccess: (page: NavPage) => boolean;
  refreshProfile: () => void;
}

const AccessContext = createContext<AccessContextType>({
  userProfile: getStoredUserProfile(),
  role: 'Süper Admin',
  isSuperAdmin: true,
  isVeli: false,
  isSporcu: false,
  isSube: false,
  canAccess: () => true,
  refreshProfile: () => {},
});

export const AccessControllerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => getStoredUserProfile());

  const refreshProfile = () => {
    setUserProfile(getStoredUserProfile());
  };

  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setUserProfile(customEvent.detail);
      } else {
        refreshProfile();
      }
    };

    window.addEventListener('sportsfly_profile_updated', handleProfileUpdate as EventListener);
    window.addEventListener('storage', refreshProfile);
    return () => {
      window.removeEventListener('sportsfly_profile_updated', handleProfileUpdate as EventListener);
      window.removeEventListener('storage', refreshProfile);
    };
  }, []);

  const roleStr = (userProfile.role || '').toLowerCase();
  const isSuperAdmin = roleStr.includes('sür') || roleStr.includes('super') || roleStr.includes('yönetici') && !roleStr.includes('şube') && !roleStr.includes('veli') && !roleStr.includes('sporcu');
  const isVeli = roleStr.includes('veli') || roleStr.includes('ebeveyn');
  const isSporcu = roleStr.includes('sporcu');
  const isSube = roleStr.includes('şube') || roleStr.includes('sube');

  const canAccess = (page: NavPage): boolean => {
    // Süper Admin has full access
    if (isSuperAdmin && !roleStr.includes('veli') && !roleStr.includes('sporcu') && !roleStr.includes('şube')) {
      return true;
    }
    return isPageAllowedForPlan(page, 'Kulüp & Akademi', userProfile.role);
  };

  return (
    <AccessContext.Provider
      value={{
        userProfile,
        role: userProfile.role,
        isSuperAdmin,
        isVeli,
        isSporcu,
        isSube,
        canAccess,
        refreshProfile,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export const useAccessControl = () => useContext(AccessContext);
