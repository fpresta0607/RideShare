import { Button } from "@/components/ui/button";

interface PreferenceSelectorProps {
  selectedPreference: "price" | "speed" | "luxury";
  onPreferenceChange: (preference: "price" | "speed" | "luxury") => void;
}

export default function PreferenceSelector({ selectedPreference, onPreferenceChange }: PreferenceSelectorProps) {
  const preferences = [
    { key: "price" as const, emoji: "💰", label: "Best Price" },
    { key: "speed" as const, emoji: "⚡", label: "Fastest" },
    { key: "luxury" as const, emoji: "✨", label: "Luxury" },
  ];

  return (
    <section className="bg-white p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">What's most important to you?</h3>
      <div className="grid grid-cols-3 gap-2">
        {preferences.map((pref) => (
          <Button
            key={pref.key}
            variant={selectedPreference === pref.key ? "default" : "outline"}
            className={`px-4 py-3 h-auto flex-col space-y-1 ${
              selectedPreference === pref.key 
                ? "border-primary bg-primary text-white" 
                : "border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => onPreferenceChange(pref.key)}
          >
            <div className="text-sm">{pref.emoji}</div>
            <div className="text-xs">{pref.label}</div>
          </Button>
        ))}
      </div>
    </section>
  );
}
