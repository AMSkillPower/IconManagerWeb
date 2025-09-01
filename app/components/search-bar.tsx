'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Tag, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (tags: string[]) => void;
  searchTags: string[];
}

export function SearchBar({ onSearch, searchTags }: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/images/tags');
        const result = await response.json();
        if (result.success) {
          setAvailableTags(result.tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleSearch = () => {
    if (searchInput.trim()) {
      const newTags = searchInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const allTags = Array.from(new Set([...searchTags, ...newTags]));
      onSearch(allTags);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    if (!searchTags.includes(tag)) {
      onSearch([...searchTags, tag]);
    }
    setSearchInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onSearch(searchTags.filter(tag => tag !== tagToRemove));
  };

  const clearSearch = () => {
    onSearch([]);
    setSearchInput('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = availableTags.filter(tag => 
    tag.toLowerCase().includes(searchInput.toLowerCase()) && 
    !searchTags.includes(tag)
  );

  return (
    <div className="space-y-6 p-4">
      {/* Barra di ricerca moderna con gradient */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-lg">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Cerca per tag... (es. natura, animali, città)"
                className="pl-12 pr-4 py-3 text-lg bg-white/80 backdrop-blur-sm border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!searchInput.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              <Search className="h-5 w-5 mr-2" />
              Cerca
            </Button>
            {searchTags.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearSearch}
                className="px-4 py-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl shadow-sm"
              >
                <X className="h-5 w-5 mr-2" />
                Pulisci
              </Button>
            )}
          </div>
        </div>

        {/* Suggerimenti migliorati */}
        {showSuggestions && searchInput && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            <div className="p-2 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Suggerimenti
              </span>
            </div>
            {filteredSuggestions.slice(0, 8).map((tag, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
                onClick={() => addTag(tag)}
              >
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Tag className="h-3 w-3 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag selezionati con design migliorato */}
      {searchTags.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              Filtri attivi:
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {searchTags.length} {searchTags.length === 1 ? 'filtro' : 'filtri'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchTags.map((tag, index) => (
              <Badge key={index} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-full px-3 py-1 cursor-pointer transition-all duration-200 shadow-sm">
                {tag}
                <X
                  className="ml-2 h-3 w-3 hover:text-red-200 transition-colors"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tag popolari con grid responsive */}
      {searchTags.length === 0 && availableTags.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold text-gray-700">Tag popolari:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {availableTags.slice(0, 12).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-indigo-300 rounded-lg px-3 py-2 text-center transition-all duration-200 hover:shadow-sm"
                onClick={() => addTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}