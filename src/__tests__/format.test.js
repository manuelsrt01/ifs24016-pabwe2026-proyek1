import { describe, expect, it } from 'vitest';
import {
  addDaysIso, consistencyLabel, formatDate, formatDuration, formatMinutes, formatNumber, greeting, initials, todayLocal, toInt, weekdayShort,
} from '../utils/format.js';

describe('format utils', () => {
  it('formatMinutes & formatDuration', () => {
    expect(formatMinutes(0)).toBe('0 mnt');
    expect(formatMinutes(45)).toBe('45 mnt');
    expect(formatMinutes(90)).toBe('1 j 30 mnt');
    expect(formatDuration(345)).toBe('5 Jam 45 mnt');
    expect(formatDuration(60)).toBe('1 Jam');
  });
  it('formatMinutes & formatDuration menangani nilai kosong dan jam bulat', () => {
    expect(formatMinutes(undefined)).toBe('0 mnt');
    expect(formatMinutes(null)).toBe('0 mnt');
    expect(formatMinutes(120)).toBe('2 j');
    expect(formatDuration(undefined)).toBe('0 mnt');
    expect(formatDuration(null)).toBe('0 mnt');
    expect(formatDuration(150)).toBe('2 Jam 30 mnt');
  });
  it('formatNumber memakai 0 untuk nilai kosong dan pemisah ribuan untuk angka besar', () => {
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(1234)).toMatch(/^1[.,]234$/);
  });
  it('formatDate menangani kosong dan tanggal valid', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('2026-10-21')).toContain('2026');
  });
  it('todayLocal memakai tanggal lokal', () => {
    expect(todayLocal(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('addDaysIso lintas bulan', () => {
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDaysIso('2026-10-22', -364)).toBe('2025-10-23');
  });
  it('weekdayShort memakai singkatan hari Indonesia', () => {
    expect(weekdayShort('2026-10-22')).toBe('Kam');
  });
  it('toInt', () => {
    expect(toInt('12')).toBe(12);
    expect(Number.isNaN(toInt('1.5'))).toBe(true);
    expect(Number.isNaN(toInt(''))).toBe(true);
    expect(Number.isNaN(toInt(undefined))).toBe(true);
    expect(Number.isNaN(toInt(null))).toBe(true);
    expect(toInt(' -7 ')).toBe(-7);
  });
  it('greeting menurut jam', () => {
    expect(greeting(6)).toBe('Selamat Pagi');
    expect(greeting(12)).toBe('Selamat Siang');
    expect(greeting(16)).toBe('Selamat Sore');
    expect(greeting(21)).toBe('Selamat Malam');
    expect(greeting(2)).toBe('Selamat Malam');
  });
  it('consistencyLabel mengikuti ambang yang dijelaskan di UI', () => {
    expect(consistencyLabel(0, 7)).toBe('Belum Ada Data');
    expect(consistencyLabel(6, 7)).toBe('Sangat Baik');
    expect(consistencyLabel(4, 7)).toBe('Baik');
    expect(consistencyLabel(2, 7)).toBe('Cukup');
    expect(consistencyLabel(1, 30)).toBe('Perlu Ditingkatkan');
  });
  it('initials', () => {
    expect(initials('Pembaca Budiman')).toBe('PB');
    expect(initials('budi')).toBe('B');
    expect(initials('')).toBe('?');
  });
});
