import { Story } from 'src/feature/levels/entities/story.entity';
import { StoryStatus } from 'src/feature/levels/enum/story-status.enum';

describe('Unit Test: Story Entity', () => {
  it('must create a story with default status', () => {
    const story = new Story();
    expect(story.status).toBe(StoryStatus.WAITING_NEWLY);
  });

  it('must set fields correctly', () => {
    const story = new Story();
    story.title = 'Test Story';
    story.passage = 'Test passage';
    story.status = StoryStatus.ACCEPTED;
    expect(story.title).toBe('Test Story');
    expect(story.passage).toBe('Test passage');
    expect(story.status).toBe(StoryStatus.ACCEPTED);
  });

  it('must split passage to sentences correctly', () => {
    const story = new Story();
    story.passage =
      'Test passage\nThis is second sentence! And the third one?. \nFourth sentence.\nfifth sentence';
    expect(story.passageSentences).toEqual([
      'Test passage',
      'This is second sentence! And the third one?',
      'Fourth sentence',
      'fifth sentence',
    ]);
  });

  it('(static passageToSenteces) must split passage to sentences correctly', () => {
    const passage: string =
      'Test passage\nThis is second sentence! And the third one?. \nFourth sentence.\nfifth sentence';
    expect(Story.passageToSentences(passage)).toEqual([
      'Test passage',
      'This is second sentence! And the third one?',
      'Fourth sentence',
      'fifth sentence',
    ]);
  });
});
