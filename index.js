const TelegramApi = require("node-telegram-bot-api");
const token = "7503662743:AAHWovLJWpUTtRZwfSPcRdPwbeHib08v6Mc";
const bot = new TelegramApi(token, { polling: true });

let isSwitched = false;
function translateDayOfWeek(day) {
  const translation = {
    monday: "Понеділок",
    tuesday: "Вівторок",
    wednesday: "Середа",
    thursday: "Четвер",
    friday: "П'ятниця",
    saturday: "Субота",
    sunday: "Неділя",
  };

  return translation[day] || day;
}

const schedule = {
  evenWeek: {
    monday: [
      { time: "08:40 - 10:15", subject: "Досипати😴" },
      { time: "10:35 - 12:10", subject: "Чисельні методи (пр.)" },
      { time: "12:20 - 13:55", subject: "Теорія програмування (пр.)" },
    ],
    tuesday: [{ time: "Самопідготовка", subject: "" }],
    wednesday: [
      { time: "08:40 - 10:15", subject: "Системне програмування (лекц.)" },
      { time: "10:35 - 12:10", subject: "Чисельні методи (лекц.)" },
      {
        time: "12:20 - 13:55",
        subject: "Сучасні технології баз даних (лекц.)",
      },
    ],
    thursday: [
      { time: "08:40 - 10:15", subject: "АС,К та ЗІ (пр.)" },
      { time: "10:35 - 12:10", subject: "WEB-технології (лекц.)" },
      { time: "12:20 - 13:55", subject: "WEB-технології (пр.)" },
    ],
    friday: [
      { time: "08:40 - 10:15", subject: "Теорія програмування (лекц.)" },
      { time: "10:35 - 12:10", subject: "АС,К та ЗІ (пр.)" },
    ],
  },
  oddWeek: {
    monday: [
      { time: "08:40 - 10:15", subject: "Досипати😴" },
      { time: "10:35 - 12:10", subject: "Чисельні методи (пр.)" },
      { time: "12:20 - 13:55", subject: "Теорія програмування (пр.)" },
    ],
    tuesday: [{ time: "Самопідготовка", subject: "" }],
    wednesday: [
      { time: "08:40 - 10:15", subject: "Системне програмування (лекц.)" },
      { time: "10:35 - 12:10", subject: "Чисельні методи (лекц.)" },
      { time: "12:20 - 13:55", subject: "Системне програмування (лекц.)" },
    ],
    thursday: [
      { time: "08:40 - 10:15", subject: "Системне програмування (пр.)" },
      { time: "10:35 - 12:10", subject: "WEB-технології (лекц.)" },
      {
        time: "12:20 - 13:55",
        subject: "Сучасні технології баз даних (лекц.)",
      },
    ],
    friday: [
      { time: "08:40 - 10:15", subject: "Теорія програмування (лекц.)" },
      { time: "10:35 - 12:10", subject: "АС,К та ЗІ (пр.)" },
      { time: "12:20 - 13:55", subject: "Науковий образ світу (лекц.)" },
    ],
  },
};

function getDayOfWeek() {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = new Date();
  return days[today.getDay()];
}

function isEvenWeek() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - startOfYear) / 86400000;
  const currentWeekNumber = Math.ceil(
    (pastDaysOfYear + startOfYear.getDay() + 1) / 7
  );
  let evenWeek = currentWeekNumber % 2 === 0;

  if (isSwitched) {
    evenWeek = !evenWeek;
  }
  return evenWeek;
}
function getCurrentLesson() {
  const today = new Date();
  const currentHour = today.getHours();
  const currentMinutes = today.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes;

  const daySchedule =
    (isEvenWeek() ? schedule.evenWeek : schedule.oddWeek)[getDayOfWeek()] || [];
  let currentLesson = null;

  daySchedule.forEach((lesson) => {
    if (!lesson.time.includes("-")) return;
    const [start, end] = lesson.time.split(" - ").map((t) => {
      const [hours, minutes] = t.split(":").map(Number);
      return hours * 60 + minutes;
    });

    if (currentTime >= start && currentTime <= end) {
      currentLesson = lesson;
    } else if (!currentLesson && currentTime < start) {
      currentLesson = lesson;
    }
  });

  return currentLesson;
}


bot.on("message", (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;


  if (text === "/now") {
    const currentLesson = getCurrentLesson();
    if (currentLesson) {
      bot.sendMessage(
        chatId,
        `Зараз або ось-ось почнеться пара: ${currentLesson.subject} (${currentLesson.time})`
      );
    } else {
      bot.sendMessage(chatId, "На сьогодні більше пар немає!");
    }
  }


  if (text === "/today") {
    const today = getDayOfWeek();
    const daySchedule =
      (isEvenWeek() ? schedule.evenWeek : schedule.oddWeek)[today] || [];

    if (daySchedule.length === 0) {
      bot.sendMessage(chatId, "Сьогодні у вас немає занять!");
    } else {
      let message = `Розклад на сьогодні (${translateDayOfWeek(
        today
      ).toUpperCase()}):\n\n`;
      daySchedule.forEach((lesson, index) => {
        message += `Пара ${index + 1}: ${lesson.subject} (${lesson.time})\n`;
      });
      bot.sendMessage(chatId, message);
    }
  }

  if (text === "/even") {
    const parity = isEvenWeek() ? "парний" : "непарний";
    let message = `Цей тиждень ${parity}.`;
    bot.sendMessage(chatId, message);
  }


  if (text === "/week") {
    const parity = isEvenWeek() ? "парний" : "непарний";
    const currentSchedule = isEvenWeek() ? schedule.evenWeek : schedule.oddWeek;

    let message = `Цей тиждень ${parity}.\n\nРозклад на тиждень:\n`;

    Object.keys(currentSchedule).forEach((day) => {
      message += `\n${translateDayOfWeek(day).toUpperCase()}:\n`;
      currentSchedule[day].forEach((lesson, index) => {
        message += `Пара ${index + 1}: ${lesson.subject} (${lesson.time})\n`;
      });
    });

    bot.sendMessage(chatId, message);
  }

  if (text === "/switchweek") {
    isSwitched = !isSwitched;
    const parity = isEvenWeek() ? "парний" : "непарний";
    bot.sendMessage(chatId, `Тижні перемкнуто. Тепер цей тиждень ${parity}.`);
  }
  if (text === "/help") {
    isSwitched = !isSwitched;
    const parity = isEvenWeek() ? "парний" : "непарний";
    bot.sendMessage(
      chatId,
      `/even - Показує, чи парний зараз тиждень.\n/now - Показує, яка зараз пара.\n/today - Показує розклад на сьогодні.\n/week - Показує розклад на тиждень.\n/switchweek - Перемикає парність тижня.`
    );
  }
});
