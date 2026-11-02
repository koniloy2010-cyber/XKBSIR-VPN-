import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeDistortionCurve,
  mapDbToGain,
  clamp,
  calculateVoiceSyncModulation,
  getBeatTriggers,
  calculateBoostedGain,
  make1000XSoftClipperCurve,
  map300ScaleToGain,
  calculate30000XGain,
} from './audioMath.ts';

test('makeDistortionCurve creates valid normalized float array', () => {
  const curve = makeDistortionCurve(50, 1024);
  assert.equal(curve.length, 1024);
  // Center (silence) should be 0
  assert.ok(Math.abs(curve[512]) < 0.05);
  // Ends should be bounded within -1 and 1
  for (let i = 0; i < curve.length; i++) {
    assert.ok(curve[i] >= -1 && curve[i] <= 1, `Value out of bounds at ${i}: ${curve[i]}`);
  }
});

test('mapDbToGain correctly transforms decibels to linear gain', () => {
  assert.equal(Math.round(mapDbToGain(0) * 100) / 100, 1);
  assert.ok(mapDbToGain(6) > 1.9 && mapDbToGain(6) < 2.1); // ~ +6dB is approx 2x
  assert.ok(mapDbToGain(-6) > 0.49 && mapDbToGain(-6) < 0.51); // ~ -6dB is approx 0.5x
});

test('clamp restricts values to min and max', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('calculateVoiceSyncModulation handles threshold and scaling', () => {
  // Below threshold
  assert.equal(calculateVoiceSyncModulation(0.01, 1.5, 0.02), 0);
  // Above threshold
  const mod = calculateVoiceSyncModulation(0.1, 1.5, 0.02);
  assert.ok(mod > 0 && mod <= 1);
  // Saturated input
  assert.equal(calculateVoiceSyncModulation(0.9, 2.0, 0.02), 1);
});

test('getBeatTriggers returns expected rhythmic events', () => {
  const beat0 = getBeatTriggers(0, 'trap');
  assert.equal(beat0.kick, true);
  assert.equal(beat0.snare, false);

  const beat4 = getBeatTriggers(4, 'trap');
  assert.equal(beat4.snare, true);
});

test('calculateBoostedGain applies scaled multiplier when enabled', () => {
  assert.equal(calculateBoostedGain(1.0, 1000, false), 1.0);
  const boosted = calculateBoostedGain(1.0, 1000, true);
  assert.ok(boosted > 50, `Boosted gain should be massive: ${boosted}`);
});

test('make1000XSoftClipperCurve produces bounded soft saturation', () => {
  const curve = make1000XSoftClipperCurve(512);
  assert.equal(curve.length, 512);
  for (let i = 0; i < curve.length; i++) {
    assert.ok(curve[i] >= -1 && curve[i] <= 1);
  }
});

test('map300ScaleToGain correctly maps display values to audio gain', () => {
  assert.equal(map300ScaleToGain(0), 0);
  assert.equal(map300ScaleToGain(100), 1.0);
  assert.equal(map300ScaleToGain(200), 3.0);
  assert.equal(map300ScaleToGain(300), 5.0);
});

test('calculate30000XGain scales smoothly and safely', () => {
  assert.equal(calculate30000XGain(30000, false), 1.0);
  const boost = calculate30000XGain(30000, true);
  assert.ok(boost > 15 && boost < 25, `Expected substantial punch: ${boost}`);
});
