'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Tag } from 'lucide-react';

interface SearchBarProps {
  onSearch: (tags: string[]) => void;
  searchTags: string[];
}

export function SearchBar({ onSearch, searchTags }: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Carica i tag disponibili
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
    <div className="space-y-4">
      {/* Barra di ricerca */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Cerca per tag... (es. natura, animali, città)"
              className="pl-10"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchInput.trim()}>
            Cerca
          </Button>
          {searchTags.length > 0 && (
            <Button variant="outline" onClick={clearSearch}>
              <X className="h-4 w-4 mr-2" />
              Pulisci
            </Button>
          )}
        </div>

        {/* Suggerimenti */}
        {showSuggestions && searchInput && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map((tag, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => addTag(tag)}
              >
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag selezionati */}
      {searchTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 self-center">Filtri attivi:</span>
          {searchTags.map((tag, index) => (
            <Badge key={index} variant="default" className="cursor-pointer">
              {tag}
              <X
                className="ml-2 h-3 w-3 hover:text-red-200"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Tag popolari */}
      {searchTags.length === 0 && availableTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-gray-500">Tag popolari:</span>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 10).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
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