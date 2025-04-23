import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { startOfDay, isBefore, formatDistanceToNow, subHours, parseISO, addDays, isToday ,set, addHours, isValid, format, differenceInHours, differenceInMinutes } from "date-fns";
import { Clock, AlarmClock, CheckCheck } from "lucide-react";
import { toZonedTime, fromZonedTime } from 'date-fns-tz';


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const safeParseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch (e) {
    console.error(`safeParseDate Error parsing "${dateString}":`, e);
    return null;
  }
};
export const isChorePending = (chore, orgSettings) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const lastCompleted = safeParseDate(chore.lastCompletedAt);
  const completed = safeParseDate(chore.completedAt);
  const dueDate = safeParseDate(chore.dueDate);
  const { dailyChoreDeadline = "02:00" } = orgSettings || {};

  // Parse dailyChoreDeadline as time (e.g., "02:00")
  const [hours, minutes] = dailyChoreDeadline.split(":").map(Number);
  const deadlineToday = new Date(now);
  deadlineToday.setHours(hours, minutes, 0, 0);
  if (deadlineToday < now) {
    deadlineToday.setDate(deadlineToday.getDate() + 1);
  }

  // Check if chore is Late (past due but before deadline)
  const isLate = dueDate && dueDate < now && now < deadlineToday;

  switch (chore.frequency) {
    case "Once":
      return (!completed && chore.status !== "Completed") || isLate;
    case "Daily":
      return (
        (!lastCompleted || isBefore(lastCompleted, todayStart)) &&
        (chore.status === "Pending" || isLate)
      );
    default:
      return false;
  }
};

export const getDueDateDisplay = (dueDateString, orgSettings) => {
  const parsed = safeParseDate(dueDateString);
  const now = new Date();
  const { dailyChoreDeadline = "02:00", dailyChoreWindow = 4.0 } = orgSettings || {};

  if (!parsed) return { label: "No Due Date", status: "noDueDate" };

  // Parse dailyChoreDeadline
  const [hours, minutes] = dailyChoreDeadline.split(":").map(Number);
  const deadlineToday = new Date(now);
  deadlineToday.setHours(hours, minutes, 0, 0);
  if (deadlineToday < now) {
    deadlineToday.setDate(deadlineToday.getDate() + 1);
  }

  // Calculate window start
  const windowStart = subHours(parsed, dailyChoreWindow);

  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const comparable = startOfDay(parsed);

  if (comparable.getTime() < today.getTime()) {
    return { label: "Overdue", status: "overdue" };
  } else if (parsed < now && now < deadlineToday) {
    return { label: "Late", status: "late" };
  } else if (comparable.getTime() === today.getTime()) {
    return { label: "Due Today", status: "dueToday" };
  } else if (comparable.getTime() === tomorrow.getTime()) {
    return { label: "Due Tomorrow", status: "dueTomorrow" };
  } else {
    try {
      return {
        label: `Due: ${comparable.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}`,
        status: "otherDate",
      };
    } catch {
      return { label: "Invalid Date", status: "invalidDate" };
    }
  }
};
export const calculateTimeLeft = (dueDateString) => {
  const due = new Date(dueDateString);
  const now = new Date();
  const diffMs = due - now;

  // Already overdue (let server handle status)
  if (diffMs <= 0) return "";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return days > 0 ? `Due in: ${days}d ${hours}h` : `Due in: ${hours}h ${minutes}m`;
};

export const getTimeAgo = (dateString) => {
  const parsed = safeParseDate(dateString);
  return parsed ? formatDistanceToNow(parsed, { addSuffix: true }) : null;
};
export function formatSatsWithCommas(sats) {
  if (typeof sats !== "number" || isNaN(sats)) {
    return "0";
  }
  return sats.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



export function getChoreTimeStatus(chore) {
  // 1. Handle daily chores completed today
  if (chore.frequency === 'Daily' && chore.completedAt) {
    const completedAt = new Date(chore.completedAt);
    const now = new Date();
    const today = now.toLocaleDateString('en-US');
    const completedDate = completedAt.toLocaleDateString('en-US');

    if (completedDate === today) {
      return {
        message: 'Completed Today',
        icon: CheckCheck,
      };
    }
  }

  // 2. Status checks
  if (chore.status === 'Late') return { message: "Late - Penalty Active", icon: AlarmClock };
  if (chore.status === 'Overdue') return { message: "Overdue - Penalty Active", icon: AlarmClock };
  if (!chore.dueDate) return { message: "No due date 🫡", icon: null };

  // 3. Validate dueDate
  const dueDate = new Date(chore.dueDate);
  if (isNaN(dueDate)) return { message: "Invalid due date", icon: null };

  // 4. Active chore time display
  const timeLeft = formatDistanceToNow(dueDate, { addSuffix: true });
  return {
    message: `Due ${timeLeft}`,
    icon: AlarmClock,
  };
}
export function calculateChoreDeadlines(now, deadlineTime, timezone, graceWindow) {
  // Validate inputs
  if (!isValid(now)) throw new Error('Invalid current time');
  if (typeof deadlineTime !== 'string' || !deadlineTime.includes(':')) {
    throw new Error('Deadline must be in "HH:mm" format');
  }
  
  // Format timezone (replace underscores)
  const formattedTimezone = timezone.replace('_', '/');
  
  // Parse deadline
  const [hoursStr, minutesStr] = deadlineTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error('Invalid deadline time format');
  }

  // Calculate deadlines
  try {
    const localNow = toZonedTime(now, formattedTimezone);
    const localDeadline = set(localNow, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0
    });
    
    const utcDeadline = fromZonedTime(localDeadline, formattedTimezone);
    const utcGraceEnd = addHours(utcDeadline, graceWindow);

    if (!isValid(utcDeadline) || !isValid(utcGraceEnd)) {
      throw new Error('Invalid date calculation');
    }

    return { utcDeadline, utcGraceEnd };
  } catch (error) {
    console.error('Deadline calculation error:', error);
    throw new Error('Failed to calculate deadlines');
  }
}