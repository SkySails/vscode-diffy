export interface Diff {
  blocks: any[];
  deletedLines: number;
  addedLines: number;
  isGitDiff: boolean;
  oldName: string;
  newName: string;
}

export interface _sharedDiff {
  id: string;
  created: string;
  expiresAt: string;
  diff: Diff[];
  rawDiff: string;
}

export interface DiffyResponse {
  _sharedDiff: _sharedDiff;
}
