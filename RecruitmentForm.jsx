import React, { useState } from 'react';

const RecruitmentForm = () => {
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 year: '',
 branch: '',
 track: '',
 linkedin: '',
 github: '',
 paymentReceipt: null
 });

 const handleChange = (e) => {
 const { name, value, files } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: files ? files[0] : value
 }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 // Payment integration and form submission logic goes here
 console.log(formData);
 };

 return (
 <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4">
 <div>
 <label className="block text-sm font-medium">Full Name</label>
 <input type="text" name="name" required onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <div>
 <label className="block text-sm font-medium">Email</label>
 <input type="email" name="email" required onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <div>
 <label className="block text-sm font-medium">Phone Number</label>
 <input type="tel" name="phone" required onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <div>
 <label className="block text-sm font-medium">Academic Year</label>
 <select name="year" required onChange={handleChange} className="w-full border p-2 rounded">
 <option value="">Select Year</option>
 <option value="1">First Year</option>
 <option value="2">Second Year</option>
 <option value="3">Third Year</option>
 <option value="4">Fourth Year</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium">Branch</label>
 <input type="text" name="branch" required onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <div>
 <label className="block text-sm font-medium">Recruitment Track</label>
 <select name="track" required onChange={handleChange} className="w-full border p-2 rounded">
 <option value="">Select Track</option>
 <option value="aiml">AI/ML</option>
 <option value="database">Database</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium">LinkedIn Profile URL</label>
 <input type="url" name="linkedin" required placeholder="https://linkedin.com/in/..." onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <div>
 <label className="block text-sm font-medium">GitHub Profile URL</label>
 <input type="url" name="github" required placeholder="https://github.com/..." onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <div>
 <label className="block text-sm font-medium">Upload Payment Receipt</label>
 <input type="file" name="paymentReceipt" required accept="image/*,application/pdf" onChange={handleChange} className="w-full border p-2 rounded" />
 </div>
 <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Submit Application</button>
 </form>
 );
};

export default RecruitmentForm;

