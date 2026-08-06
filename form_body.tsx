          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-500">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm font-bold text-emerald-600">{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
                </div>
              </div>

              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Passport Photograph</label>
                    <div className="flex items-start gap-4">
                      {formData.passport && (
                        <div className="shrink-0">
                          <img src={formData.passport} alt="Passport Preview" className="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-200" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleImageUpload(e, 'passport')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        <p className="text-xs text-slate-500 mt-2 font-medium">Upload a clear, recent passport-sized photograph. Max size: 2MB. Format: JPG or PNG.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                      <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Middle Name</label>
                      <input type="text" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                      <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Registration No</label>
                      <input type="text" value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                      <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Marital Status</label>
                      <select value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium">
                        <option>Single</option>
                        <option>Married</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nationality</label>
                      <select required value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white">
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">State of Origin (Indigene)</label>
                      <input type="text" required value={formData.indigene} onChange={(e) => setFormData({...formData, indigene: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Religion</label>
                      <input type="text" value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                    <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" rows={2}></textarea>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Academic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                      <input type="text" required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course of Study</label>
                      <input type="text" required value={formData.courseOfStudy} onChange={(e) => setFormData({...formData, courseOfStudy: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
                      <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium">
                        <option>100</option>
                        <option>200</option>
                        <option>300</option>
                        <option>400</option>
                        <option>500</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Program of Interest</label>
                    <select 
                      value={formData.programOfInterest}
                      onChange={(e) => setFormData({...formData, programOfInterest: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option>B.Sc. Computer Science</option>
                      <option>B.Sc. Software Engineering</option>
                      <option>B.Eng. Computer Engineering</option>
                      <option>B.Sc. Information Technology</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Next of Kin & Sponsor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Next of Kin Name</label>
                      <input type="text" required value={formData.nextOfKinName} onChange={(e) => setFormData({...formData, nextOfKinName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Next of Kin Address</label>
                      <input type="text" required value={formData.nextOfKinAddress} onChange={(e) => setFormData({...formData, nextOfKinAddress: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sponsor Name</label>
                      <input type="text" required value={formData.sponsorName} onChange={(e) => setFormData({...formData, sponsorName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sponsor Address</label>
                      <input type="text" required value={formData.sponsorAddress} onChange={(e) => setFormData({...formData, sponsorAddress: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Document Uploads</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">First School Leaving Certificate</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'fslcDocument')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.fslcDocument && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">SSCE (WAEC) Result</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'ssceDocument')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.ssceDocument && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">State of Origin Certificate</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'stateOfOriginDocument')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.stateOfOriginDocument && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Other Document 1</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'otherDocument1')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.otherDocument1 && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Other Document 2</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'otherDocument2')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.otherDocument2 && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Other Document 3</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'otherDocument3')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.otherDocument3 && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Other Document 4</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'otherDocument4')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.otherDocument4 && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Other Document 5</label>
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'otherDocument5')} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white" />
                        {formData.otherDocument5 && <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">✓ Uploaded</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 mt-8 border-t border-slate-100 flex justify-between gap-4">
                {currentStep > 1 && (
                  <button type="button" onClick={handlePrev} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
                    Previous
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button type="button" onClick={handleNext} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors ml-auto shadow-lg shadow-emerald-200">
                    Next Step
                  </button>
                ) : (
                  <button type="submit" disabled={isLoading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors ml-auto shadow-lg shadow-emerald-200">
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>

            </form>
