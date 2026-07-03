import { useState } from 'react';
import { Flower2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { AppView } from '../App';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

function LandingPage({ onNavigate }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState('find');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12 max-w-lg">
        <h1 className="font-serif text-5xl md:text-6xl text-forest-800 mb-4 tracking-tight">
          Find Your Flower!
        </h1>
        <p className="text-lg text-forest-600 font-light">
          Discover the flower that reflects your soul
        </p>
      </div>

      {/* Tab Switcher */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-cream-200/50 p-1.5 rounded-xl">
          <TabsTrigger
            value="find"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            Find My Flower
          </TabsTrigger>
          <TabsTrigger
            value="meaning"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            Flower Meaning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="animate-fade-in">
          <Card
            className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1"
            onClick={() => onNavigate('quiz')}
          >
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mb-4">
                <Flower2 className="w-7 h-7 text-sage-600" />
              </div>
              <CardTitle className="font-serif text-2xl text-forest-800">
                Find My Flower
              </CardTitle>
              <CardDescription className="text-forest-600 text-base mt-2">
                Answer a few questions and discover the flower that matches your personality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sage-600 font-medium">
                <span>Start the quiz</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meaning" className="animate-fade-in">
          <Card
            className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1"
            onClick={() => onNavigate('meaning')}
          >
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-rose-500" />
              </div>
              <CardTitle className="font-serif text-2xl text-forest-800">
                Flower Meaning
              </CardTitle>
              <CardDescription className="text-forest-600 text-base mt-2">
                Search any flower and learn what it symbolizes, its myths, and cultural significance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-rose-500 font-medium">
                <span>Search flowers</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Decorative elements */}
      <div className="mt-16 text-center text-forest-400 text-sm">
        <p>Powered by botanical wisdom & AI</p>
      </div>
    </div>
  );
}

export default LandingPage;
