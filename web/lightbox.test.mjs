import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describePicture, stepIndex } from './lightbox.js';

test('a picture is captioned by its alt text, with its file named beside it', () => {
  assert.deepEqual(describePicture('http://h/api/files/charts/sales%20q1.png', 'Sales Q1'),
    { title: 'Sales Q1', file: 'sales q1.png', open: 'http://h/api/files/charts/sales%20q1.png' });
});

test('a picture with no alt text, or named after its file, says the file name once', () => {
  assert.deepEqual(describePicture('http://h/api/files/uploads/c1/photo.jpg', ''), { title: 'photo.jpg', file: '', open: 'http://h/api/files/uploads/c1/photo.jpg' });
  assert.equal(describePicture('http://h/api/files/uploads/c1/photo.jpg', 'photo.jpg').file, '');
});

test('a drawing held in its own address has no file and nothing to open', () => {
  assert.deepEqual(describePicture('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%2010%2010%22%3E%3C/svg%3E', 'Drawing'),
    { title: 'Drawing', file: '', open: '' });
});

test('Right after the last picture is the first again, and Left before the first is the last', () => {
  assert.equal(stepIndex(1, 3, 1), 2);
  assert.equal(stepIndex(2, 3, 1), 0);
  assert.equal(stepIndex(0, 3, -1), 2);
  assert.equal(stepIndex(0, 1, 1), 0);
});
