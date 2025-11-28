export class LevelsOverviewDTO {
  levels: LevelDTO[];
  levelsCount: number;
  storiesCount: number;
}

export class LevelDTO {
  id: number;
  no: number;
  name: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LevelWithStoriesDTO {
  levelId: number;
  levelName: string;
  stories: StoryDTO[];
}

export class StoryDTO {
  id: number;
  title: string;
  description?: string | null | undefined;
}
