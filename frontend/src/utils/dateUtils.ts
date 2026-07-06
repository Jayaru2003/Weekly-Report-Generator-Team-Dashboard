export function getWeekRange(date: Date) {
  // Create a copy to avoid mutating original date
  const tempDate = new Date(date.getTime());
  const day = tempDate.getDay();
  const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(tempDate.setDate(diff));
  
  const sunday = new Date(monday.getTime());
  sunday.setDate(monday.getDate() + 6);
  
  const format = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };
  
  return {
    start: format(monday),
    end: format(sunday),
  };
}

export function formatRelativeTime(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}
