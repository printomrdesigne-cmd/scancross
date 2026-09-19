
import { RaceResult, TeamResult } from '../types';

/**
 * Checks if a runner's participation type belongs to the School Team ("فريق المؤسسة")
 */
export const isTeamParticipation = (participationType?: string): boolean => {
    if (!participationType) return false;
    const p = participationType.trim().toLowerCase();
    return p.includes('فريق') || p.includes('مؤسسة') || p.includes('équipe') || p.includes('equipe') || p.includes('team');
};

/**
 * Checks if a runner's participation type is Individual ("فردي")
 */
export const isIndividualParticipation = (participationType?: string): boolean => {
    if (!participationType) return true; // Default fallback is Individual
    return !isTeamParticipation(participationType);
};

export const calculateTeamResults = (finishedRunners: RaceResult[]): TeamResult[] => {
    // Group only runners with participation type "فريق المؤسسة" by Institution
    const resultsByGroup: { [key: string]: RaceResult[] } = {};

    finishedRunners.forEach(runner => {
        // Enforce the participation type condition: runner must belong to a team
        if (!isTeamParticipation(runner.participationType)) {
            return;
        }

        const key = runner.institution?.trim();
        if (!key) return; 

        if (!resultsByGroup[key]) {
            resultsByGroup[key] = [];
        }
        resultsByGroup[key].push(runner);
    });

    const potentialTeams: any[] = [];

    // Filter for institutions with at least 4 team runners and get top 4
    for (const groupName in resultsByGroup) {
        if (resultsByGroup[groupName].length >= 4) {
            const allMembers = resultsByGroup[groupName]
                .sort((a, b) => a.rank - b.rank);
            
            const topFour = allMembers.slice(0, 4);
            
            const totalRank = topFour.reduce((sum, runner) => sum + runner.rank, 0);
            const topFourRanks = topFour.map(r => r.rank);
            const allRanks = allMembers.map(r => r.rank);
            const fourthRunnerRank = topFour[3].rank;

            potentialTeams.push({
                institution: groupName,
                totalRank,
                topFourRanks,
                allRanks,
                fourthRunnerRank
            });
        }
    }

    // Sort teams: lowest total score wins
    potentialTeams.sort((a, b) => {
        // Primary sort by total rank (lower is better)
        if (a.totalRank !== b.totalRank) {
            return a.totalRank - b.totalRank;
        }
        // Tie-breaker: rank of the 4th runner (lower is better)
        return a.fourthRunnerRank - b.fourthRunnerRank;
    });

    // Assign final rank
    return potentialTeams.map((team, index) => ({
        ...team,
        rank: index + 1
    }));
};

/**
 * Calculates and extracts runners participating individually, ordered and indexed with individual rank
 */
export const calculateIndividualRankings = (finishedRunners: RaceResult[]): (RaceResult & { individualRank: number })[] => {
    const individualRunners = finishedRunners
        .filter(r => isIndividualParticipation(r.participationType))
        .sort((a, b) => a.rank - b.rank);

    return individualRunners.map((runner, index) => ({
        ...runner,
        individualRank: index + 1
    }));
};

