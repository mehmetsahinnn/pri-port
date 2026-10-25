// Qualification items: defaults, validation and storage helpers shared by the
// public and the admin endpoint.
//
// Item shape (each text field is { en, tr }; tr falls back to en when empty):
//   { id, type: 'education' | 'work', order, title, org, date }
// Lower `order` shows first.

import crypto from 'crypto';
import { readJson, writeJson } from './store.js';

export const KEY = 'qualifications';
export const TYPES = ['education', 'work'];
const MAX_TEXT = 200;
const MAX_ITEMS = 100;

const t = (en, tr) => ({ en, tr });

// What the site showed before it became editable; used until the first admin save.
export const DEFAULT_ITEMS = [
  { id: 'edu-msc', type: 'education', order: 10,
    title: t('M.Sc. in Computer Engineering', 'Bilgisayar Mühendisliği Yüksek Lisans'),
    org: t('Istanbul Technical University', 'İstanbul Teknik Üniversitesi'),
    date: t('October, 2025 - June, 2027', 'Ekim 2025 - Haziran 2027') },
  { id: 'edu-bsc', type: 'education', order: 20,
    title: t('B.Sc. in Computer Engineering', 'Bilgisayar Mühendisliği Lisans'),
    org: t('Eskisehir Technical University', 'Eskişehir Teknik Üniversitesi'),
    date: t('September, 2020 - June, 2025', 'Eylül 2020 - Haziran 2025') },
  { id: 'edu-react', type: 'education', order: 30,
    title: t('Web Programming with React Certificate', 'React ile Web Programlama Sertifikası'),
    org: t('BTK Akademi', 'BTK Akademi'),
    date: t('August 2023', 'Ağustos 2023') },
  { id: 'edu-java', type: 'education', order: 40,
    title: t('Mid-Level Web Development With Java Certificate', 'Java ile Orta Seviye Web Geliştirme Sertifikası'),
    org: t('Patika Dev', 'Patika Dev'),
    date: t('July 2023', 'Temmuz 2023') },
  { id: 'work-dev', type: 'work', order: 10,
    title: t('Software Developer', 'Yazılım Geliştirici'),
    org: t('Turkcell', 'Turkcell'),
    date: t('July, 2025 - Present', 'Temmuz 2025 - Devam ediyor') },
  { id: 'work-part', type: 'work', order: 20,
    title: t('Part Time Software Developer', 'Yarı Zamanlı Yazılım Geliştirici'),
    org: t('Turkcell', 'Turkcell'),
    date: t('August, 2024 - July, 2025', 'Ağustos 2024 - Temmuz 2025') },
  { id: 'work-intern', type: 'work', order: 30,
    title: t('Intern', 'Stajyer'),
    org: t('Galaksiya Bilişim Teknolojileri', 'Galaksiya Bilişim Teknolojileri'),
    date: t('April, 2024 - July, 2024', 'Nisan 2024 - Temmuz 2024') },
];

export class ValidationError extends Error {}

function text(value, label, { required }) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!s) {
    if (required) throw new ValidationError(`${label} is required`);
    return '';
  }
  if (s.length > MAX_TEXT) throw new ValidationError(`${label} is too long (max ${MAX_TEXT})`);
  return s;
}

function localized(value, label) {
  const v = value && typeof value === 'object' ? value : {};
  const en = text(v.en, `${label} (en)`, { required: true });
  return { en, tr: text(v.tr, `${label} (tr)`, { required: false }) || en };
}

// Returns a clean item from untrusted input; throws ValidationError otherwise.
export function sanitizeFields(input) {
  const src = input && typeof input === 'object' ? input : {};
  if (!TYPES.includes(src.type)) throw new ValidationError('type must be "education" or "work"');
  const order = Number(src.order);
  return {
    type: src.type,
    order: Number.isFinite(order) ? Math.round(order) : null,
    title: localized(src.title, 'title'),
    org: localized(src.org, 'org'),
    date: localized(src.date, 'date'),
  };
}

export const sortItems = (items) =>
  [...items].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export async function loadItems() {
  const stored = await readJson(KEY, null);
  return Array.isArray(stored) ? { items: stored, source: 'stored' } : { items: structuredClone(DEFAULT_ITEMS), source: 'default' };
}

export async function saveItems(items) {
  if (items.length > MAX_ITEMS) throw new ValidationError(`At most ${MAX_ITEMS} items`);
  await writeJson(KEY, items);
}

export function newId() {
  return crypto.randomBytes(6).toString('hex');
}

// New items go to the top of their group unless an order is given.
export function defaultOrder(items, type) {
  const orders = items.filter((i) => i.type === type).map((i) => i.order);
  return orders.length ? Math.min(...orders) - 10 : 10;
}
