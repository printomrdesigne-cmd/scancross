import React, { useState } from 'react';
import { TeamResult, RaceResult } from '../types';
import { isTeamParticipation } from '../utils/resultCalculators';
import { Trophy, Medal, Award, Users, Eye, EyeOff, LayoutGrid, List, X, User } from 'lucide-react';

interface TeamPodiumProps {
    teamResults: TeamResult[];
    individualResults?: RaceResult[];
    photos?: { [bibNumber: string]: string };
    onViewTeam?: (team: TeamResult) => void;
    compact?: boolean;
    onHide?: () => void;
}

export const TeamPodium: React.FC<TeamPodiumProps> = ({
    teamResults,
    individualResults = [],
    photos = {},
    onViewTeam,
    compact = false,
    onHide
}) => {
    const [viewMode, setViewMode] = useState<'podium' | 'table'>('podium');
    const [internalViewingTeam, setInternalViewingTeam] = useState<TeamResult | null>(null);

    if (teamResults.length === 0) {
        return (
            <div className={`w-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 ${compact ? 'p-5' : 'p-8'} text-center`}>
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    ترتيب الفرق (المؤسسات)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    لم يكتمل نصاب أي مؤسسة بعد (يشترط وصول 4 عدائين على الأقل بنوع مشاركة «فريق المؤسسة» لإدراج المؤسسة في ترتيب الفرق).
                </p>
            </div>
        );
    }

    // Identify top 3 teams
    const firstPlace = teamResults.find(t => t.rank === 1);
    const secondPlace = teamResults.find(t => t.rank === 2);
    const thirdPlace = teamResults.find(t => t.rank === 3);
    const remainingTeams = teamResults.filter(t => t.rank > 3);

    const getTeamDetails = (institution: string) => {
        // Enforce participation type condition for team members
        const members = individualResults.filter(r => r.institution === institution && isTeamParticipation(r.participationType));
        return {
            province: members[0]?.province || '',
            academy: members[0]?.academy || '',
            coach: members[0]?.coach || '',
            memberCount: members.length,
            members: members.sort((a, b) => a.rank - b.rank)
        };
    };

    const handleTeamClick = (team: TeamResult) => {
        if (onViewTeam) {
            onViewTeam(team);
        } else {
            setInternalViewingTeam(team);
        }
    };

    return (
        <div className={`w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 ${
            compact ? 'p-3.5 sm:p-5' : 'p-4 sm:p-7'
        } text-right transition-all`}>
            
            {/* Header with Title & Mode Switcher */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 ${
                compact ? 'pb-3 mb-4' : 'pb-4 mb-6'
            }`}>
                <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-amber-950 rounded-2xl shadow-md shadow-amber-200/50 dark:shadow-none flex-shrink-0">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                    <div>
                        <h3 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-black text-slate-800 dark:text-white flex items-center gap-2`}>
                            <span>منصة تتويج الفرق (البوديوم)</span>
                            <span className="text-xs bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                                {teamResults.length} مؤسسة
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            ترتيب المؤسسات باحتساب مجموع رتب أفضل 4 عدائين (الأقل نقاطاً هو الفائز)
                        </p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-600 no-print">
                    <button
                        type="button"
                        onClick={() => setViewMode('podium')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            viewMode === 'podium'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                        title="عرض البوديوم الرياضي للفرق الثلاث الأولى"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>البوديوم 🏆</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            viewMode === 'table'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                        title="عرض جدول الترتيب الكامل"
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>الجدول 📋</span>
                    </button>
                </div>

                {onHide && (
                    <button
                        type="button"
                        onClick={onHide}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 no-print"
                        title="إخفاء نتائج فرق المؤسسات"
                    >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>إخفاء الفرق</span>
                    </button>
                )}
            </div>

            {viewMode === 'podium' ? (
                <div>
                    {/* Podium Visual Stage */}
                    <div className="pt-2 pb-4 px-1 sm:px-2">
                        <div className={`grid grid-cols-1 sm:grid-cols-3 ${compact ? 'gap-3' : 'gap-4 lg:gap-6'} items-end justify-center max-w-4xl mx-auto`}>
                            
                            {/* 2nd Place: Silver (Left on Desktop) */}
                            {secondPlace ? (
                                <div className="flex flex-col items-center order-2 sm:order-1 transition-all duration-300 hover:-translate-y-1">
                                    {/* Card */}
                                    <div className={`w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 rounded-2xl ${
                                        compact ? 'p-3' : 'p-4 sm:p-5'
                                    } border-2 border-slate-300 dark:border-slate-600 shadow-md text-center flex flex-col items-center justify-between mb-2`}>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-inner mb-1.5 border-2 border-slate-300 dark:border-slate-500">
                                            <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-300" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1.5">
                                            الوصيف 🥈 الفضية
                                        </span>
                                        <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white line-clamp-2 min-h-[2.5rem] flex items-center justify-center leading-snug">
                                            {secondPlace.institution}
                                        </h4>
                                        
                                        {getTeamDetails(secondPlace.institution).province && (
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
                                                {getTeamDetails(secondPlace.institution).province}
                                            </p>
                                        )}

                                        <div className="mt-2.5 py-1.5 px-2.5 bg-white dark:bg-slate-700/70 rounded-xl w-full border border-slate-200 dark:border-slate-600/80">
                                            <div className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 font-mono">
                                                {secondPlace.totalRank}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold">
                                                مجموع النقاط
                                            </div>
                                            <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                                                {secondPlace.topFourRanks.map((r, idx) => (
                                                    <span key={idx} className="text-[10px] font-mono bg-slate-100 dark:bg-slate-600 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300">
                                                        #{r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleTeamClick(secondPlace)}
                                            className="mt-2.5 w-full flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>تفاصيل الفريق</span>
                                        </button>
                                    </div>

                                    {/* Pedestal Block (2) */}
                                    <div className={`w-full hidden sm:flex flex-col items-center justify-center ${
                                        compact ? 'h-20' : 'h-28 lg:h-32'
                                    } bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-t-2xl shadow-inner border-t-4 border-slate-200 dark:border-slate-500`}>
                                        <span className={`${compact ? 'text-3xl' : 'text-4xl lg:text-5xl'} font-black text-white/95 drop-shadow`}>
                                            2
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-100 uppercase tracking-wider mt-0.5">
                                            SILVER
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden sm:block order-2 sm:order-1 opacity-30 text-center p-4">
                                    <div className="h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                                        الرتبة 2 غير متوفرة
                                    </div>
                                </div>
                            )}

                            {/* 1st Place: Gold (Center on Desktop - Elevated) */}
                            {firstPlace && (
                                <div className="flex flex-col items-center order-1 sm:order-2 transition-all duration-300 hover:-translate-y-1 z-10">
                                    {/* Champion Crown / Trophy Icon */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-300/50 dark:shadow-none -mb-5 z-20 border-2 border-white dark:border-slate-800">
                                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>

                                    {/* Card */}
                                    <div className={`w-full bg-gradient-to-b from-amber-50/90 via-yellow-50/50 to-amber-100/40 dark:from-amber-950/40 dark:via-slate-800 dark:to-slate-800 rounded-2xl pt-7 pb-4 px-3 sm:px-5 border-2 border-amber-400 dark:border-amber-500 shadow-xl shadow-amber-200/40 dark:shadow-none text-center flex flex-col items-center justify-between mb-2`}>
                                        <span className="text-xs font-black uppercase px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 mb-1.5 shadow-sm">
                                            بطل السباق 🥇 الذهب
                                        </span>
                                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem] flex items-center justify-center leading-snug">
                                            {firstPlace.institution}
                                        </h4>

                                        {getTeamDetails(firstPlace.institution).province && (
                                            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold mt-0.5 truncate max-w-full">
                                                {getTeamDetails(firstPlace.institution).province}
                                            </p>
                                        )}

                                        <div className="mt-2.5 py-1.5 px-3 bg-white/95 dark:bg-slate-700/90 rounded-xl w-full border border-amber-300 dark:border-amber-500/40 shadow-sm">
                                            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                                                {firstPlace.totalRank}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-300 font-bold">
                                                مجموع النقاط (الأفضل)
                                            </div>
                                            <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                                                {firstPlace.topFourRanks.map((r, idx) => (
                                                    <span key={idx} className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.2 rounded text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                                                        #{r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleTeamClick(firstPlace)}
                                            className="mt-2.5 w-full flex items-center justify-center gap-1 text-xs font-bold py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-200 dark:shadow-none transition-all active:scale-95"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>عرض أبطال الفريق</span>
                                        </button>
                                    </div>

                                    {/* Pedestal Block (1) */}
                                    <div className={`w-full hidden sm:flex flex-col items-center justify-center ${
                                        compact ? 'h-28' : 'h-36 lg:h-44'
                                    } bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700 rounded-t-2xl shadow-xl border-t-4 border-yellow-200 dark:border-amber-400`}>
                                        <span className={`${compact ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-black text-white drop-shadow-md`}>
                                            1
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-black text-yellow-100 uppercase tracking-widest mt-0.5">
                                            CHAMPION
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place: Bronze (Right on Desktop) */}
                            {thirdPlace ? (
                                <div className="flex flex-col items-center order-3 sm:order-3 transition-all duration-300 hover:-translate-y-1">
                                    {/* Card */}
                                    <div className={`w-full bg-gradient-to-b from-amber-50/50 to-orange-50/70 dark:from-slate-800 dark:to-slate-850 rounded-2xl ${
                                        compact ? 'p-3' : 'p-4 sm:p-5'
                                    } border-2 border-amber-600/50 dark:border-amber-700/60 shadow-md text-center flex flex-col items-center justify-between mb-2`}>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-inner mb-1.5 border-2 border-amber-400/60 dark:border-amber-600">
                                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 dark:text-amber-400" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 mb-1.5">
                                            المرتبة 3 🥉 البرونزية
                                        </span>
                                        <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white line-clamp-2 min-h-[2.5rem] flex items-center justify-center leading-snug">
                                            {thirdPlace.institution}
                                        </h4>

                                        {getTeamDetails(thirdPlace.institution).province && (
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
                                                {getTeamDetails(thirdPlace.institution).province}
                                            </p>
                                        )}

                                        <div className="mt-2.5 py-1.5 px-2.5 bg-white dark:bg-slate-700/70 rounded-xl w-full border border-slate-200 dark:border-slate-600/80">
                                            <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 font-mono">
                                                {thirdPlace.totalRank}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold">
                                                مجموع النقاط
                                            </div>
                                            <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                                                {thirdPlace.topFourRanks.map((r, idx) => (
                                                    <span key={idx} className="text-[10px] font-mono bg-slate-100 dark:bg-slate-600 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300">
                                                        #{r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleTeamClick(thirdPlace)}
                                            className="mt-2.5 w-full flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-200 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>تفاصيل الفريق</span>
                                        </button>
                                    </div>

                                    {/* Pedestal Block (3) */}
                                    <div className={`w-full hidden sm:flex flex-col items-center justify-center ${
                                        compact ? 'h-14' : 'h-20 lg:h-24'
                                    } bg-gradient-to-b from-amber-600 to-amber-800 dark:from-amber-700 dark:to-amber-900 rounded-t-2xl shadow-inner border-t-4 border-amber-400/80 dark:border-amber-600`}>
                                        <span className={`${compact ? 'text-3xl' : 'text-4xl lg:text-5xl'} font-black text-white/90 drop-shadow`}>
                                            3
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider mt-0.5">
                                            BRONZE
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden sm:block order-3 sm:order-3 opacity-30 text-center p-4">
                                    <div className="h-20 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                                        الرتبة 3 غير متوفرة
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Remaining Teams (Rank 4+) in sleek ranking table */}
                    {remainingTeams.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                            <h4 className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" />
                                <span>باقي ترتيب المؤسسات المشاركة (من الرتبة 4 فما فوق)</span>
                                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                    {remainingTeams.length} مؤسسة
                                </span>
                            </h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm text-right">
                                    <thead className="bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-xl">
                                        <tr>
                                            <th className="p-2.5 text-center w-14">الرتبة</th>
                                            <th className="p-2.5">المؤسسة التعليمية</th>
                                            <th className="p-2.5">المديرية / الأكاديمية</th>
                                            <th className="p-2.5 text-center">رتب أفضل 4</th>
                                            <th className="p-2.5 text-center w-20">النقاط</th>
                                            <th className="p-2.5 text-center w-24 no-print">التفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {remainingTeams.map((team) => {
                                            const details = getTeamDetails(team.institution);
                                            return (
                                                <tr key={team.institution} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                                                    <td className="p-2.5 text-center font-black text-slate-700 dark:text-slate-300 text-sm">
                                                        {team.rank}
                                                    </td>
                                                    <td className="p-2.5 font-bold text-slate-800 dark:text-white">
                                                        {team.institution}
                                                    </td>
                                                    <td className="p-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                        {details.province || '-'} {details.academy ? `(${details.academy})` : ''}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                                            {team.topFourRanks.map((r, i) => (
                                                                <span key={i} className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded text-slate-600 dark:text-slate-300">
                                                                    #{r}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-2.5 text-center font-mono font-black text-indigo-600 dark:text-indigo-400 text-base">
                                                        {team.totalRank}
                                                    </td>
                                                    <td className="p-2.5 text-center no-print">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTeamClick(team)}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 px-2 py-1 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            <span>عرض</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Full Table View */
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-xs font-bold">
                            <tr>
                                <th className="p-3 text-center w-16">الرتبة</th>
                                <th className="p-3">المؤسسة التعليمية</th>
                                <th className="p-3">المديرية / الأكاديمية</th>
                                <th className="p-3 text-center">رتب أفضل 4 عدائين</th>
                                <th className="p-3 text-center w-24">مجموع النقاط</th>
                                <th className="p-3 text-center w-24 no-print">التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {teamResults.map((team) => {
                                const details = getTeamDetails(team.institution);
                                return (
                                    <tr key={team.institution} className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors ${
                                        team.rank === 1 ? 'bg-amber-50/50 dark:bg-amber-950/20 font-medium' : ''
                                    }`}>
                                        <td className="p-3 text-center">
                                            {team.rank === 1 && (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm">
                                                    1 🥇
                                                </span>
                                            )}
                                            {team.rank === 2 && (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-black text-xs shadow-sm">
                                                    2 🥈
                                                </span>
                                            )}
                                            {team.rank === 3 && (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs shadow-sm">
                                                    3 🥉
                                                </span>
                                            )}
                                            {team.rank > 3 && (
                                                <span className="font-black text-slate-600 dark:text-slate-300 text-sm">
                                                    {team.rank}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 font-bold text-slate-800 dark:text-white">
                                            {team.institution}
                                            {team.rank === 1 && (
                                                <span className="mr-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                                                    بطل السباق 🥇
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
                                            {details.province || '-'} {details.academy ? `(${details.academy})` : ''}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                {team.topFourRanks.map((r, i) => (
                                                    <span key={i} className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300">
                                                        #{r}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-black text-indigo-600 dark:text-indigo-400 text-base">
                                            {team.totalRank}
                                        </td>
                                        <td className="p-3 text-center no-print">
                                            <button
                                                type="button"
                                                onClick={() => handleTeamClick(team)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 px-2.5 py-1 rounded-xl transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>عرض</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Internal Team Modal (if no external modal handler supplied) */}
            {internalViewingTeam && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-right border border-slate-100 dark:border-slate-700">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setInternalViewingTeam(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                                        الرتبة {internalViewingTeam.rank}
                                    </span>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                        {internalViewingTeam.institution}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    مجموع نقاط أفضل 4 عدائين: <span className="font-bold text-indigo-600 font-mono">{internalViewingTeam.totalRank} نقطة</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">عدائين الفريق الواصلين:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {getTeamDetails(internalViewingTeam.institution).members.map((m, idx) => (
                                    <div
                                        key={m.bibNumber}
                                        className={`p-3 rounded-xl border flex items-center justify-between ${
                                            idx < 4
                                                ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                                                : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative">
                                                {photos[m.bibNumber] ? (
                                                    <img
                                                        src={photos[m.bibNumber]}
                                                        alt={m.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-600">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                                <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow">
                                                    #{m.rank}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                                                    {m.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    صدرية: #{m.bibNumber}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                idx < 4
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {idx < 4 ? 'محتسب للنقاط' : 'احتياطي'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 text-center">
                            <button
                                type="button"
                                onClick={() => setInternalViewingTeam(null)}
                                className="px-5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
