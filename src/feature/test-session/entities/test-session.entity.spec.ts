import { TestSession } from './test-session.entity';

describe('Unit Test: TestSession Entity', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env.APP_URL = 'http://localhost:3000';
  });

  it('must set fields correctly', () => {
    const testSession = new TestSession();
    testSession.id = 'test-1';
    testSession.titleAtTaken = 'Test Story';
    testSession.passageAtTaken = 'Test passage\ntest Passage2';

    expect(testSession.id).toBe('test-1');
    expect(testSession.titleAtTaken).toBe('Test Story');
    expect(testSession.passageAtTaken).toBe('Test passage\ntest Passage2');
  });

  it('must compute imageAtTakenUrl correctly when image exists', () => {
    const testSession = new TestSession();
    testSession.imageAtTaken = '/public/images/story-1.jpg';
    expect(testSession.imageAtTakenUrl).toBe(
      'http://localhost:3000/public/images/story-1.jpg',
    );
  });

  it('must return null for imageAtTakenUrl when no image', () => {
    const testSession = new TestSession();
    expect(testSession.imageAtTakenUrl).toBeNull();
  });

  it('must compute remainingTimeInSeconds correctly for active session', () => {
    const testSession = new TestSession();
    const now = new Date();
    testSession.startedAt = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 minutes ago

    const remainingTime = testSession.remainingTimeInSeconds;
    expect(remainingTime).toBeGreaterThan(5300);
    expect(remainingTime).toBeLessThan(5401);
  });

  it('must return 0 remainingTimeInSeconds for finished session', () => {
    const testSession = new TestSession();
    testSession.startedAt = new Date('2025-01-01');
    testSession.finishedAt = new Date('2025-01-01');
    expect(testSession.remainingTimeInSeconds).toBe(0);
  });

  it('must return 0 remainingTimeInSeconds when time exceeded', () => {
    const testSession = new TestSession();
    testSession.startedAt = new Date('2025-01-01'); // Way past the 120 minutes limit
    expect(testSession.remainingTimeInSeconds).toBe(0);
  });
});
