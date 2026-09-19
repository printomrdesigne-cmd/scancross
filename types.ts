
export interface Runner {
    bibNumber: string;
    institution: string;
    coach: string;
    category: string;
    gender: string;
    name: string;
    trackId: string;
    dob: string;
    province: string;
    academy: string;
    participationType?: string; // نوع المشاركة (فردي / فريق المؤسسة / إلخ)
    photo?: string; // كود الصورة (Base64 data URL)
}

export interface RaceResult extends Runner {
    rank: number;
    note?: string;
    photo?: string;
}

export interface TeamResult {
    institution: string;
    totalRank: number;
    topFourRanks: number[];
    allRanks: number[];
    fourthRunnerRank: number;
    rank: number;
}

export interface SavedRace {
    id: string; // Using ISO string of the date as ID
    date: string;
    config: { distance: string; category: string; gender: string; raceName?: string; };
    individualResults: RaceResult[];
    teamResults: TeamResult[];
    photos: { [bibNumber: string]: string };
}

export type ScanResult = {
    success: true;
    data: RaceResult;
} | {
    success: false;
    error: 'ALREADY_SCANNED' | 'NOT_FOUND' | 'WRONG_RACE';
};
