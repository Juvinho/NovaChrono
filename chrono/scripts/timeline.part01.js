'use strict';

function toDateKey(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
      }

function formatDateBr(date) {
        var normalizedDate = startOfDay(date);
        var day = String(normalizedDate.getDate()).padStart(2, '0');
        var month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
        var year = String(normalizedDate.getFullYear());
        return day + '/' + month + '/' + year;
      }

function fromDateKey(key) {
        var parts = String(key || '').split('-');
        if (parts.length !== 3) {
          var fallback = new Date();
          fallback.setHours(0, 0, 0, 0);
          return fallback;
        }
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }

function parseDateBr(value) {
        var match = String(value || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) {
          return null;
        }

        var day = Number(match[1]);
        var month = Number(match[2]);
        var year = Number(match[3]);
        var parsed = new Date(year, month - 1, day);
        parsed.setHours(0, 0, 0, 0);

        if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
          return null;
        }

        return parsed;
      }

function parseJumpDate(value) {
        var raw = String(value || '').trim();

        if (!raw) {
          return null;
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
          return parseDateBr(raw);
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          var isoDate = fromDateKey(raw);
          return toDateKey(isoDate) === raw ? isoDate : null;
        }

        return null;
      }

function maskDateBrInput(value) {
        var digits = String(value || '').replace(/\D/g, '').slice(0, 8);
        var chunks = [];

        if (digits.length > 0) {
          chunks.push(digits.slice(0, 2));
        }

        if (digits.length > 2) {
          chunks.push(digits.slice(2, 4));
        }

        if (digits.length > 4) {
          chunks.push(digits.slice(4, 8));
        }

        return chunks.join('/');
      }

function startOfDay(date) {
        var base = new Date(date);
        base.setHours(0, 0, 0, 0);
        return base;
      }

function diffDays(fromDate, toDate) {
        var msPerDay = 24 * 60 * 60 * 1000;
        var from = startOfDay(fromDate).getTime();
        var to = startOfDay(toDate).getTime();
        return Math.round((from - to) / msPerDay);
      }

function seededHash(seed) {
        var hash = 2166136261;
        var i;

        for (i = 0; i < seed.length; i += 1) {
          hash ^= seed.charCodeAt(i);
          hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }

        return hash >>> 0;
      }

function seededRandom(seed) {
        var stateSeed = seededHash(seed);

        return function () {
          stateSeed = (stateSeed * 1664525 + 1013904223) >>> 0;
          return stateSeed / 4294967296;
        };
      }

function formatLongDatePt(date) {
        var weekdays = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
        var months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        return weekdays[date.getDay()] + ', ' + date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear();
      }

function formatMonthYearShort(date) {
        return formatMonthPt(date) + ' ' + date.getFullYear();
      }

function formatMonthYearLong(date) {
        var months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return months[date.getMonth()] + ' ' + date.getFullYear();
      }

function nowHm() {
        var now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }

function activityColor(count) {
        if (count <= 0) {
          return 'transparent';
        }
        if (count <= 2) {
          return 'rgba(124, 90, 240, 0.3)';
        }
        if (count <= 4) {
          return 'rgba(124, 90, 240, 0.6)';
        }
        if (count <= 6) {
          return 'rgba(124, 90, 240, 0.85)';
        }
        return 'linear-gradient(90deg, #7c5af0, #00c4cc)';
      }

function activityWidth(count) {
        if (count <= 0) {
          return 0;
        }
        if (count <= 2) {
          return 18;
        }
        if (count <= 4) {
          return 26;
        }
        if (count <= 6) {
          return 34;
        }
        return 40;
      }

function calendarHeat(count) {
        if (count <= 0) {
          return 'rgba(124, 90, 240, 0)';
        }
        if (count <= 2) {
          return 'rgba(124, 90, 240, 0.15)';
        }
        if (count <= 4) {
          return 'rgba(124, 90, 240, 0.30)';
        }
        if (count <= 6) {
          return 'rgba(124, 90, 240, 0.50)';
        }
        return 'rgba(124, 90, 240, 0.75)';
      }

var ChronoTimeline = {};
