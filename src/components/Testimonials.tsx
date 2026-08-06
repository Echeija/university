import React from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Current Student, B.Sc Computer Science",
    content: "The flexible pacing at Smart Global College of Technology has allowed me to balance my studies with my full-time job. The e-Learn portal is intuitive and the support from lecturers is outstanding.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    name: "David Chen",
    role: "Alumnus, MBA Program",
    content: "My experience here was transformative. The curriculum is highly relevant to industry needs, and the networking opportunities through the digital platforms helped me secure my current role before even graduating.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    name: "Aisha Mohammed",
    role: "Current Student, Data Science",
    content: "The digital resource library is incredible. I have access to thousands of premium academic materials anywhere, anytime. It truly is education without barriers.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-emerald-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">What Our Community Says</h2>
          <div className="w-24 h-1 bg-emerald-400 mx-auto rounded-full mb-6"></div>
          <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
            Hear from our current students and alumni about their transformative learning experiences at Smart Global College of Technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-xl relative"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-emerald-100" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-slate-700 mb-8 relative z-10 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto border-t border-slate-100 pt-6">
                <img 
                  src={testimonial.imageUrl} 
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mt-1">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
