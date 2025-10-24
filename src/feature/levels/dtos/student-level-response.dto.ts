/**
 * Representing DTO objects that student will receive when requesting level data in their dashboard
 */
export class StudentLevelResponseDTO {
  id: number;
  no: number;
  name: string;
  fullName: string;
  isUnlocked: boolean;
  requiredPoints: number;
  isBonusLevel: boolean;
  maxPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  progress: number;
  stories: StudentStoryResponseDTO[];
}

export class StudentStoryResponseDTO {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  isGoldMedal: boolean;
  isSilverMedal: boolean;
  isBronzeMedal: boolean;
}
