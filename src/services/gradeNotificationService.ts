import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface GradeNotification {
  id?: string;
  studentId: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  lecturerName: string;
  score: number;
  grade: string;
  actionType: 'NEW_GRADE' | 'UPDATE_GRADE';
  message: string;
  isRead: boolean;
  createdAt: string;
}

const COLLECTION_NAME = 'grade_notifications';

/**
 * Publish a new or updated grade notification to Firestore in real time.
 */
export async function publishGradeNotification(
  notification: Omit<GradeNotification, 'id' | 'createdAt' | 'isRead'> & { isRead?: boolean }
) {
  try {
    const docData: Omit<GradeNotification, 'id'> = {
      ...notification,
      isRead: notification.isRead ?? false,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, COLLECTION_NAME);
  }
}

/**
 * Real-time subscription listener for a student's grade notifications using Firestore onSnapshot.
 */
export function subscribeStudentGradeNotifications(
  studentId: number,
  onData: (notifications: GradeNotification[], newlyAdded?: GradeNotification) => void,
  onError?: (err: any) => void
) {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('studentId', '==', studentId)
  );

  let initialLoadComplete = false;

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: GradeNotification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<GradeNotification, 'id'>)
      }));

      // Sort descending by createdAt
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      let newlyAdded: GradeNotification | undefined = undefined;

      if (initialLoadComplete) {
        // Detect new or updated grade notifications for instant toast alerting
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = { id: change.doc.id, ...(change.doc.data() as Omit<GradeNotification, 'id'>) };
            if (!data.isRead) {
              newlyAdded = data;
            }
          }
        });
      } else {
        initialLoadComplete = true;
      }

      onData(items, newlyAdded);
    },
    (error) => {
      console.error("Firestore onSnapshot error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );

  return unsubscribe;
}

/**
 * Mark a grade notification as read in Firestore.
 */
export async function markGradeNotificationRead(notificationId: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${notificationId}`);
  }
}

/**
 * Dismiss/delete a grade notification from Firestore.
 */
export async function deleteGradeNotification(notificationId: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLLECTION_NAME}/${notificationId}`);
  }
}
