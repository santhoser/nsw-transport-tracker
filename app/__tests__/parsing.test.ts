import { parseJourneys, parseLocations } from '../src/api/tripPlanner';
import { minsLabel, punctuality } from '../src/domain/format';

const raw = {
  journeys: [
    {
      legs: [
        {
          duration: 2400,
          origin: { name: 'Macquarie Park, Stand D', parent: { name: 'Macquarie Park' }, departureTimePlanned: '2026-10-27T22:52:00Z', departureTimeEstimated: '2026-10-27T22:52:00Z' },
          destination: { name: 'Blacktown', arrivalTimePlanned: '2026-10-27T23:31:00Z' },
          transportation: { disassembledName: '611', product: { class: 5 }, destination: { name: 'Blacktown' }, properties: { RealtimeTripId: '123' } },
          stopSequence: [{ name: 'A', departureTimePlanned: '2026-10-27T22:52:00Z', coord: [-33.8, 151.1] }],
          coords: [[-33.8, 151.1], [-33.9, 151.0]],
        },
      ],
    },
  ],
};

describe('trip planner parsing', () => {
  it('parses a bus journey', () => {
    const [j] = parseJourneys(raw);
    expect(j.legs).toHaveLength(1);
    expect(j.legs[0]).toMatchObject({ line: '611', mode: 'bus', isWalk: false, realtimeTripId: '123', originPlatform: 'Stand D' });
    expect(j.legs[0].path).toHaveLength(2);
  });

  it('filters locations by mode', () => {
    const places = parseLocations({ locations: [
      { id: '1', name: 'Town Hall Station', type: 'stop', modes: [1, 2], coord: [-33.87, 151.2] },
      { id: '2', name: 'Bus stop', type: 'stop', modes: [5] },
    ] }, 'train');
    expect(places.map((p) => p.id)).toEqual(['1']);
  });
});

describe('format', () => {
  it('describes punctuality', () => {
    expect(punctuality('2026-10-27T23:00:00Z', '2026-10-27T23:00:00Z').kind).toBe('ontime');
    expect(punctuality('2026-10-27T23:00:00Z', '2026-10-26T23:00:00Z').kind).toBe('early');
    expect(punctuality('2026-10-27T23:00:00Z', '2026-10-27T23:05:00Z').label).toContain('5 min late');
    expect(punctuality('2026-10-27T23:00:00Z').kind).toBe('none');
  });
  it('labels minutes', () => {
    expect(minsLabel(0).value).toBe('Now');
    expect(minsLabel(11)).toEqual({ value: '11', unit: 'mins' });
  });
});
