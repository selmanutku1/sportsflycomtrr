import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  QueryConstraint,
  Unsubscribe,
  DocumentData,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import {
  db,
  auth,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  FirestoreSporcuDoc,
  FirestoreEgitmenDoc,
  FirestoreGrupDoc,
  FirestoreGrupUyesiDoc,
  mapSporcuToFirestoreDoc,
  mapEgitmenToFirestoreDoc,
  mapGrupToFirestoreDoc,
} from './firestoreCollectionsSchema';
import { INITIAL_SPORCULAR, INITIAL_EGITMENLER } from '../data/mockData';
import { INITIAL_GRUPLAR } from '../data/mockMuhasebeData';

/**
 * Blueprint & Firestore Rules Uyumluluk Sabitleri
 * (firebase-blueprint.json ve firestore.rules ile birebir senkronize)
 */
export const FIRESTORE_CONSTRAINTS = {
  ID_REGEX: /^[a-zA-Z0-9_\-]+$/,
  MAX_ID_LENGTH: 128,
  MAX_CODE_LENGTH: 32,
  MAX_NAME_LENGTH: 120,
  MAX_GROUP_NAME_LENGTH: 140,
  MAX_EMAIL_LENGTH: 160,
  MAX_PHONE_LENGTH: 32,
  MAX_FACILITY_LENGTH: 140,
  MAX_BRANCH_LENGTH: 80,
  MAX_ASSIGNED_GROUPS: 20,
  MAX_PRIMARY_ATHLETES: 50,
  MAX_SCHEDULE_DAYS: 7,
  MAX_DESCRIPTION_LENGTH: 600,
  MAX_AVATAR_URL_LENGTH: 500,
} as const;

/**
 * Ana Koleksiyon İsimleri ve Şema Eşleşmesi
 */
export interface FirestoreCollectionMap {
  sporcular: FirestoreSporcuDoc;
  egitmenler: FirestoreEgitmenDoc;
  gruplar: FirestoreGrupDoc;
}

export type FirestoreCollectionKey = keyof FirestoreCollectionMap;

/**
 * Yardımcı: Geçerli oturum açmış kullanıcının UID bilgisini döndürür.
 */
export function getAuthenticatedOwnerId(explicitOwnerId?: string): string {
  const uid = explicitOwnerId || auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Firestore işlemi için aktif kullanıcı oturumu (auth.currentUser.uid) gereklidir.');
  }
  return uid;
}

/**
 * Yardımcı: ID değerinin firestore.rules isValidId() kuralına uygunluğunu doğrular.
 */
export function ensureValidDocumentId(id: string): string {
  const sanitized = String(id || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .slice(0, FIRESTORE_CONSTRAINTS.MAX_ID_LENGTH);

  if (!sanitized || !FIRESTORE_CONSTRAINTS.ID_REGEX.test(sanitized)) {
    throw new Error(`Geçersiz Firestore doküman ID formatı: "${id}"`);
  }
  return sanitized;
}

/**
 * Yardımcı: Nesne içindeki `undefined` alanları temizler (Firestore `undefined` kabul etmez).
 */
function stripUndefinedFields<T extends Record<string, unknown>>(obj: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/**
 * Koleksiyon Bazlı Savunmacı Veri Doğrulama ve Kırpma (Defensive Payload Sanitizer)
 * Outgoing verilerin `firebase-blueprint.json` ve `firestore.rules` sınırlarına uymasını garanti eder.
 */
function sanitizeCollectionPayload<K extends FirestoreCollectionKey>(
  collectionName: K,
  rawPayload: Record<string, unknown>
): Record<string, unknown> {
  const payload = stripUndefinedFields({ ...rawPayload });

  if (typeof payload.name === 'string') {
    const maxLen =
      collectionName === 'gruplar'
        ? FIRESTORE_CONSTRAINTS.MAX_GROUP_NAME_LENGTH
        : FIRESTORE_CONSTRAINTS.MAX_NAME_LENGTH;
    payload.name = payload.name.trim().slice(0, maxLen);
  }

  if (typeof payload.email === 'string') {
    payload.email = payload.email.trim().slice(0, FIRESTORE_CONSTRAINTS.MAX_EMAIL_LENGTH);
  }

  if (typeof payload.phone === 'string') {
    payload.phone = payload.phone.trim().slice(0, FIRESTORE_CONSTRAINTS.MAX_PHONE_LENGTH);
  }

  if (typeof payload.facility === 'string') {
    payload.facility = payload.facility.trim().slice(0, FIRESTORE_CONSTRAINTS.MAX_FACILITY_LENGTH);
  }

  if (typeof payload.branch === 'string') {
    payload.branch = payload.branch.trim().slice(0, FIRESTORE_CONSTRAINTS.MAX_BRANCH_LENGTH);
  }

  if (typeof payload.avatarUrl === 'string') {
    payload.avatarUrl = payload.avatarUrl.trim().slice(0, FIRESTORE_CONSTRAINTS.MAX_AVATAR_URL_LENGTH);
  }

  if (typeof payload.description === 'string') {
    payload.description = payload.description.trim().slice(0, FIRESTORE_CONSTRAINTS.MAX_DESCRIPTION_LENGTH);
  }

  if (Array.isArray(payload.assignedGroupIds)) {
    payload.assignedGroupIds = payload.assignedGroupIds
      .slice(0, FIRESTORE_CONSTRAINTS.MAX_ASSIGNED_GROUPS)
      .map((id) => ensureValidDocumentId(String(id)));
  }

  if (Array.isArray(payload.primaryAthleteIds)) {
    payload.primaryAthleteIds = payload.primaryAthleteIds
      .slice(0, FIRESTORE_CONSTRAINTS.MAX_PRIMARY_ATHLETES)
      .map((id) => ensureValidDocumentId(String(id)));
  }

  if (Array.isArray(payload.scheduleDays)) {
    payload.scheduleDays = payload.scheduleDays
      .slice(0, FIRESTORE_CONSTRAINTS.MAX_SCHEDULE_DAYS)
      .map((day) => String(day).slice(0, 32));
  }

  return payload;
}

// ============================================================================
// 1. GENERIC CRUD FONKSİYONLARI (sporcular | egitmenler | gruplar)
// ============================================================================

export type CreatePayload<K extends FirestoreCollectionKey> = Omit<
  FirestoreCollectionMap[K],
  'id' | 'ownerId' | 'createdAt' | 'updatedAt'
> & {
  id?: string;
  ownerId?: string;
};

export type UpdatePayload<K extends FirestoreCollectionKey> = Partial<
  Omit<FirestoreCollectionMap[K], 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
>;

/**
 * [CREATE] Koleksiyona yeni bir doküman ekler.
 * `id` belirtilmezse otomatik güvenli bir ID üretir ve doküman içi `id` alanıyla eşitler.
 */
export async function addDocument<K extends FirestoreCollectionKey>(
  collectionName: K,
  data: CreatePayload<K>
): Promise<FirestoreCollectionMap[K]> {
  const ownerId = getAuthenticatedOwnerId(data.ownerId);
  const colRef = collection(db, collectionName);
  const rawDocId = data.id || doc(colRef).id;
  const docId = ensureValidDocumentId(rawDocId);
  const docPath = `${collectionName}/${docId}`;

  const sanitized = sanitizeCollectionPayload(collectionName, {
    ...data,
    id: docId,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, collectionName, docId), sanitized);
    return sanitized as unknown as FirestoreCollectionMap[K];
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * [READ - SINGLE] Belirtilen koleksiyondan tek bir dokümanı ID ile getirir.
 */
export async function getDocumentById<K extends FirestoreCollectionKey>(
  collectionName: K,
  docId: string
): Promise<FirestoreCollectionMap[K] | null> {
  const validId = ensureValidDocumentId(docId);
  const docPath = `${collectionName}/${validId}`;

  try {
    const snap = await getDoc(doc(db, collectionName, validId));
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...snap.data() } as FirestoreCollectionMap[K];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * [READ - LIST] Belirtilen koleksiyondaki dokümanları `ownerId` güvenlik filtresiyle listeler.
 * İsteğe bağlı olarak çapraz referans filtreleri (`where('groupId', '==', 'grp-1')` vb.) eklenebilir.
 */
export async function getDocuments<K extends FirestoreCollectionKey>(
  collectionName: K,
  extraConstraints: QueryConstraint[] = [],
  explicitOwnerId?: string
): Promise<FirestoreCollectionMap[K][]> {
  const ownerId = getAuthenticatedOwnerId(explicitOwnerId);

  try {
    const q = query(
      collection(db, collectionName),
      where('ownerId', '==', ownerId),
      ...extraConstraints
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as FirestoreCollectionMap[K])
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

/**
 * [UPDATE] Belirtilen dokümanın izin verilen alanlarını günceller ve `updatedAt` zaman damgasını yeniler.
 */
export async function updateDocument<K extends FirestoreCollectionKey>(
  collectionName: K,
  docId: string,
  partialData: UpdatePayload<K>
): Promise<void> {
  const validId = ensureValidDocumentId(docId);
  const docPath = `${collectionName}/${validId}`;

  // Değiştirilemez (immutable) alanları güncelleme paketinden çıkar
  const safeClone = { ...(partialData as Record<string, unknown>) };
  delete safeClone.id;
  delete safeClone.ownerId;
  delete safeClone.code;
  delete safeClone.createdAt;

  const sanitizedUpdate = sanitizeCollectionPayload(collectionName, {
    ...safeClone,
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, collectionName, validId), sanitizedUpdate as DocumentData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * [DELETE] Belirtilen dokümanı koleksiyondan siler.
 */
export async function deleteDocument<K extends FirestoreCollectionKey>(
  collectionName: K,
  docId: string
): Promise<void> {
  const validId = ensureValidDocumentId(docId);
  const docPath = `${collectionName}/${validId}`;

  try {
    await deleteDoc(doc(db, collectionName, validId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * [REALTIME SUBSCRIBE] Koleksiyonu gerçek zamanlı (`onSnapshot`) dinler.
 * Yalnızca aktif kullanıcı oturumu varsa bağlantı kurar.
 */
export function subscribeToCollection<K extends FirestoreCollectionKey>(
  collectionName: K,
  onData: (items: FirestoreCollectionMap[K][]) => void,
  extraConstraints: QueryConstraint[] = [],
  onErrorCallback?: (error: unknown) => void
): Unsubscribe {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return () => {};
  }

  const q = query(
    collection(db, collectionName),
    where('ownerId', '==', currentUser.uid),
    ...extraConstraints
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as FirestoreCollectionMap[K])
      );
      onData(items);
    },
    (error) => {
      if (onErrorCallback) {
        onErrorCallback(error);
      }
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
  );
}

// ============================================================================
// 2. KOLEKSİYON BAZLI ÖZELLEŞTİRİLMİŞ SERVİSLER & ÇAPRAZ REFERANS SORGULARI
// ============================================================================

export const sporcularService = {
  add: (data: CreatePayload<'sporcular'>) => addDocument('sporcular', data),
  getById: (sporcuId: string) => getDocumentById('sporcular', sporcuId),
  getAll: (constraints?: QueryConstraint[]) => getDocuments('sporcular', constraints),
  /** Çapraz Referans: Belirli bir gruba (`groupId`) kayıtlı tüm sporcuları getirir */
  getByGroupId: (groupId: string) =>
    getDocuments('sporcular', [where('groupId', '==', ensureValidDocumentId(groupId))]),
  /** Çapraz Referans: Belirli bir eğitmene (`trainerId`) bağlı tüm sporcuları getirir */
  getByTrainerId: (trainerId: string) =>
    getDocuments('sporcular', [where('trainerId', '==', ensureValidDocumentId(trainerId))]),
  update: (sporcuId: string, data: UpdatePayload<'sporcular'>) =>
    updateDocument('sporcular', sporcuId, data),
  delete: (sporcuId: string) => deleteDocument('sporcular', sporcuId),
  subscribe: (
    onData: (items: FirestoreSporcuDoc[]) => void,
    constraints?: QueryConstraint[]
  ) => subscribeToCollection('sporcular', onData, constraints),
};

export const egitmenlerService = {
  add: (data: CreatePayload<'egitmenler'>) => addDocument('egitmenler', data),
  getById: (egitmenId: string) => getDocumentById('egitmenler', egitmenId),
  getAll: (constraints?: QueryConstraint[]) => getDocuments('egitmenler', constraints),
  /** Çapraz Referans: Belirli bir grubun (`groupId`) atandığı eğitmenleri getirir */
  getByAssignedGroupId: (groupId: string) =>
    getDocuments('egitmenler', [
      where('assignedGroupIds', 'array-contains', ensureValidDocumentId(groupId)),
    ]),
  update: (egitmenId: string, data: UpdatePayload<'egitmenler'>) =>
    updateDocument('egitmenler', egitmenId, data),
  delete: (egitmenId: string) => deleteDocument('egitmenler', egitmenId),
  subscribe: (
    onData: (items: FirestoreEgitmenDoc[]) => void,
    constraints?: QueryConstraint[]
  ) => subscribeToCollection('egitmenler', onData, constraints),
};

export const gruplarService = {
  add: (data: CreatePayload<'gruplar'>) => addDocument('gruplar', data),
  getById: (grupId: string) => getDocumentById('gruplar', grupId),
  getAll: (constraints?: QueryConstraint[]) => getDocuments('gruplar', constraints),
  update: (grupId: string, data: UpdatePayload<'gruplar'>) => updateDocument('gruplar', grupId, data),
  delete: (grupId: string) => deleteDocument('gruplar', grupId),
  subscribe: (
    onData: (items: FirestoreGrupDoc[]) => void,
    constraints?: QueryConstraint[]
  ) => subscribeToCollection('gruplar', onData, constraints),
};

export interface FirestoreSporOkuluBasvurusuDoc {
  id: string;
  clubName: string;
  managerName: string;
  email: string;
  phone: string;
  city?: string;
  district?: string;
  branches?: string[];
  selectedPlan: string;
  athleteCount?: string;
  status: 'onay_bekliyor' | 'onaylandi' | 'reddedildi' | 'askida';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export const basvurularService = {
  async add(data: Omit<FirestoreSporOkuluBasvurusuDoc, 'createdAt' | 'updatedAt'>) {
    const docId = ensureValidDocumentId(data.id || doc(collection(db, 'spor-okulu-basvurulari')).id);
    const payload = stripUndefinedFields({
      ...data,
      id: docId,
      status: data.status || 'onay_bekliyor',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    try {
      await setDoc(doc(db, 'spor-okulu-basvurulari', docId), payload);
      return payload;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `spor-okulu-basvurulari/${docId}`);
    }
  },

  subscribeToAll(
    onData: (items: FirestoreSporOkuluBasvurusuDoc[]) => void,
    onErrorCallback?: (err: unknown) => void
  ): Unsubscribe {
    const colRef = collection(db, 'spor-okulu-basvurulari');
    return onSnapshot(
      colRef,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSporOkuluBasvurusuDoc));
        onData(items);
      },
      (error) => {
        if (onErrorCallback) onErrorCallback(error);
        handleFirestoreError(error, OperationType.LIST, 'spor-okulu-basvurulari');
      }
    );
  },

  subscribeToPending(
    onData: (pendingCount: number, items: FirestoreSporOkuluBasvurusuDoc[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'spor-okulu-basvurulari'),
      where('status', '==', 'onay_bekliyor')
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSporOkuluBasvurusuDoc));
        onData(items.length, items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'spor-okulu-basvurulari');
      }
    );
  },
};

// ============================================================================
// 3. VERİTABANI ŞEMA DOĞRULAMA & ÖRNEK VERİ YÜKLEME (populateDatabase)
// ============================================================================

export interface PopulateDatabaseResult {
  populated: boolean;
  verified: boolean;
  ownerId: string;
  counts: {
    sporcular: number;
    egitmenler: number;
    gruplar: number;
    grupUyeleri: number;
  };
  sampleVerification?: {
    sporcuGroupId?: string;
    sporcuTrainerId?: string;
    egitmenAssignedGroupIds?: string[];
    grupInstructorId?: string;
  };
}

/**
 * Yönetim Fonksiyonu: `populateDatabase`
 * Firestore veritabanı şema kurulumunu ve çapraz referanslarını (`groupId`, `trainerId`,
 * `assignedGroupIds`, `instructorId`, `primaryAthleteIds`) doğrulamak için `sporcular`,
 * `egitmenler`, `gruplar` ve `/gruplar/{grupId}/uyeler` koleksiyonlarına örnek verileri
 * atomik (`writeBatch`) olarak yazar ve şema bütünlüğünü kontrol eder.
 */
export async function populateDatabase(options?: {
  forceOverwrite?: boolean;
}): Promise<PopulateDatabaseResult> {
  const ownerId = getAuthenticatedOwnerId();
  const forceOverwrite = Boolean(options?.forceOverwrite);

  // Eğer veritabanında kayıt varsa ve forceOverwrite: false ise mevcut durumu doğrula
  if (!forceOverwrite) {
    const [existingGruplar, existingEgitmenler, existingSporcular] = await Promise.all([
      gruplarService.getAll(),
      egitmenlerService.getAll(),
      sporcularService.getAll(),
    ]);

    if (
      existingGruplar.length > 0 &&
      existingEgitmenler.length > 0 &&
      existingSporcular.length > 0
    ) {
      const sampleSporcu = existingSporcular[0];
      const sampleEgitmen = existingEgitmenler[0];
      const sampleGrup = existingGruplar[0];

      return {
        populated: false,
        verified: Boolean(
          sampleSporcu?.groupId &&
            sampleSporcu?.trainerId &&
            Array.isArray(sampleEgitmen?.assignedGroupIds) &&
            sampleGrup?.instructorId
        ),
        ownerId,
        counts: {
          sporcular: existingSporcular.length,
          egitmenler: existingEgitmenler.length,
          gruplar: existingGruplar.length,
          grupUyeleri: 0,
        },
        sampleVerification: {
          sporcuGroupId: sampleSporcu?.groupId,
          sporcuTrainerId: sampleSporcu?.trainerId,
          egitmenAssignedGroupIds: sampleEgitmen?.assignedGroupIds,
          grupInstructorId: sampleGrup?.instructorId,
        },
      };
    }
  }

  const batch = writeBatch(db);
  let uyeTotal = 0;

  // Branş bazlı çapraz referans eşleştirmeleri (Gruplar <-> Eğitmenler <-> Sporcular)
  const trainerAssignedGroupMap: Record<string, string[]> = {
    'e-1': ['grp-2'],
    'e-2': ['grp-1'],
    'e-3': ['grp-3'],
    'e-4': ['grp-4'],
    'e-5': ['grp-2'],
    'e-6': ['grp-5'],
  };

  const groupInstructorMap: Record<string, { instructorId: string; primaryAthleteIds: string[] }> = {
    'grp-1': { instructorId: 'e-2', primaryAthleteIds: ['s-1', 's-3', 's-6'] },
    'grp-2': { instructorId: 'e-1', primaryAthleteIds: ['s-4'] },
    'grp-3': { instructorId: 'e-3', primaryAthleteIds: ['s-5'] },
    'grp-4': { instructorId: 'e-4', primaryAthleteIds: ['s-1'] },
    'grp-5': { instructorId: 'e-6', primaryAthleteIds: ['s-2'] },
  };

  // 1. Gruplar (/gruplar/{grupId}) ve Alt Koleksiyon Üyeleri (/gruplar/{grupId}/uyeler/{uyeId})
  for (const grup of INITIAL_GRUPLAR) {
    const rel = groupInstructorMap[grup.id];
    const { grupDoc, uyeDocs } = mapGrupToFirestoreDoc(grup, ownerId, {
      instructorId: rel?.instructorId,
      primaryAthleteIds: rel?.primaryAthleteIds,
    });

    batch.set(
      doc(db, 'gruplar', grupDoc.id),
      stripUndefinedFields(grupDoc as unknown as Record<string, unknown>)
    );

    for (const uye of uyeDocs) {
      batch.set(
        doc(db, 'gruplar', grupDoc.id, 'uyeler', uye.id),
        stripUndefinedFields(uye as unknown as Record<string, unknown>)
      );
      uyeTotal++;
    }
  }

  // 2. Eğitmenler (/egitmenler/{egitmenId})
  for (const egitmen of INITIAL_EGITMENLER) {
    const assignedIds = trainerAssignedGroupMap[egitmen.id] || ['grp-1'];
    const egitmenDoc = mapEgitmenToFirestoreDoc(egitmen, ownerId, assignedIds);
    batch.set(
      doc(db, 'egitmenler', egitmenDoc.id),
      stripUndefinedFields(egitmenDoc as unknown as Record<string, unknown>)
    );
  }

  // 3. Sporcular (/sporcular/{sporcuId})
  for (const sporcu of INITIAL_SPORCULAR) {
    const sporcuDoc = mapSporcuToFirestoreDoc(sporcu, ownerId);
    batch.set(
      doc(db, 'sporcular', sporcuDoc.id),
      stripUndefinedFields(sporcuDoc as unknown as Record<string, unknown>)
    );
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'populateDatabase/batchCommit');
  }

  // 4. Yazılan şemayı ve çapraz referansları oku & doğrula
  const [verifiedSporcu, verifiedEgitmen, verifiedGrup] = await Promise.all([
    sporcularService.getById(INITIAL_SPORCULAR[0].id),
    egitmenlerService.getById(INITIAL_EGITMENLER[0].id),
    gruplarService.getById(INITIAL_GRUPLAR[0].id),
  ]);

  const isSchemaVerified = Boolean(
    verifiedSporcu?.groupId &&
      verifiedSporcu?.trainerId &&
      Array.isArray(verifiedEgitmen?.assignedGroupIds) &&
      verifiedGrup?.instructorId
  );

  return {
    populated: true,
    verified: isSchemaVerified,
    ownerId,
    counts: {
      sporcular: INITIAL_SPORCULAR.length,
      egitmenler: INITIAL_EGITMENLER.length,
      gruplar: INITIAL_GRUPLAR.length,
      grupUyeleri: uyeTotal,
    },
    sampleVerification: {
      sporcuGroupId: verifiedSporcu?.groupId,
      sporcuTrainerId: verifiedSporcu?.trainerId,
      egitmenAssignedGroupIds: verifiedEgitmen?.assignedGroupIds,
      grupInstructorId: verifiedGrup?.instructorId,
    },
  };
}

/**
 * Geriye dönük uyumluluk için yardımcı sarmalayıcı (alias).
 */
export async function seedInitialCoreCollectionsIfEmpty(): Promise<{
  seeded: boolean;
  counts: { sporcular: number; egitmenler: number; gruplar: number; grupUyeleri: number };
}> {
  if (!auth.currentUser) {
    return {
      seeded: false,
      counts: { sporcular: 0, egitmenler: 0, gruplar: 0, grupUyeleri: 0 },
    };
  }
  const result = await populateDatabase({ forceOverwrite: false });
  return {
    seeded: result.populated,
    counts: result.counts,
  };
}
