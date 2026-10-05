import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { LibrarySnapshot } from '@/store/library';
import { sanitise } from '@/store/library';

/**
 * Bumped only for a change that an older build could not read. Older files stay
 * importable because every field but the marker is optional on the way in.
 */
const FORMAT = 'loglift.backup';
const FORMAT_VERSION = 1;

export const BACKUP_FILE_PREFIX = 'loglift-backup';

/** A file we were asked to hand over is capped: a real backup is a few KB. */
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

/**
 * Carries the snapshot, not the raw storage blob, so a file is self-describing
 * and `exportedAt` lets the settings screen say how old a backup is.
 */
type BackupFile = {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  data: LibrarySnapshot;
};

/** Reported to the caller so a failure can be shown rather than swallowed. */
export type TransferError =
  | 'unreadable'
  | 'notABackup'
  | 'unwritable'
  | 'shareFailed'
  | 'copyFailed';

export type ExportResult =
  | { status: 'shared' }
  | { status: 'copied' }
  | { status: 'nothingToExport' }
  | { status: 'failed'; error: TransferError };

export type ImportResult =
  | { status: 'cancelled' }
  | { status: 'imported'; snapshot: LibrarySnapshot }
  | { status: 'failed'; error: TransferError };

function stamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildBackupFile(snapshot: LibrarySnapshot, now: Date = new Date()): BackupFile {
  return {
    format: FORMAT,
    version: FORMAT_VERSION,
    exportedAt: now.toISOString(),
    data: { unit: snapshot.unit, logs: snapshot.logs },
  };
}

export function backupFileName(now: Date = new Date()): string {
  return `${BACKUP_FILE_PREFIX}-${stamp(now)}.json`;
}

function toJson(snapshot: LibrarySnapshot, now: Date): string {
  return JSON.stringify(buildBackupFile(snapshot, now), null, 2);
}

/**
 * Accepts both our own wrapped file and the bare state shape, so a file copied
 * straight out of storage still imports.
 *
 * An empty-but-valid backup imports as an empty library rather than erroring:
 * "no exercises tracked" is a legitimate thing to move between devices. What
 * cannot be right is a file with nothing recognisable in it.
 */
function readBackupFile(raw: string): LibrarySnapshot | null {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as Partial<BackupFile> & Partial<LibrarySnapshot>;

  if (candidate.format === FORMAT) {
    if (typeof candidate.version !== 'number' || candidate.version > FORMAT_VERSION) {
      return null;
    }
    return candidate.data ? sanitise(candidate.data) : null;
  }

  const looksLikeState =
    typeof candidate.unit === 'string' ||
    (!!candidate.logs && typeof candidate.logs === 'object');

  return looksLikeState ? sanitise(payload) : null;
}

/**
 * Writes the backup to the cache directory and hands it off: the native share
 * sheet where files can be shared, the clipboard on web, where a local file URI
 * means nothing to the Web Share API.
 */
export async function exportLibrary(snapshot: LibrarySnapshot): Promise<ExportResult> {
  if (Object.keys(snapshot.logs).length === 0) {
    return { status: 'nothingToExport' };
  }

  const body = toJson(snapshot, new Date());

  if (Platform.OS === 'web') {
    // The web clipboard reports failure by returning false rather than throwing,
    // so the return value is the only signal we get.
    const copied = await Clipboard.setStringAsync(body);
    return copied ? { status: 'copied' } : { status: 'failed', error: 'copyFailed' };
  }

  const file = new File(Paths.cache, backupFileName());
  try {
    file.create({ overwrite: true });
    file.write(body);
  } catch {
    return { status: 'failed', error: 'unwritable' };
  }

  if (!(await Sharing.isAvailableAsync())) {
    return { status: 'failed', error: 'shareFailed' };
  }

  try {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Export Log Lift data',
    });
    return { status: 'shared' };
  } catch {
    return { status: 'failed', error: 'shareFailed' };
  }
}

export async function importLibrary(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (picked.canceled) {
    return { status: 'cancelled' };
  }

  const asset = picked.assets?.[0];
  if (!asset) {
    return { status: 'failed', error: 'unreadable' };
  }

  let file: File;
  try {
    file = new File(asset.uri);
    if (file.size > MAX_BACKUP_BYTES) {
      return { status: 'failed', error: 'unreadable' };
    }
  } catch {
    return { status: 'failed', error: 'unreadable' };
  }

  let raw: string;
  try {
    raw = await file.text();
  } catch {
    return { status: 'failed', error: 'unreadable' };
  }

  const snapshot = readBackupFile(raw);
  if (!snapshot) {
    return { status: 'failed', error: 'notABackup' };
  }

  return { status: 'imported', snapshot };
}