import React, { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Search, Printer, FileText, Download, Building, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';

export default function Transcripts() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [matricNumber, setMatricNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumber) return;
    setIsLoading(true);
    setTranscriptData(null);
    try {
      const res = await fetch('/api/admin/transcripts/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ matricNumber })
      });
      if (res.ok) {
        const data = await res.json();
        setTranscriptData(data);
      } else {
        const err = await res.json();
        notify({ title: 'Error', message: err.error || 'Student not found or transcript unavailable', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'Failed to fetch transcript', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Transcript_${transcriptData?.student?.matricNumber || 'Student'}`,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Official Transcripts</h1>
          <p className="text-slate-500">Generate and print official academic transcripts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Enter Student Matric Number"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isLoading ? 'Generating...' : 'Generate Transcript'}
          </button>
        </form>
      </div>

      {transcriptData && (
        <div className="space-y-4">
          <div className="flex justify-end gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-8 md:p-12 overflow-x-auto">
              <div ref={printRef} className="bg-white p-8 min-w-[800px] text-black">
                {/* Transcript Header */}
                <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                  {transcriptData.institution?.logo ? (
                    <img src={transcriptData.institution.logo} alt="Logo" className="h-20 mx-auto mb-4" />
                  ) : (
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Building className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
                    {transcriptData.institution?.name || 'UNIVERSITY SYSTEM'}
                  </h1>
                  <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-700 mb-2">Official Academic Transcript</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>TR NO: {transcriptData.metadata?.transcriptNumber}</span>
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                  <div className="space-y-2">
                    <div className="flex border-b border-slate-200 pb-1">
                      <span className="font-semibold w-1/3">Name:</span>
                      <span className="w-2/3 uppercase">{transcriptData.student.name}</span>
                    </div>
                    <div className="flex border-b border-slate-200 pb-1">
                      <span className="font-semibold w-1/3">Matric No:</span>
                      <span className="w-2/3">{transcriptData.student.matricNumber}</span>
                    </div>
                    <div className="flex border-b border-slate-200 pb-1">
                      <span className="font-semibold w-1/3">Programme:</span>
                      <span className="w-2/3">{transcriptData.student.programme || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex border-b border-slate-200 pb-1">
                      <span className="font-semibold w-1/3">Faculty:</span>
                      <span className="w-2/3">{transcriptData.student.faculty || 'N/A'}</span>
                    </div>
                    <div className="flex border-b border-slate-200 pb-1">
                      <span className="font-semibold w-1/3">Department:</span>
                      <span className="w-2/3">{transcriptData.student.department || 'N/A'}</span>
                    </div>
                    <div className="flex border-b border-slate-200 pb-1">
                      <span className="font-semibold w-1/3">Date Issued:</span>
                      <span className="w-2/3">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Academic History */}
                <div className="space-y-8">
                  {transcriptData.sessions.map((sessionGroup: any, idx: number) => (
                    <div key={idx} className="break-inside-avoid">
                      <h3 className="font-bold text-lg border-b border-slate-400 mb-3 bg-slate-50 px-2 py-1">
                        {sessionGroup.session} - {sessionGroup.semester} Semester
                      </h3>
                      <table className="w-full text-sm mb-4">
                        <thead>
                          <tr className="border-b-2 border-slate-800 text-left">
                            <th className="py-2 pr-4 font-semibold w-24">Course Code</th>
                            <th className="py-2 pr-4 font-semibold">Course Title</th>
                            <th className="py-2 px-2 font-semibold text-center w-16">Units</th>
                            <th className="py-2 px-2 font-semibold text-center w-16">Score</th>
                            <th className="py-2 px-2 font-semibold text-center w-16">Grade</th>
                            <th className="py-2 pl-4 font-semibold text-right w-20">Grade Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sessionGroup.courses.map((course: any, cidx: number) => (
                            <tr key={cidx}>
                              <td className="py-1.5 pr-4 font-medium">{course.code}</td>
                              <td className="py-1.5 pr-4">{course.title}</td>
                              <td className="py-1.5 px-2 text-center">{course.credits}</td>
                              <td className="py-1.5 px-2 text-center">{course.score !== null ? course.score : '-'}</td>
                              <td className="py-1.5 px-2 text-center font-semibold">{course.grade || '-'}</td>
                              <td className="py-1.5 pl-4 text-right">{course.qualityPoint !== null ? course.qualityPoint.toFixed(2) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end gap-6 text-sm font-semibold p-2 bg-slate-50 rounded-lg">
                        <span>Semester GPA: {sessionGroup.gpa.toFixed(2)}</span>
                        <span>Credit Units: {sessionGroup.totalCreditUnits}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Summary */}
                <div className="mt-12 pt-6 border-t-2 border-slate-800 flex justify-between items-start break-inside-avoid">
                  <div className="space-y-2 text-sm max-w-sm">
                    <p className="font-bold border-b border-slate-200 pb-1">Grading System</p>
                    <p>A = 5.0 (70-100)</p>
                    <p>B = 4.0 (60-69)</p>
                    <p>C = 3.0 (50-59)</p>
                    <p>D = 2.0 (45-49)</p>
                    <p>E = 1.0 (40-44)</p>
                    <p>F = 0.0 (0-39)</p>
                  </div>
                  
                  <div className="bg-slate-100 p-6 rounded-xl min-w-[300px]">
                    <h3 className="font-bold text-lg mb-4 text-center border-b border-slate-300 pb-2">Final Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-semibold">
                        <span>Total Earned Credits:</span>
                        <span>{transcriptData.summary.totalEarnedCredits}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Quality Points:</span>
                        <span>{transcriptData.summary.totalQualityPoints.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-slate-300">
                        <span>Final CGPA:</span>
                        <span>{transcriptData.summary.cgpa.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-emerald-700">
                        <span>Classification:</span>
                        <span>{transcriptData.summary.classification}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Signatures */}
                <div className="mt-20 pt-10 flex justify-between items-end break-inside-avoid">
                  <div className="text-center w-48">
                    <div className="border-t border-slate-800 pt-2 font-bold text-sm">Registrar / Academic Officer</div>
                  </div>
                  <div className="text-center w-48">
                    <div className="border-t border-slate-800 pt-2 font-bold text-sm">Date</div>
                  </div>
                </div>
                
                {transcriptData.metadata?.verificationCode && (
                  <div className="mt-12 pt-6 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500 break-inside-avoid">
                    <div className="flex items-center gap-4">
                      <QRCodeSVG value={`${window.location.origin}/verify-transcript/${transcriptData.metadata.verificationCode}`} size={64} level="M" />
                      <div>
                        <p className="font-bold text-slate-700 mb-1">Verify this Transcript</p>
                        <p>Scan the QR code or visit:</p>
                        <p className="font-mono text-emerald-700 break-all max-w-[300px]">
                            {window.location.origin}/verify-transcript/{transcriptData.metadata.verificationCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p>Generated At: {new Date(transcriptData.metadata.generatedAt).toLocaleString()}</p>
                        <p>TR No: {transcriptData.metadata.transcriptNumber}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
