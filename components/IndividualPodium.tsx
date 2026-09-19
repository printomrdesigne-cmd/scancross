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

            {/* Podium Display (3 Columns on sm+, stacked on mobile) */}
            <div className="relative z-10 pt-2 pb-2">
                <div className={`grid grid-cols-1 sm:grid-cols-3 ${compact ? 'gap-3 sm:gap-4' : 'gap-4 sm:gap-6'} items-end justify-center max-w-4xl mx-auto`}>
                    
                    {/* 2nd Place: Silver Medal (Left on Desktop) */}
                    <div className="order-2 sm:order-1 flex flex-col items-center">
                        {secondPlace ? (
                            <div className="w-full flex flex-col items-center group transition-all duration-300 hover:-translate-y-1">
                                {/* Card */}
                                <div className={`w-full bg-slate-850/90 bg-slate-800/80 backdrop-blur-md rounded-2xl ${
                                    compact ? 'p-3' : 'p-4 sm:p-5'
                                } border-2 border-slate-400/60 shadow-lg text-center flex flex-col items-center justify-between mb-2 relative overflow-hidden`}>
                                    
                                    {/* Medal Badge */}
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900 shadow-sm flex items-center gap-1">
                                            <Medal className="w-3.5 h-3.5 text-slate-700" />
                                            <span>الوصيف 🥈</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-300 bg-slate-700/80 px-2 py-0.5 rounded-lg border border-slate-600">
                                            صدرية #{secondPlace.bibNumber}
                                        </span>
                                    </div>

                                    {/* Runner Photo / Avatar */}
                                    <div className="relative my-2">
                                        <div
                                            onClick={() => onPhotoClick && onPhotoClick(secondPlace)}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-700 border-3 border-slate-300 p-0.5 shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
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
                                                    <User className="w-8 h-8 opacity-70" />
                                                </div>
                                            )}
                                        </div>
                                        {onPhotoClick && (
                                            <button
                                                type="button"
                                                onClick={() => onPhotoClick(secondPlace)}
                                                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-400 text-slate-200 shadow-sm transition-colors no-print"
                                                title="إضافة صورة"
                                            >
                                                <Camera className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Runner Name */}
                                    <h4 className="text-base sm:text-lg font-black text-white mt-1 line-clamp-1">
                                        {secondPlace.name}
                                    </h4>

                                    {/* Participation Type Pill */}
                                    <div className="mt-1">
                                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                            isTeamParticipation(secondPlace.participationType)
                                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                        }`}>
                                            {isTeamParticipation(secondPlace.participationType) ? '🏢 فريق المؤسسة' : '🏃 مشاركة فردية'}
                                        </span>
                                    </div>

                                    {/* Institution & Province */}
                                    <div className="mt-1 text-xs text-slate-300 font-bold max-w-full truncate">
                                        {secondPlace.institution}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate max-w-full">
                                        {secondPlace.province} {secondPlace.academy ? `• ${secondPlace.academy}` : ''}
                                    </div>

                                    {/* Note / Coach if available */}
                                    {secondPlace.coach && (
                                        <div className="mt-1.5 text-[10px] text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-md">
                                            المؤطر: {secondPlace.coach}
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    {onEditRunner && (
                                        <button
                                            type="button"
                                            onClick={() => onEditRunner(secondPlace)}
                                            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 px-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors no-print"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>تعديل المعطيات</span>
                                        </button>
                                    )}
                                </div>

                                {/* Pedestal Block (2) */}
                                <div className={`w-full hidden sm:flex flex-col items-center justify-center ${
                                    compact ? 'h-24' : 'h-32 lg:h-36'
                                } bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 rounded-t-2xl shadow-lg border-t-4 border-slate-200`}>
                                    <span className={`${compact ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-black text-white drop-shadow-md`}>
                                        2
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-100 uppercase tracking-widest mt-0.5">
                                        فضية • SILVER
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-48 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                                <Medal className="w-8 h-8 mb-2 opacity-40" />
                                <span className="text-xs font-bold">في انتظار صاحب المركز 2</span>
                            </div>
                        )}
                    </div>

                    {/* 1st Place: Gold Medal (Center on Desktop - Elevated) */}
                    <div className="order-1 sm:order-2 flex flex-col items-center z-10">
                        {firstPlace ? (
                            <div className="w-full flex flex-col items-center group transition-all duration-300 hover:-translate-y-1">
                                
                                {/* Champion Crown / Trophy Badge */}
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 -mb-6 sm:-mb-7 z-20 border-4 border-slate-900 animate-bounce-subtle">
                                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
                                </div>

                                {/* Card */}
                                <div className={`w-full bg-gradient-to-b from-amber-950/70 via-slate-800 to-slate-850 rounded-2xl pt-8 sm:pt-9 ${
                                    compact ? 'pb-3 px-3' : 'pb-5 px-4 sm:px-6'
                                } border-3 border-amber-400 shadow-2xl shadow-amber-500/10 text-center flex flex-col items-center justify-between mb-2 relative overflow-hidden`}>
                                    
                                    {/* Top Banner */}
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="text-xs font-black uppercase px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md font-sans flex items-center gap-1">
                                            <span>بطل السباق 🥇 الذهب</span>
                                        </span>
                                        <span className="text-xs font-mono font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/50">
                                            صدرية #{firstPlace.bibNumber}
                                        </span>
                                    </div>

                                    {/* Runner Photo / Avatar */}
                                    <div className="relative my-2">
                                        <div
                                            onClick={() => onPhotoClick && onPhotoClick(firstPlace)}
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-950/60 border-4 border-amber-400 p-0.5 shadow-xl shadow-amber-500/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform ring-4 ring-amber-400/30"
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
                                                    <User className="w-10 h-10 opacity-80" />
                                                </div>
                                            )}
                                        </div>
                                        {onPhotoClick && (
                                            <button
                                                type="button"
                                                onClick={() => onPhotoClick(firstPlace)}
                                                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-colors no-print"
                                                title="إضافة صورة"
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Runner Name */}
                                    <h4 className="text-lg sm:text-2xl font-black text-white mt-1 line-clamp-1">
                                        {firstPlace.name}
                                    </h4>

                                    {/* Participation Type Pill */}
                                    <div className="mt-1">
                                        <span className={`inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                                            isTeamParticipation(firstPlace.participationType)
                                                ? 'bg-amber-900/90 text-amber-200 border-amber-400/50 shadow-sm'
                                                : 'bg-emerald-900/90 text-emerald-200 border-emerald-400/50 shadow-sm'
                                        }`}>
                                            {isTeamParticipation(firstPlace.participationType) ? '🏢 فريق المؤسسة' : '🏃 مشاركة فردية'}
                                        </span>
                                    </div>

                                    {/* Institution & Province */}
                                    <div className="mt-1 text-sm font-black text-amber-300 max-w-full truncate">
                                        {firstPlace.institution}
                                    </div>
                                    <div className="text-xs text-slate-300 font-medium truncate max-w-full">
                                        {firstPlace.province} {firstPlace.academy ? `• ${firstPlace.academy}` : ''}
                                    </div>

                                    {/* Note / Coach if available */}
                                    {firstPlace.coach && (
                                        <div className="mt-2 text-[11px] text-amber-200/90 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                                            المؤطر: {firstPlace.coach}
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    {onEditRunner && (
                                        <button
                                            type="button"
                                            onClick={() => onEditRunner(firstPlace)}
                                            className="mt-3.5 w-full flex items-center justify-center gap-1.5 text-xs font-black py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 no-print"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>تعديل معطيات البطل</span>
                                        </button>
                                    )}
                                </div>

                                {/* Pedestal Block (1) */}
                                <div className={`w-full hidden sm:flex flex-col items-center justify-center ${
                                    compact ? 'h-32' : 'h-44 lg:h-52'
                                } bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 rounded-t-2xl shadow-2xl border-t-4 border-yellow-200`}>
                                    <span className={`${compact ? 'text-5xl' : 'text-6xl lg:text-7xl'} font-black text-slate-950 drop-shadow-sm`}>
                                        1
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-widest mt-0.5">
                                        ذهبية • GOLD CHAMPION
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-56 border-2 border-dashed border-amber-500/50 rounded-2xl flex flex-col items-center justify-center text-amber-400 p-4 text-center">
                                <Trophy className="w-10 h-10 mb-2 opacity-50" />
                                <span className="text-sm font-bold">في انتظار بطل السباق (المركز 1)</span>
                            </div>
                        )}
                    </div>

                    {/* 3rd Place: Bronze Medal (Right on Desktop) */}
                    <div className="order-3 sm:order-3 flex flex-col items-center">
                        {thirdPlace ? (
                            <div className="w-full flex flex-col items-center group transition-all duration-300 hover:-translate-y-1">
                                {/* Card */}
                                <div className={`w-full bg-slate-850/90 bg-slate-800/80 backdrop-blur-md rounded-2xl ${
                                    compact ? 'p-3' : 'p-4 sm:p-5'
                                } border-2 border-amber-700/60 shadow-lg text-center flex flex-col items-center justify-between mb-2 relative overflow-hidden`}>
                                    
                                    {/* Medal Badge */}
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-700 text-amber-100 shadow-sm flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-amber-200" />
                                            <span>المرتبة 3 🥉</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-amber-300 bg-slate-700/80 px-2 py-0.5 rounded-lg border border-amber-700/50">
                                            صدرية #{thirdPlace.bibNumber}
                                        </span>
                                    </div>

                                    {/* Runner Photo / Avatar */}
                                    <div className="relative my-2">
                                        <div
                                            onClick={() => onPhotoClick && onPhotoClick(thirdPlace)}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-700 border-3 border-amber-600/80 p-0.5 shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform"
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
                                                    <User className="w-8 h-8 opacity-70" />
                                                </div>
                                            )}
                                        </div>
                                        {onPhotoClick && (
                                            <button
                                                type="button"
                                                onClick={() => onPhotoClick(thirdPlace)}
                                                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-800 hover:bg-amber-700 text-amber-100 shadow-sm transition-colors no-print"
                                                title="إضافة صورة"
                                            >
                                                <Camera className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Runner Name */}
                                    <h4 className="text-base sm:text-lg font-black text-white mt-1 line-clamp-1">
                                        {thirdPlace.name}
                                    </h4>

                                    {/* Participation Type Pill */}
                                    <div className="mt-1">
                                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                            isTeamParticipation(thirdPlace.participationType)
                                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                        }`}>
                                            {isTeamParticipation(thirdPlace.participationType) ? '🏢 فريق المؤسسة' : '🏃 مشاركة فردية'}
                                        </span>
                                    </div>

                                    {/* Institution & Province */}
                                    <div className="mt-1 text-xs text-amber-200/90 font-bold max-w-full truncate">
                                        {thirdPlace.institution}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate max-w-full">
                                        {thirdPlace.province} {thirdPlace.academy ? `• ${thirdPlace.academy}` : ''}
                                    </div>

                                    {/* Note / Coach if available */}
                                    {thirdPlace.coach && (
                                        <div className="mt-1.5 text-[10px] text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-md">
                                            المؤطر: {thirdPlace.coach}
                                        </div>
                                    )}

                                    {/* Edit Button */}
                                    {onEditRunner && (
                                        <button
                                            type="button"
                                            onClick={() => onEditRunner(thirdPlace)}
                                            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 px-2 rounded-xl bg-amber-900/60 hover:bg-amber-900/90 text-amber-200 border border-amber-700/50 transition-colors no-print"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>تعديل المعطيات</span>
                                        </button>
                                    )}
                                </div>

                                {/* Pedestal Block (3) */}
                                <div className={`w-full hidden sm:flex flex-col items-center justify-center ${
                                    compact ? 'h-20' : 'h-24 lg:h-28'
                                } bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-t-2xl shadow-lg border-t-4 border-amber-400/80`}>
                                    <span className={`${compact ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-black text-white drop-shadow-md`}>
                                        3
                                    </span>
                                    <span className="text-[11px] font-bold text-amber-200 uppercase tracking-widest mt-0.5">
                                        برونزية • BRONZE
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-48 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                                <Award className="w-8 h-8 mb-2 opacity-40" />
                                <span className="text-xs font-bold">في انتظار صاحب المركز 3</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
