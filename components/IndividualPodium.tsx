import React from 'react';
import { RaceResult } from '../types';
import { Trophy, Medal, Award, Camera, Edit3, User, Sparkles } from 'lucide-react';
import { isTeamParticipation } from '../utils/resultCalculators';

interface IndividualPodiumProps {
    individualResults: RaceResult[];
    photos?: { [bibNumber: string]: string };
    onPhotoClick?: (runner: RaceResult) => void;
    onEditRunner?: (runner: RaceResult) => void;
    compact?: boolean;
    title?: string;
    subtitle?: string;
}

export const IndividualPodium: React.FC<IndividualPodiumProps> = ({
    individualResults,
    photos = {},
    onPhotoClick,
    onEditRunner,
    compact = false,
    title = 'منصة تتويج الأفراد (أبطال السباق 1 • 2 • 3)',
    subtitle = 'المراكز الثلاثة الأولى المتوجة بالميداليات (الذهبية 🥇، الفضية 🥈، البرونزية 🥉)'
}) => {
    if (!individualResults || individualResults.length === 0) {
        return null;
    }

    // Sort runners by rank (or fallback to array order)
    const sorted = [...individualResults].sort((a, b) => a.rank - b.rank);
    const firstPlace = sorted.find(r => r.rank === 1) || sorted[0];
    const secondPlace = sorted.find(r => r.rank === 2) || sorted[1];
    const thirdPlace = sorted.find(r => r.rank === 3) || sorted[2];

    // If no runners available
    if (!firstPlace && !secondPlace && !thirdPlace) {
        return null;
    }

    return (
        <div className={`w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-900/60 ${
            compact ? 'p-3.5 sm:p-5' : 'p-5 sm:p-8'
        } relative overflow-hidden transition-all text-right`}>
            
            {/* Background Decorative Lighting */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 mb-4 border-b border-indigo-900/50">
                <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20">
                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-black text-white tracking-tight flex items-center gap-2`}>
                                <span>{title}</span>
                                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            </h3>
                        </div>
                        <p className="text-xs text-indigo-200/80 mt-0.5">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 no-print">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-700/60 text-indigo-200">
                        النتائج الفردية الرسمية
                    </span>
                </div>
            </div>

            {/* Podium Display (3 Columns in a single coordinated row on all screen sizes) */}
            <div className="relative z-10 pt-2 pb-2">
                <div className={`grid grid-cols-3 ${compact ? 'gap-1.5 sm:gap-3' : 'gap-1.5 sm:gap-4 md:gap-6'} items-end justify-center max-w-4xl mx-auto`}>
                    
                    {/* 2nd Place: Silver Medal (Left) */}
                    <div className="flex flex-col items-center w-full">
                        {secondPlace ? (
                            <div className="w-full flex flex-col items-center group transition-all duration-300 hover:-translate-y-1">
                                {/* Card */}
                                <div className={`w-full bg-slate-800/85 backdrop-blur-md rounded-xl sm:rounded-2xl ${
                                    compact ? 'p-1.5 sm:p-3' : 'p-1.5 sm:p-4'
                                } border-2 border-slate-400/60 shadow-lg text-center flex flex-col items-center justify-between mb-1.5 sm:mb-2 relative overflow-hidden`}>
                                    
                                    {/* Medal Badge */}
                                    <div className="flex flex-col min-[480px]:flex-row items-center justify-between w-full gap-1 mb-1 sm:mb-2">
                                        <span className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-black uppercase px-1.5 sm:px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900 shadow-sm flex items-center gap-0.5 sm:gap-1">
                                            <Medal className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-700" />
                                            <span>الوصيف 🥈</span>
                                        </span>
                                        <span className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-mono font-bold text-slate-300 bg-slate-700/80 px-1 sm:px-2 py-0.5 rounded border border-slate-600">
                                            #{secondPlace.bibNumber}
                                        </span>
                                    </div>

                                    {/* Runner Photo / Avatar */}
                                    <div className="relative my-1 sm:my-2">
                                        <div
                                            onClick={() => onPhotoClick && onPhotoClick(secondPlace)}
                                            className="w-11 h-11 min-[400px]:w-14 min-[400px]:h-14 sm:w-20 sm:h-20 rounded-full bg-slate-700 border-2 sm:border-3 border-slate-300 p-0.5 shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                            title="عرض أو إضافة صورة العداء"
                                        >
                                            {photos[secondPlace.bibNumber] ? (
                                                <img
                                                    src={photos[secondPlace.bibNumber]}
                                                    alt={secondPlace.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-700/80">
                                                    <User className="w-5 h-5 sm:w-8 sm:h-8 opacity-70" />
                                                </div>
                                            )}
                                        </div>
                                        {onPhotoClick && (
                                            <button
                                                type="button"
                                                onClick={() => onPhotoClick(secondPlace)}
                                                className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-400 text-slate-200 shadow-sm transition-colors no-print"
                                                title="إضافة صورة"
                                            >
                                                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Runner Name */}
                                    <h4 className="text-[11px] min-[400px]:text-xs sm:text-base font-black text-white mt-0.5 sm:mt-1 line-clamp-1 max-w-full">
                                        {secondPlace.name}
                                    </h4>

                                    {/* Participation Type Pill */}
                                    <div className="mt-0.5 sm:mt-1">
                                        <span className={`inline-block text-[8px] min-[400px]:text-[9px] sm:text-[10px] font-black px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${
                                            isTeamParticipation(secondPlace.participationType)
                                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                        }`}>
                                            {isTeamParticipation(secondPlace.participationType) ? '🏢 مؤسسة' : '🏃 فردي'}
                                        </span>
                                    </div>

                                    {/* Institution & Province */}
                                    <div className="mt-0.5 sm:mt-1 text-[9px] min-[400px]:text-[10px] sm:text-xs text-slate-300 font-bold max-w-full truncate">
                                        {secondPlace.institution}
                                    </div>
                                    <div className="text-[8px] min-[400px]:text-[9px] sm:text-[11px] text-slate-400 truncate max-w-full hidden min-[380px]:block">
                                        {secondPlace.province}
                                    </div>

                                    {/* Note / Coach if available */}
                                    {secondPlace.coach && (
                                        <div className="mt-1 text-[8px] sm:text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded truncate max-w-full hidden sm:block">
                                            المؤطر: {secondPlace.coach}
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    {onEditRunner && (
                                        <button
                                            type="button"
                                            onClick={() => onEditRunner(secondPlace)}
                                            className="mt-1.5 sm:mt-3 w-full flex items-center justify-center gap-1 text-[9px] sm:text-xs font-bold py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg sm:rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors no-print"
                                        >
                                            <Edit3 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden min-[450px]:inline">تعديل</span>
                                        </button>
                                    )}
                                </div>

                                {/* Pedestal Block (2) */}
                                <div className={`w-full flex flex-col items-center justify-center ${
                                    compact ? 'h-10 min-[400px]:h-14 sm:h-24' : 'h-12 min-[400px]:h-16 sm:h-32 lg:h-36'
                                } bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 rounded-t-xl sm:rounded-t-2xl shadow-lg border-t-2 sm:border-t-4 border-slate-200`}>
                                    <span className="text-xl min-[400px]:text-2xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-md">
                                        2
                                    </span>
                                    <span className="text-[8px] sm:text-[11px] font-bold text-slate-100 uppercase tracking-wider hidden min-[400px]:block">
                                        فضية
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-32 sm:h-48 border-2 border-dashed border-slate-700 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-slate-500 p-2 sm:p-4 text-center">
                                <Medal className="w-5 h-5 sm:w-8 sm:h-8 mb-1 opacity-40" />
                                <span className="text-[10px] sm:text-xs font-bold">المركز 2</span>
                            </div>
                        )}
                    </div>

                    {/* 1st Place: Gold Medal (Center - Elevated) */}
                    <div className="flex flex-col items-center w-full z-10">
                        {firstPlace ? (
                            <div className="w-full flex flex-col items-center group transition-all duration-300 hover:-translate-y-1">
                                
                                {/* Champion Crown / Trophy Badge */}
                                <div className="w-8 h-8 min-[400px]:w-10 min-[400px]:h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg sm:shadow-xl shadow-amber-500/30 -mb-4 min-[400px]:-mb-5 sm:-mb-7 z-20 border-2 sm:border-4 border-slate-900 animate-bounce-subtle">
                                    <Trophy className="w-4 h-4 min-[400px]:w-5 min-[400px]:h-5 sm:w-8 sm:h-8" />
                                </div>

                                {/* Card */}
                                <div className={`w-full bg-gradient-to-b from-amber-950/80 via-slate-800 to-slate-850 rounded-xl sm:rounded-2xl pt-5 min-[400px]:pt-6 sm:pt-9 ${
                                    compact ? 'pb-2 px-1.5 sm:pb-3 sm:px-3' : 'pb-2 px-1.5 sm:pb-5 sm:px-5'
                                } border-2 sm:border-3 border-amber-400 shadow-2xl shadow-amber-500/20 text-center flex flex-col items-center justify-between mb-1.5 sm:mb-2 relative overflow-hidden`}>
                                    
                                    {/* Top Banner */}
                                    <div className="flex flex-col min-[480px]:flex-row items-center justify-between w-full gap-1 mb-1 sm:mb-2">
                                        <span className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-black uppercase px-1.5 sm:px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md flex items-center gap-0.5">
                                            <span>البطل 🥇</span>
                                        </span>
                                        <span className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-mono font-black text-amber-300 bg-amber-950/80 px-1.5 sm:px-2.5 py-0.5 rounded border border-amber-500/50">
                                            #{firstPlace.bibNumber}
                                        </span>
                                    </div>

                                    {/* Runner Photo / Avatar */}
                                    <div className="relative my-1 sm:my-2">
                                        <div
                                            onClick={() => onPhotoClick && onPhotoClick(firstPlace)}
                                            className="w-13 h-13 min-[400px]:w-16 min-[400px]:h-16 sm:w-24 sm:h-24 rounded-full bg-amber-950/60 border-2 sm:border-4 border-amber-400 p-0.5 shadow-xl shadow-amber-500/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform ring-2 sm:ring-4 ring-amber-400/30"
                                            title="عرض أو إضافة صورة البطل"
                                        >
                                            {photos[firstPlace.bibNumber] ? (
                                                <img
                                                    src={photos[firstPlace.bibNumber]}
                                                    alt={firstPlace.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-amber-200 bg-amber-950/40">
                                                    <User className="w-6 h-6 sm:w-10 sm:h-10 opacity-80" />
                                                </div>
                                            )}
                                        </div>
                                        {onPhotoClick && (
                                            <button
                                                type="button"
                                                onClick={() => onPhotoClick(firstPlace)}
                                                className="absolute -bottom-1 -right-1 p-1 sm:p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-colors no-print"
                                                title="إضافة صورة"
                                            >
                                                <Camera className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Runner Name */}
                                    <h4 className="text-xs min-[400px]:text-sm sm:text-xl font-black text-white mt-0.5 sm:mt-1 line-clamp-1 max-w-full">
                                        {firstPlace.name}
                                    </h4>

                                    {/* Participation Type Pill */}
                                    <div className="mt-0.5 sm:mt-1">
                                        <span className={`inline-block text-[8px] min-[400px]:text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2.5 py-0.2 sm:py-0.5 rounded-full border ${
                                            isTeamParticipation(firstPlace.participationType)
                                                ? 'bg-amber-900/90 text-amber-200 border-amber-400/50 shadow-sm'
                                                : 'bg-emerald-900/90 text-emerald-200 border-emerald-400/50 shadow-sm'
                                        }`}>
                                            {isTeamParticipation(firstPlace.participationType) ? '🏢 مؤسسة' : '🏃 فردي'}
                                        </span>
                                    </div>

                                    {/* Institution & Province */}
                                    <div className="mt-0.5 sm:mt-1 text-[10px] min-[400px]:text-xs sm:text-sm font-black text-amber-300 max-w-full truncate">
                                        {firstPlace.institution}
                                    </div>
                                    <div className="text-[8px] min-[400px]:text-[9px] sm:text-xs text-slate-300 font-medium truncate max-w-full hidden min-[380px]:block">
                                        {firstPlace.province}
                                    </div>

                                    {/* Note / Coach if available */}
                                    {firstPlace.coach && (
                                        <div className="mt-1 text-[8px] sm:text-[11px] text-amber-200/90 bg-amber-950/60 border border-amber-500/30 px-1.5 sm:px-2.5 py-0.5 rounded truncate max-w-full hidden sm:block">
                                            المؤطر: {firstPlace.coach}
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    {onEditRunner && (
                                        <button
                                            type="button"
                                            onClick={() => onEditRunner(firstPlace)}
                                            className="mt-1.5 sm:mt-3.5 w-full flex items-center justify-center gap-1 text-[9px] sm:text-xs font-black py-1 sm:py-2 px-1 sm:px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 no-print"
                                        >
                                            <Edit3 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden min-[450px]:inline">تعديل البطل</span>
                                        </button>
                                    )}
                                </div>

                                {/* Pedestal Block (1) */}
                                <div className={`w-full flex flex-col items-center justify-center ${
                                    compact ? 'h-14 min-[400px]:h-20 sm:h-32' : 'h-16 min-[400px]:h-24 sm:h-44 lg:h-52'
                                } bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 rounded-t-xl sm:rounded-t-2xl shadow-2xl border-t-2 sm:border-t-4 border-yellow-200`}>
                                    <span className="text-2xl min-[400px]:text-3xl sm:text-6xl lg:text-7xl font-black text-slate-950 drop-shadow-sm">
                                        1
                                    </span>
                                    <span className="text-[8px] sm:text-xs font-black text-amber-950 uppercase tracking-wider hidden min-[400px]:block">
                                        ذهبية 🥇
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-36 sm:h-56 border-2 border-dashed border-amber-500/50 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-amber-400 p-2 sm:p-4 text-center">
                                <Trophy className="w-6 h-6 sm:w-10 sm:h-10 mb-1 opacity-50" />
                                <span className="text-[10px] sm:text-sm font-bold">بطل السباق 1</span>
                            </div>
                        )}
                    </div>

                    {/* 3rd Place: Bronze Medal (Right) */}
                    <div className="flex flex-col items-center w-full">
                        {thirdPlace ? (
                            <div className="w-full flex flex-col items-center group transition-all duration-300 hover:-translate-y-1">
                                {/* Card */}
                                <div className={`w-full bg-slate-800/85 backdrop-blur-md rounded-xl sm:rounded-2xl ${
                                    compact ? 'p-1.5 sm:p-3' : 'p-1.5 sm:p-4'
                                } border-2 border-amber-700/60 shadow-lg text-center flex flex-col items-center justify-between mb-1.5 sm:mb-2 relative overflow-hidden`}>
                                    
                                    {/* Medal Badge */}
                                    <div className="flex flex-col min-[480px]:flex-row items-center justify-between w-full gap-1 mb-1 sm:mb-2">
                                        <span className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-black uppercase px-1.5 sm:px-2.5 py-0.5 rounded-full bg-amber-700 text-amber-100 shadow-sm flex items-center gap-0.5 sm:gap-1">
                                            <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-200" />
                                            <span>المرتبة 3 🥉</span>
                                        </span>
                                        <span className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-slate-700/80 px-1 sm:px-2 py-0.5 rounded border border-amber-700/50">
                                            #{thirdPlace.bibNumber}
                                        </span>
                                    </div>

                                    {/* Runner Photo / Avatar */}
                                    <div className="relative my-1 sm:my-2">
                                        <div
                                            onClick={() => onPhotoClick && onPhotoClick(thirdPlace)}
                                            className="w-11 h-11 min-[400px]:w-14 min-[400px]:h-14 sm:w-20 sm:h-20 rounded-full bg-slate-700 border-2 sm:border-3 border-amber-600/80 p-0.5 shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                            title="عرض أو إضافة صورة العداء"
                                        >
                                            {photos[thirdPlace.bibNumber] ? (
                                                <img
                                                    src={photos[thirdPlace.bibNumber]}
                                                    alt={thirdPlace.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-amber-200/70 bg-slate-700/80">
                                                    <User className="w-5 h-5 sm:w-8 sm:h-8 opacity-70" />
                                                </div>
                                            )}
                                        </div>
                                        {onPhotoClick && (
                                            <button
                                                type="button"
                                                onClick={() => onPhotoClick(thirdPlace)}
                                                className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 rounded-full bg-amber-800 hover:bg-amber-700 text-amber-100 shadow-sm transition-colors no-print"
                                                title="إضافة صورة"
                                            >
                                                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Runner Name */}
                                    <h4 className="text-[11px] min-[400px]:text-xs sm:text-base font-black text-white mt-0.5 sm:mt-1 line-clamp-1 max-w-full">
                                        {thirdPlace.name}
                                    </h4>

                                    {/* Participation Type Pill */}
                                    <div className="mt-0.5 sm:mt-1">
                                        <span className={`inline-block text-[8px] min-[400px]:text-[9px] sm:text-[10px] font-black px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${
                                            isTeamParticipation(thirdPlace.participationType)
                                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                        }`}>
                                            {isTeamParticipation(thirdPlace.participationType) ? '🏢 مؤسسة' : '🏃 فردي'}
                                        </span>
                                    </div>

                                    {/* Institution & Province */}
                                    <div className="mt-0.5 sm:mt-1 text-[9px] min-[400px]:text-[10px] sm:text-xs text-amber-200/90 font-bold max-w-full truncate">
                                        {thirdPlace.institution}
                                    </div>
                                    <div className="text-[8px] min-[400px]:text-[9px] sm:text-[11px] text-slate-400 truncate max-w-full hidden min-[380px]:block">
                                        {thirdPlace.province}
                                    </div>

                                    {/* Note / Coach if available */}
                                    {thirdPlace.coach && (
                                        <div className="mt-1 text-[8px] sm:text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded truncate max-w-full hidden sm:block">
                                            المؤطر: {thirdPlace.coach}
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    {onEditRunner && (
                                        <button
                                            type="button"
                                            onClick={() => onEditRunner(thirdPlace)}
                                            className="mt-1.5 sm:mt-3 w-full flex items-center justify-center gap-1 text-[9px] sm:text-xs font-bold py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg sm:rounded-xl bg-amber-900/60 hover:bg-amber-900/90 text-amber-200 border border-amber-700/50 transition-colors no-print"
                                        >
                                            <Edit3 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden min-[450px]:inline">تعديل</span>
                                        </button>
                                    )}
                                </div>

                                {/* Pedestal Block (3) */}
                                <div className={`w-full flex flex-col items-center justify-center ${
                                    compact ? 'h-8 min-[400px]:h-10 sm:h-20' : 'h-10 min-[400px]:h-14 sm:h-24 lg:h-28'
                                } bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-t-xl sm:rounded-t-2xl shadow-lg border-t-2 sm:border-t-4 border-amber-400/80`}>
                                    <span className="text-xl min-[400px]:text-2xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-md">
                                        3
                                    </span>
                                    <span className="text-[8px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wider hidden min-[400px]:block">
                                        برونزية
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-32 sm:h-48 border-2 border-dashed border-slate-700 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-slate-500 p-2 sm:p-4 text-center">
                                <Award className="w-5 h-5 sm:w-8 sm:h-8 mb-1 opacity-40" />
                                <span className="text-[10px] sm:text-xs font-bold">المركز 3</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
