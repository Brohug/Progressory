const pool = require('../config/db');
const { sendClientError, handleServerError } = require('../middleware/errorHandler');

const REQUEST_TYPES = Object.freeze({
  DEMO: 'demo',
  FOUNDER: 'founder'
});

const DEFAULT_TIMEZONE = process.env.PUBLIC_DEMO_BOOKING_TIMEZONE || 'America/Denver';
const DEFAULT_SLOT_HOURS = String(process.env.PUBLIC_DEMO_SLOT_HOURS || '11,13,15')
  .split(',')
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isInteger(value) && value >= 0 && value <= 23);
const DEFAULT_SLOT_WEEKDAYS = String(process.env.PUBLIC_DEMO_SLOT_WEEKDAYS || '1,2,3,4,5')
  .split(',')
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
const DEFAULT_DAYS_AHEAD = (() => {
  const parsed = Number.parseInt(process.env.PUBLIC_DEMO_DAYS_AHEAD || '21', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 21;
})();

const safeTrim = (value) => String(value || '').trim();

let publicInquiriesTableReady = false;

const ensurePublicInquiriesTable = async () => {
  if (publicInquiriesTableReady) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public_inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_type ENUM('demo', 'founder') NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      gym_name VARCHAR(255) NOT NULL,
      demo_slot_start DATETIME NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_public_inquiries_demo_slot_start (demo_slot_start),
      KEY idx_public_inquiries_request_type (request_type),
      KEY idx_public_inquiries_status (status),
      KEY idx_public_inquiries_demo_slot_start (demo_slot_start)
    )
  `);

  publicInquiriesTableReady = true;
};

const getZonedParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    year: Number.parseInt(values.year, 10),
    month: Number.parseInt(values.month, 10),
    day: Number.parseInt(values.day, 10),
    hour: Number.parseInt(values.hour, 10),
    minute: Number.parseInt(values.minute, 10),
    weekday: weekdayMap[values.weekday] ?? null
  };
};

const zonedTimeToUtc = (year, month, day, hour, minute, timeZone) => {
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  for (let index = 0; index < 4; index += 1) {
    const zonedParts = getZonedParts(new Date(utcGuess), timeZone);
    const actualUtcForZonedParts = Date.UTC(
      zonedParts.year,
      zonedParts.month - 1,
      zonedParts.day,
      zonedParts.hour,
      zonedParts.minute,
      0,
      0
    );
    const desiredUtcForLocalTime = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
    const diff = desiredUtcForLocalTime - actualUtcForZonedParts;

    if (diff === 0) {
      break;
    }

    utcGuess += diff;
  }

  return new Date(utcGuess);
};

const getUpcomingLocalDates = (daysAhead, timeZone) => {
  const dates = [];
  const seen = new Set();
  const now = Date.now();

  for (let offset = 0; offset <= daysAhead + 3; offset += 1) {
    const probe = new Date(now + (offset * 24 * 60 * 60 * 1000));
    const zonedParts = getZonedParts(probe, timeZone);
    const key = `${zonedParts.year}-${zonedParts.month}-${zonedParts.day}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    dates.push(zonedParts);
  }

  return dates;
};

const formatSlotLabels = (date, timeZone) => {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit'
  });

  return {
    dateLabel: dateFormatter.format(date),
    timeLabel: timeFormatter.format(date)
  };
};

const getBookedDemoSlotTimes = async () => {
  await ensurePublicInquiriesTable();

  const [rows] = await pool.query(
    `SELECT demo_slot_start
     FROM public_inquiries
     WHERE request_type = ?
       AND demo_slot_start IS NOT NULL`,
    [REQUEST_TYPES.DEMO]
  );

  return new Set(
    rows
      .map((row) => {
        const value = row.demo_slot_start instanceof Date
          ? row.demo_slot_start.getTime()
          : new Date(row.demo_slot_start).getTime();
        return Number.isNaN(value) ? null : value;
      })
      .filter(Boolean)
  );
};

const buildAvailableDemoSlots = async () => {
  const slotHours = DEFAULT_SLOT_HOURS.length > 0 ? DEFAULT_SLOT_HOURS : [11, 13, 15];
  const slotWeekdays = DEFAULT_SLOT_WEEKDAYS.length > 0 ? DEFAULT_SLOT_WEEKDAYS : [1, 2, 3, 4, 5];
  const localDates = getUpcomingLocalDates(DEFAULT_DAYS_AHEAD, DEFAULT_TIMEZONE);
  const bookedTimes = await getBookedDemoSlotTimes();
  const now = Date.now();

  return localDates
    .filter((localDate) => slotWeekdays.includes(localDate.weekday))
    .flatMap((localDate) => (
      slotHours.map((hour) => {
        const utcDate = zonedTimeToUtc(
          localDate.year,
          localDate.month,
          localDate.day,
          hour,
          0,
          DEFAULT_TIMEZONE
        );
        const timestamp = utcDate.getTime();

        if (timestamp <= now + (30 * 60 * 1000) || bookedTimes.has(timestamp)) {
          return null;
        }

        const labels = formatSlotLabels(utcDate, DEFAULT_TIMEZONE);

        return {
          starts_at: utcDate.toISOString(),
          date_label: labels.dateLabel,
          time_label: labels.timeLabel,
          timezone: DEFAULT_TIMEZONE
        };
      })
    ))
    .filter(Boolean)
    .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime());
};

const getPublicDemoSlots = async (req, res) => {
  try {
    const slots = await buildAvailableDemoSlots();

    return res.status(200).json({
      slots,
      timezone: DEFAULT_TIMEZONE
    });
  } catch (error) {
    return handleServerError(res, 'Get public demo slots error:', error);
  }
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createPublicInquiry = async (req, res) => {
  try {
    await ensurePublicInquiriesTable();

    const requestType = safeTrim(req.body?.request_type).toLowerCase();
    const firstName = safeTrim(req.body?.first_name);
    const lastName = safeTrim(req.body?.last_name);
    const email = safeTrim(req.body?.email).toLowerCase();
    const phone = safeTrim(req.body?.phone);
    const gymName = safeTrim(req.body?.gym_name);
    const demoSlotStartRaw = safeTrim(req.body?.demo_slot_start);

    if (![REQUEST_TYPES.DEMO, REQUEST_TYPES.FOUNDER].includes(requestType)) {
      return sendClientError(res, {
        status: 400,
        message: 'Request type must be demo or founder.'
      });
    }

    if (!firstName || !lastName || !email || !phone || !gymName) {
      return sendClientError(res, {
        status: 400,
        message: 'First name, last name, email, phone number, and gym are required.'
      });
    }

    if (!validateEmail(email)) {
      return sendClientError(res, {
        status: 400,
        message: 'Enter a valid email address.'
      });
    }

    let demoSlotStart = null;

    if (requestType === REQUEST_TYPES.DEMO) {
      if (!demoSlotStartRaw) {
        return sendClientError(res, {
          status: 400,
          message: 'Choose an available demo time.'
        });
      }

      demoSlotStart = new Date(demoSlotStartRaw);
      if (Number.isNaN(demoSlotStart.getTime())) {
        return sendClientError(res, {
          status: 400,
          message: 'Choose a valid demo time.'
        });
      }

      const availableSlots = await buildAvailableDemoSlots();
      const isStillAvailable = availableSlots.some((slot) => slot.starts_at === demoSlotStart.toISOString());

      if (!isStillAvailable) {
        return sendClientError(res, {
          status: 409,
          message: 'That demo time is no longer available. Please choose another time.'
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO public_inquiries
       (request_type, first_name, last_name, email, phone, gym_name, demo_slot_start, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestType,
        firstName,
        lastName,
        email,
        phone,
        gymName,
        demoSlotStart,
        requestType === REQUEST_TYPES.DEMO ? 'scheduled' : 'new'
      ]
    );

    return res.status(201).json({
      message: requestType === REQUEST_TYPES.DEMO
        ? 'Demo request submitted successfully.'
        : 'Founder access request submitted successfully.',
      inquiry_id: result.insertId
    });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return sendClientError(res, {
        status: 409,
        message: 'That demo time is no longer available. Please choose another time.'
      });
    }

    return handleServerError(res, 'Create public inquiry error:', error);
  }
};

module.exports = {
  getPublicDemoSlots,
  createPublicInquiry
};
