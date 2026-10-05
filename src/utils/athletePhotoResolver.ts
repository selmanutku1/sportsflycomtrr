import { SporcuItem } from '../types';
import { INITIAL_SPORCULAR } from '../data/mockData';
import { SporcuProfil, getStoredSporcuProfilleri } from '../data/sporcuProfilData';
import { SporcuKarne } from '../data/mockKarneData';

/**
 * Resolves the profile photo URL for any athlete or report card across all storage caches.
 * Ensures that photos set/uploaded in "Sporcular" or "Sporcu Profili" always reflect
 * in "Sporcu Karnesi", modals, and reports.
 */
export function getAthletePhotoUrl(
  target?: {
    id?: string;
    sporcuId?: string;
    adSoyad?: string;
    name?: string;
    avatarUrl?: string;
    fotoUrl?: string;
    fotografUrl?: string;
  } | null,
  cachedSporcular?: SporcuItem[],
  cachedProfiller?: Record<string, SporcuProfil>
): string | undefined {
  if (!target) return undefined;

  // 1. Direct photo properties on the target object
  if (target.avatarUrl && target.avatarUrl.trim() !== '') return target.avatarUrl;
  if (target.fotoUrl && target.fotoUrl.trim() !== '') return target.fotoUrl;
  if (target.fotografUrl && target.fotografUrl.trim() !== '') return target.fotografUrl;

  const targetName = (target.name || target.adSoyad || '').trim().toLowerCase();
  const rawId = (target.id || target.sporcuId || '').trim();
  const numericId = rawId.replace(/\D/g, '');

  // 2. Search in sporcular array (sportsfly_sporcular)
  let sporcularList = cachedSporcular;
  if (!sporcularList || sporcularList.length === 0) {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sportsfly_sporcular');
        sporcularList = saved ? JSON.parse(saved) : INITIAL_SPORCULAR;
      } catch (e) {
        sporcularList = INITIAL_SPORCULAR;
      }
    } else {
      sporcularList = INITIAL_SPORCULAR;
    }
  }

  if (sporcularList && sporcularList.length > 0) {
    // Exact ID match
    const byId = sporcularList.find((s) => s.id === rawId);
    if (byId?.avatarUrl && byId.avatarUrl.trim() !== '') return byId.avatarUrl;

    // Numeric ID alias match (e.g., 's1' <-> 's-1')
    if (numericId) {
      const byNumId = sporcularList.find(
        (s) => s.id === `s-${numericId}` || s.id === `s${numericId}` || s.code === numericId
      );
      if (byNumId?.avatarUrl && byNumId.avatarUrl.trim() !== '') return byNumId.avatarUrl;
    }

    // Name match
    if (targetName) {
      const byName = sporcularList.find(
        (s) => s.name && s.name.trim().toLowerCase() === targetName
      );
      if (byName?.avatarUrl && byName.avatarUrl.trim() !== '') return byName.avatarUrl;
    }
  }

  // 3. Search in sporcu profilleri (sportsfly_sporcu_profilleri)
  let profillerMap = cachedProfiller;
  if (!profillerMap || Object.keys(profillerMap).length === 0) {
    profillerMap = getStoredSporcuProfilleri();
  }

  if (profillerMap) {
    // Direct ID keys
    if (rawId && profillerMap[rawId]?.kimlik?.fotoUrl) {
      return profillerMap[rawId].kimlik.fotoUrl;
    }
    if (numericId) {
      if (profillerMap[`s-${numericId}`]?.kimlik?.fotoUrl) {
        return profillerMap[`s-${numericId}`].kimlik.fotoUrl;
      }
      if (profillerMap[`s${numericId}`]?.kimlik?.fotoUrl) {
        return profillerMap[`s${numericId}`].kimlik.fotoUrl;
      }
    }

    // By name in profiller
    if (targetName) {
      for (const key of Object.keys(profillerMap)) {
        const profil = profillerMap[key];
        if (
          profil?.kimlik?.adSoyad &&
          profil.kimlik.adSoyad.trim().toLowerCase() === targetName &&
          profil.kimlik.fotoUrl
        ) {
          return profil.kimlik.fotoUrl;
        }
      }
    }
  }

  // 4. Ultimate fallback: INITIAL_SPORCULAR
  if (INITIAL_SPORCULAR && INITIAL_SPORCULAR.length > 0) {
    const fallback = INITIAL_SPORCULAR.find(
      (s) =>
        s.id === rawId ||
        (targetName && s.name.trim().toLowerCase() === targetName) ||
        (numericId && s.id === `s-${numericId}`)
    );
    if (fallback?.avatarUrl) return fallback.avatarUrl;
  }

  return undefined;
}

/**
 * Returns clean 2-letter uppercase initials for avatar fallbacks.
 */
export function getAthleteInitials(name?: string): string {
  if (!name || name.trim() === '') return 'SP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
