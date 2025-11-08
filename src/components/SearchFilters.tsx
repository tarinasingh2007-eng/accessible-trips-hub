import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  accessibility: string;
  setAccessibility: (value: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  season: string;
  setSeason: (value: string) => void;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  accessibility,
  setAccessibility,
  priceRange,
  setPriceRange,
  season,
  setSeason,
}: SearchFiltersProps) => {
  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Beach">Beach</SelectItem>
              <SelectItem value="Cultural">Cultural</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
              <SelectItem value="Wildlife">Wildlife</SelectItem>
              <SelectItem value="Wellness">Wellness</SelectItem>
              <SelectItem value="Cruise">Cruise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accessibility Level</Label>
          <Select value={accessibility} onValueChange={setAccessibility}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="High">High Accessibility</SelectItem>
              <SelectItem value="Medium">Medium Accessibility</SelectItem>
              <SelectItem value="Low">Low Accessibility</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Season</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger>
              <SelectValue placeholder="All Seasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
              <SelectItem value="Winter">Winter</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
              <SelectItem value="Fall">Fall</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
          <Slider
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
