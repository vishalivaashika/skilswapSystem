import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApprovedSkills } from '@/hooks/useSupabase';
import { Search, Star, Award, Filter, SlidersHorizontal, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  'All', 'Python', 'Java', 'C++', 'Web Development', 'Artificial Intelligence',
  'Machine Learning', 'Data Structures', 'Database Systems', 'Cloud Computing', 'Technology',
];

const Marketplace = () => {
  const { data: skills = [], isLoading } = useApprovedSkills();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || (skill as any).mentorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return (b.rating as number) - (a.rating as number);
      case 'credits-low': return a.credits - b.credits;
      case 'credits-high': return b.credits - a.credits;
      default: return b.review_count - a.review_count;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Technology Skills Marketplace</h1>
        <p className="text-muted-foreground">Discover technology skills from talented peers and book your next learning session</p>
      </div>

      <div className="card-elevated p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search skills or mentors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12" />
          </div>
          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="credits-low">Credits: Low to High</SelectItem>
                <SelectItem value="credits-high">Credits: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 lg:hidden scrollbar-hide">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-6"><p className="text-sm text-muted-foreground">Showing {sortedSkills.length} skill{sortedSkills.length !== 1 ? 's' : ''}</p></div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSkills.map((skill) => (
          <div key={skill.id} className="card-elevated-hover overflow-hidden group">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Link to={`/teacher/${skill.mentor_id}`} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
                  <span className="text-lg font-semibold text-primary-foreground">{((skill as any).mentorName || 'U').charAt(0)}</span>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/teacher/${skill.mentor_id}`} className="font-medium text-foreground truncate block hover:text-primary transition-colors">{(skill as any).mentorName || 'Unknown'}</Link>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    <span className="text-sm text-muted-foreground">{skill.rating} ({skill.review_count})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mb-3">{skill.category}</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">{skill.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{skill.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{skill.credits}</span>
                  <span className="text-sm text-muted-foreground">credits</span>
                </div>
                <Link to={`/book/${skill.id}`}><Button size="sm">Book Session</Button></Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedSkills.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No skills found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>Clear Filters</Button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
