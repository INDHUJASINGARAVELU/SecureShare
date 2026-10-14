export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function getRemainingTime(expiresAtIso: string): {
  totalSeconds: number;
  formatted: string;
  isExpired: boolean;
  isUrgent: boolean; // less than 2 minutes
} {
  const diff = new Date(expiresAtIso).getTime() - Date.now();
  if (diff <= 0) {
    return {
      totalSeconds: 0,
      formatted: '00:00',
      isExpired: true,
      isUrgent: false,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return {
    totalSeconds,
    formatted,
    isExpired: false,
    isUrgent: totalSeconds < 120, // < 2 mins warning
  };
}

export function truncateMiddle(str: string, maxLength: number = 24): string {
  if (str.length <= maxLength) return str;
  const start = Math.ceil((maxLength - 3) / 2);
  const end = Math.floor((maxLength - 3) / 2);
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}
