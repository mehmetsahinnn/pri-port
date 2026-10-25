// Renders the Education / Work timelines from /api/qualifications (editable in
// the admin panel). The static markup in index.html is the fallback: it stays in
// place if the request fails, so the section is never empty.

import { getLang } from './i18n.js?v=20261025';

let data = null;

function pick(field) {
    return field?.[getLang()] || field?.en || '';
}

function content(item) {
    const wrap = document.createElement('div');

    const title = document.createElement('h3');
    title.className = 'qualification__title';
    title.textContent = pick(item.title);

    const org = document.createElement('span');
    org.className = 'qualification__subtitle';
    org.textContent = pick(item.org);

    const calendar = document.createElement('div');
    calendar.className = 'qualification__calendar';
    const icon = document.createElement('i');
    icon.className = 'uil uil-calendar-alt';
    const date = document.createElement('span');
    date.textContent = pick(item.date);
    calendar.append(icon, date);

    wrap.append(title, org, calendar);
    return wrap;
}

function marker(isLast) {
    const wrap = document.createElement('div');
    const rounder = document.createElement('span');
    rounder.className = 'qualification__rounder';
    wrap.append(rounder);
    if (!isLast) {
        const line = document.createElement('span');
        line.className = 'qualification__line';
        wrap.append(line);
    }
    return wrap;
}

// Items alternate sides of the timeline: [content, marker] / [empty, marker, content].
function row(item, index, isLast) {
    const el = document.createElement('div');
    el.className = 'qualification__data';
    if (index % 2 === 0) {
        el.append(content(item), marker(isLast));
    } else {
        el.append(document.createElement('div'), marker(isLast), content(item));
    }
    return el;
}

function render() {
    if (!data) return;
    for (const [type, targetId] of [['education', 'education'], ['work', 'work']]) {
        const target = document.getElementById(targetId);
        const items = data[type];
        if (!target || !Array.isArray(items)) continue;
        target.replaceChildren(...items.map((item, i) => row(item, i, i === items.length - 1)));
    }
}

export async function initQualifications() {
    try {
        const res = await fetch('/api/qualifications');
        if (!res.ok) return;
        data = await res.json();
    } catch {
        return; // keep the static fallback
    }
    render();
    document.addEventListener('langchange', render);
}
