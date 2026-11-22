import React from 'react';
import Link from 'next/link';
import { Camera, Building2, Flower2, Utensils, Sparkles, Shirt } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  image: string;
  count?: number;
}

const getCategoryIcon = (name: string) => {
  switch (name) {
    case 'Photography & Videography':
      return Camera;
    case 'Wedding Venues':
      return Building2;
    case 'Decoration & Florist':
      return Flower2;
    case 'Catering Services':
      return Utensils;
    case 'Makeup & Styling':
      return Sparkles;
    case 'Wedding Fashion':
      return Shirt;
    default:
      return Flower2;
  }
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
  const Icon = getCategoryIcon(name);

  return (
    <Link
      href={`/services?category=${encodeURIComponent(name)}`}
      className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent group-hover:from-rose-950/80 transition-colors" />

      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:bg-rose-500 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-serif text-lg font-bold leading-snug drop-shadow-sm group-hover:text-rose-200 transition-colors">
          {name}
        </h4>
        <p className="text-xs text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0 duration-300">
          Explore Vendors &rarr;
        </p>
      </div>
    </Link>
  );
};
