
import { RaceResult, TeamResult } from '../types';
import { isTeamParticipation } from './resultCalculators';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// TypeScript declarations for libraries loaded via CDN
declare global {
  interface Window {
    saveAs: (blob: Blob, filename: string) => void;
    XLSX: any;
    jspdf: any;
    html2canvas: any;
    Capacitor: any;
  }
}

// Helper function to convert a Blob to a base64 string for Capacitor Filesystem API
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',', 2)[1];
            resolve(base64);
        };
        reader.readAsDataURL(blob);
    });
};

const isNative = () => {
    return Capacitor.isNativePlatform();
};

const canShareNative = async () => {
    if (!isNative()) return false;
    try {
        // Basic check for the Share plugin
        return true;
    } catch (e) {
        return false;
    }
};


// Generic function to save a file using Capacitor Share API with a fallback to Web Share API/direct download
const saveAndShareFile = async (fileName: string, data: Blob) => {
    // 1. Native Mobile Logic (Android/iOS)
    if (await canShareNative()) {
        try {
            const base64Data = await blobToBase64(data);
            
            // Write file to the Cache directory.
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
            });

            // Use Capacitor's Share plugin with 'files' array
            await Share.share({
                files: [savedFile.uri], 
                dialogTitle: 'حفظ أو مشاركة الملف'
            });
            
            return; 
        } catch (error: any) {
            // Handle user cancellation or errors
            if (error.message && (error.message.toLowerCase().includes('canceled') || error.message.toLowerCase().includes('cancelled'))) {
                 return;
            }
            console.error('Capacitor native share failed:', error);
            alert(`عذراً، حدث خطأ أثناء مشاركة الملف. \n${error.message || error}`);
            return;
        }
    }
    
    // 2. Web Fallback Logic
    try {
        const file = new File([data], fileName, { type: data.type });
        
        // Try Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: fileName,
                });
                return;
            } catch (shareError: any) {
                if (shareError.name === 'AbortError') return;
                console.warn("Web Share API failed, falling back to download.", shareError);
            }
        }
        
        // Direct download for Desktop
        (window as any).saveAs(data, fileName);
        
    } catch (error: any) {
        console.error(`All save methods failed for ${fileName}:`, error);
        alert(`فشل في حفظ الملف: ${fileName}.`);
    }
};

export const exportBackupToJson = async (data: any) => {
    try {
        const fileName = `Backup_CrossCountry_${new Date().getTime()}.json`;
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        await saveAndShareFile(fileName, blob);
    } catch (error) {
        console.error("Backup failed:", error);
        alert("فشل إنشاء النسخة الاحتياطية.");
    }
};

export const exportTemplateToExcel = async () => {
    try {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("مكتبة تصدير الملفات غير متاحة.");
            return;
        }

        // Define the exact headers expected by FileUploadStep
        const headers = [
            'رقم الصدرية', 
            'الاسم الكامل', 
            'رقم المسار', 
            'تاريخ الازدياد', 
            'المؤسسة', 
            'المؤطر', 
            'الفئة', 
            'الجنس', 
            'نوع المشاركة',
            'المديرية الإقليمية', 
            'الأكاديمية الجهوية', 
            'الصورة'
        ];

        // Create a worksheet with just the headers
        const worksheet = XLSX.utils.aoa_to_sheet([headers]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج فارغ');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8" });
        
        await saveAndShareFile(`Empty_Database_Template.xlsx`, data);

    } catch (error) {
        console.error("Failed to export template:", error);
        alert("حدث خطأ أثناء إنشاء ملف النموذج.");
    }
};

export const exportListToExcel = async (fileName: string, runners: RaceResult[], photos: { [bib: string]: string } = {}) => {
    try {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("مكتبة تصدير الملفات غير متاحة.");
            return;
        }

        const sortedRunners = [...runners].sort((a, b) => a.rank - b.rank);

        const wsData = sortedRunners.map(r => ({
            'الترتيب': r.rank,
            'الاسم الكامل': r.name,
            'نوع المشاركة': r.participationType || 'فردي',
            'المؤسسة': r.institution,
            'المديرية الإقليمية': r.province,
            'الأكاديمية الجهوية': r.academy,
            'الفئة': r.category,
            'الجنس': r.gender,
            'المؤطر': r.coach,
            'رقم مسار': r.trackId,
            'تاريخ الازدياد': r.dob,
            'رقم الصدرية': r.bibNumber,
            'ملاحظات': r.note || '',
            'كود الصورة': photos[r.bibNumber] ? photos[r.bibNumber].split(',')[1] : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(wsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'النتائج');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8" });
        
        const safeTitle = fileName.replace(/[^a-z0-9أ-ي ]/gi, '_').substring(0, 30);
        const timestamp = new Date().getTime();
        await saveAndShareFile(`${safeTitle}_${timestamp}.xlsx`, data);

    } catch (error) {
        console.error("Failed to export specific list to Excel:", error);
        alert("حدث خطأ أثناء إنشاء ملف Excel.");
    }
};

export const exportToExcel = async (title: string, individualResults: RaceResult[], teamResults: TeamResult[], photos: { [bib: string]: string } = {}) => {
    try {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("مكتبة تصدير الملفات غير متاحة.");
            return;
        }

        const workbook = XLSX.utils.book_new();
        
        const sortedIndividuals = [...individualResults].sort((a, b) => a.rank - b.rank);

        // 1. Individual Results Sheet
        const individualSheet = XLSX.utils.json_to_sheet(sortedIndividuals.map(r => ({
            'الترتيب': r.rank,
            'الاسم': r.name,
            'نوع المشاركة': r.participationType || 'فردي',
            'المؤسسة': r.institution,
            'المديرية الإقليمية': r.province,
            'الأكاديمية الجهوية': r.academy,
            'المؤطر': r.coach,
            'الفئة': r.category,
            'الجنس': r.gender,
            'رقم مسار': r.trackId,
            'رقم الصدرية': r.bibNumber,
            'تاريخ الازدياد': r.dob,
            'كود الصورة': photos[r.bibNumber] ? photos[r.bibNumber].split(',')[1] : ''
        })));
        XLSX.utils.book_append_sheet(workbook, individualSheet, 'النتائج الفردية');
        
        // 2. Team Summary Sheet
        if (teamResults.length > 0) {
            const teamSheet = XLSX.utils.json_to_sheet(teamResults.map(t => ({
                'الترتيب': t.rank,
                'المؤسسة': t.institution, 
                'مجموع النقاط': t.totalRank,
                'ترتيبات الأفراد': t.allRanks ? t.allRanks.join(', ') : t.topFourRanks.join(', '),
            })));
            XLSX.utils.book_append_sheet(workbook, teamSheet, 'نتائج الفرق (ملخص)');

            // 3. Detailed Team Runners Sheet
            const teamDetailsData: any[] = [];
            teamResults.forEach(team => {
                const teamMembers = sortedIndividuals
                    .filter(r => r.institution === team.institution && isTeamParticipation(r.participationType));

                teamMembers.forEach(member => {
                    teamDetailsData.push({
                        'ترتيب الفريق': team.rank,
                        'المؤسسة': team.institution,
                        'مجموع نقاط الفريق': team.totalRank,
                        'ترتيب العداء': member.rank,
                        'اسم العداء': member.name,
                        'نوع المشاركة': member.participationType || 'فريق المؤسسة',
                        'المديرية الإقليمية': member.province,
                        'الأكاديمية الجهوية': member.academy,
                        'رقم الصدرية': member.bibNumber,
                        'الفئة': member.category,
                        'الجنس': member.gender,
                        'المؤطر': member.coach,
                        'تاريخ الازدياد': member.dob
                    });
                });
            });

            if (teamDetailsData.length > 0) {
                const teamDetailsSheet = XLSX.utils.json_to_sheet(teamDetailsData);
                XLSX.utils.book_append_sheet(workbook, teamDetailsSheet, 'تفاصيل عدائي الفرق');
            }
        }

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8" });
        
        const safeTitle = title.replace(/[^a-z0-9أ-ي ]/gi, '_').substring(0, 30);
        const timestamp = new Date().getTime();
        await saveAndShareFile(`Results_${safeTitle}_${timestamp}.xlsx`, data);

    } catch (error) {
        console.error("Failed to generate Excel file:", error);
        alert("حدث خطأ غير متوقع أثناء إنشاء ملف Excel.");
    }
};

export const exportQualifiedToWord = async (raceTitle: string, qualifiedRunners: RaceResult[], photos: { [bibNumber: string]: string } = {}, docTitle?: string) => {
    const title = docTitle ? `${docTitle} - ${raceTitle}` : `لائحة المؤهلين للمشاركة في البطولة الجهوية - ${raceTitle}`;
    
    const sortedRunners = [...qualifiedRunners].sort((a, b) => {
        if (a.institution < b.institution) return -1;
        if (a.institution > b.institution) return 1;
        return a.rank - b.rank;
    });

    let currentInstitution = "";
    const rows = sortedRunners.map(r => {
        let institutionRow = '';
        if (r.institution !== currentInstitution) {
            currentInstitution = r.institution;
            institutionRow = `
                <tr>
                    <td colspan="13" style="text-align: center; border: 1px solid black; padding: 8px; background-color: #e0e0e0; font-weight: bold;">
                        ${currentInstitution}
                    </td>
                </tr>
            `;
        }
        
        const photoHtml = photos[r.bibNumber] 
            ? `<img src="${photos[r.bibNumber]}" width="50" height="50" style="width:50px; height:50px; object-fit:cover; border-radius:50%;" alt="Photo"/>` 
            : '&nbsp;';

        const runnerRow = `
            <tr>
                <td style="text-align: center; border: 1px solid black; padding: 5px;">${r.rank}</td>
                <td style="border: 1px solid black; padding: 5px; text-align: center;">${photoHtml}</td>
                <td style="border: 1px solid black; padding: 5px;">${r.name}</td>
                <td style="border: 1px solid black; padding: 5px; text-align: center;">${r.participationType || 'فردي'}</td>
                <td style="border: 1px solid black; padding: 5px;">${r.institution}</td>
                <td style="border: 1px solid black; padding: 5px;">${r.academy}</td>
                <td style="border: 1px solid black; padding: 5px;">${r.category}</td>
                <td style="border: 1px solid black; padding: 5px;">${r.gender}</td>
                <td style="border: 1px solid black; padding: 5px;">${r.coach}</td>
                <td style="text-align: center; border: 1px solid black; padding: 5px;">${r.trackId}</td>
                <td style="border: 1px solid black; padding: 5px; mso-number-format:'\\@'">${r.dob}</td>
                <td style="text-align: center; border: 1px solid black; padding: 5px;">${r.bibNumber}</td>
                <td style="text-align: center; border: 1px solid black; padding: 5px;">${r.note || ''}</td>
            </tr>
        `;
        return institutionRow + runnerRow;
    }).join('');

    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                table { border-collapse: collapse; width: 100%; }
                th, td { text-align: right; }
            </style>
        </head>
        <body>
            <h2 style="text-align: center;">${title}</h2>
            <table border="1" style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">الترتيب</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">الصورة</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">الاسم الكامل</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">نوع المشاركة</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">المؤسسة</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">الأكاديمية</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">الفئة</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">الجنس</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">المؤطر</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">رقم مسار</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">تاريخ الازدياد</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">رقم الصدرية</th>
                        <th style="text-align: center; border: 1px solid black; padding: 5px; background-color: #f2f2f2;">ملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    
    const safeTitle = raceTitle.replace(/[^a-z0-9أ-ي ]/gi, '_').substring(0, 30);
    const timestamp = new Date().getTime();
    await saveAndShareFile(`Qualified_${safeTitle}_${timestamp}.doc`, blob);
};

export const exportResultsToPdf = async (title: string, individualResults: RaceResult[], teamResults: TeamResult[], photos: { [bibNumber: string]: string }) => {
    try {
        const { jsPDF } = (window as any).jspdf;
        if (!jsPDF) {
             alert("مكتبة PDF غير متوفرة.");
             return;
        }

        const doc = new jsPDF('p', 'pt', 'a4');
        
        // Create a container for the report
        const reportContainer = document.createElement('div');
        reportContainer.style.width = '595px'; // A4 width in px (approx)
        reportContainer.style.padding = '20px';
        reportContainer.style.direction = 'rtl';
        reportContainer.style.fontFamily = 'Arial, sans-serif';
        reportContainer.style.backgroundColor = 'white';
        reportContainer.style.position = 'absolute';
        reportContainer.style.top = '-10000px';
        reportContainer.style.left = '0';
        
        let htmlContent = `
            <h1 style="text-align:center; margin-bottom: 20px;">${title}</h1>
            <h2 style="text-align:right; border-bottom: 1px solid #ccc; padding-bottom: 5px;">الترتيب الفردي</h2>
            <table style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">الترتيب</th>
                        <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">الصورة</th>
                        <th style="border: 1px solid #ddd; padding: 6px;">الاسم</th>
                        <th style="border: 1px solid #ddd; padding: 6px;">المؤسسة</th>
                        <th style="border: 1px solid #ddd; padding: 6px;">الأكاديمية</th>
                        <th style="border: 1px solid #ddd; padding: 6px; text-align:center;">رقم الصدرية</th>
                    </tr>
                </thead>
                <tbody>
        `;

        individualResults.forEach(r => {
             const photoSrc = photos[r.bibNumber] || '';
             const imgHtml = photoSrc ? `<img src="${photoSrc}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;" />` : '';
             
             htmlContent += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${r.rank}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${imgHtml}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${r.name}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${r.institution}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${r.academy}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${r.bibNumber}</td>
                </tr>
             `;
        });

        htmlContent += `</tbody></table>`;

        if (teamResults.length > 0) {
            htmlContent += `
                <h2 style="text-align:right; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px;">ترتيب الفرق</h2>
                <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الترتيب</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">المؤسسة</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">مجموع النقاط</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            teamResults.forEach(t => {
                htmlContent += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${t.rank}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${t.institution}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${t.totalRank}</td>
                    </tr>
                `;
            });
            htmlContent += `</tbody></table>`;
        }

        reportContainer.innerHTML = htmlContent;
        document.body.appendChild(reportContainer);

        await doc.html(reportContainer, {
            callback: async (doc: any) => {
                const safeTitle = title.replace(/[^a-z0-9أ-ي ]/gi, '_').substring(0, 30);
                const timestamp = new Date().getTime();
                const filename = `Results_${safeTitle}_${timestamp}.pdf`;
                
                if (isNative()) {
                     const pdfOutput = doc.output('blob');
                     await saveAndShareFile(filename, pdfOutput);
                } else {
                     doc.save(filename);
                }
                document.body.removeChild(reportContainer);
            },
            x: 10,
            y: 10,
            width: 575, 
            windowWidth: 650 
        });

    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("حدث خطأ أثناء إنشاء ملف PDF.");
    }
};
